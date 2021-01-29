<template>
  <scroll class="listview"
          :data="data"
          :listenScroll="listenScroll"
          @scroll="scroll"
          :probeType="probeType"
          ref="listview">
    <!-- 左侧歌手列表区域 -->
    <ul>
      <li v-for="(group,index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" :key="item.id" class="list-group-item">
            <img v-lazy="item.avatar" class="avatar"/>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 右侧快速导航区域 -->
    <div class="list-shortcut"
         @touchstart.stop.prevent="onShortCutTouchStart"
         @touchmove.stop.prevent="onShortCutTouchMove"
         @touchend.stop>
      <ul>
        <li v-for="(item,index) in shortCutList"
            :key="index"
            :data-index="index"
            class="item"
            :class="{'current':currentIndex===index}"
        >{{item}}</li>
      </ul>
    </div>
    <!-- 列表顶部固定分组title -->
    <div class="list-fixed">
      <h1 class="fixed-title" v-show="fixedTitle" ref="fixed">{{fixedTitle}}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {getData} from 'common/js/dom'

// 右侧快速导航栏中每个锚点的高度
const ANCHOR_HEIGHT = 18
// 固定title的高度
const TITLE_HEIGHT = 25
export default {
  created () {
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    }
  },
  computed: {
    shortCutList () {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle () {
      // 判断当前是否处于第一组，即“热门”，若是则返回一个空数组，并用v-show隐藏
      // 否则当列表处于“热门”时继续将列表往下拽，会出现两个title
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    selectItem (item) {
      this.$emit('select', item)
    },
    onShortCutTouchStart (e) {
      let anchorIndex = getData(e.target, 'index')
      console.log(anchorIndex)
      let firstTouch = e.touches[0]
      // 初次点击时的锚点位置和索引
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    // 这个事件触发前使用.stop阻止冒泡和.prevent阻止浏览器的原生滚动
    onShortCutTouchMove (e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // 经过的锚点个数 = 导航栏中的位移差 / 每个锚点的高度
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      // 当前的锚点 = 初次点击时的锚点索引 + 经过的锚点个数
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    refresh () {
      this.$refs.listview.refresh()
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    // 使用scroll内部的scrollToElement()方法，根据右侧的锚点，将左侧的歌手列表滚动到对应的位置
    _scrollTo (index) {
      if (!index && index !== 0) {
        return
      }
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      // 第二个参数为滚动动画的持续时间
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      this.scrollY = this.$refs.listview.scroll.y
    },
    // 计算右侧歌手列表中每一组在整个列表中的高度位置
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // 监听左侧歌手列表当前所处的高度，控制右侧快速导航的高亮显示
    scrollY (newY) {
      // newY时当前列表页面被卷曲出去的高度，若卷曲出去了，则为负值
      const listHeight = this.listHeight
      // 当滚动到顶部，newY>0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 当滚动到中间位置
      for (let i = 0; i < this.listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        // 如果是最后一组歌手，或者当前高度落在height1和height2之间，
        // 说明当前处于索引为i的那组歌手中
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // 下一组title距离当前固定title顶部的距离 = 下一组的高度 - 卷曲出去的高度
          this.diff = height2 + newY
          // console.log(this.diff)
          return
        }
      }
      // 当滚动到底部，且-newY>最后一个元素的上限，即最后一组列表很长，占满了当前页面，还卷出去一部分
      this.currentIndex = listHeight.length - 2
    },
    // 监控下一个title和当前的固定title是否重叠，若重叠了，则给固定title添加一个位移的动画，实现平滑的title切换
    diff (newVal) {
      // 如果下一个title与当前固定title顶部的距离大于0，且小于title的高度，说明下一个title和当前的固定title有部分重叠
      // 重叠的时候，便将重叠部分的高度赋值给fixedTop，因为后面位移值是负数，所以这里用小的newVal减去大的TITLE_HEIGHT
      // 若没有重叠，则位移为0
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      // 若当前的位移值就等于计算出来的位移值，说明当前两个title没有重叠，那么就直接返回，不需要对固定title进行处理，
      // 因为对diff的改变是实时监控的，若每次diff改变，都去操作title，效率太低
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 25px
        line-height: 25px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
        border-top: 1px solid $color-theme
        border-radius: 15px 0 0
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 40%
      transform: translateY(-40%)
      width: 20px
      padding: 20px 0
      margin-right: 4px
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
          font-size: $font-size-large
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 25px
        line-height: 25px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
        border-top: 1px solid $color-theme
        border-radius: 15px 0 0
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
