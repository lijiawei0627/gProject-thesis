<template>
  <div class="music-list">
    <!-- 返回按钮 -->
    <div class="back" @click="back">
      <div class="icon-back"></div>
    </div>
    <h1 class="title" v-html="title" ref="title"></h1>
    <!-- 头像区域 -->
    <div class="avatar" ref="avatar">
      <div class="avatar-image" :style="bgStyle"></div>
      <h1 class="avatar-title" v-html="title"></h1>
    </div>
    <!-- 歌手背景图区域 -->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
          <i class="icon-play"></i>
          <span class="text">列表随机播放</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 歌曲列表区域 -->
    <!-- bg-layer 用来实现列表向上滚动时，遮挡住部分歌手区域的背景 -->
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
import SongList from 'base/song-list/song-list'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { prefixStyle } from 'common/js/dom'
import { mapActions } from 'vuex'
import { playlistMixin } from 'common/js/mixin'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')
export default {
  mixins: [playlistMixin],
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default () {
        return []
      }
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollY: 0
    }
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})`
    }
  },
  created () {
    this.probeType = 3
    this.listenScroll = true
  },
  mounted () {
    // 上方歌手背景图片的高度
    this.imageHeight = this.$refs.bgImage.clientHeight
    // bg-layer最多向上偏移的高度
    this.maxTranslateY = -this.imageHeight + RESERVED_HEIGHT
    // 不同浏览器下，背景图的显示高度不同，从而下方的歌曲列表top值也需要随之改变
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    back () {
      this.$router.back()
    },
    selectItem (item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  watch: {
    scrollY (newY) {
      // console.log(this.titleHeight)
      // bg-layer本来是和没有滑动的歌曲列表一起，位于页面的下半部分，
      // 当列表滚动时，bg-layer也会随着列表的移动距离newY而向上偏移，从而实现列表向上滚动时，遮挡住部分歌手背景图，增大列表的显示区域的效果，
      // 但是bg-layer并不是完全偏移至页面顶部，升至更高，而是仍然要保留最顶部的返回箭头区域，所以设置一个背景图的保留高度RESERVED_HEIGHT
      let translateY = Math.max(this.maxTranslateY, newY)
      // console.log(translateY)
      let zIndex = 0
      let scale = 1
      let blur = 0
      const percent = Math.abs(newY / this.imageHeight)
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      this.$refs.avatar.style[transform] = `translate3d(0,${translateY}px,0)`

      if (newY > 0) {
        // 当列表处于顶部仍往下拽时，将背景图放大
        scale = 1 + percent
        zIndex = 60
      } else {
        // 当列表向上滑动时，使背景图片逐渐模糊，模糊的最大值为20
        blur = Math.min(20, percent * 20)
      }
      this.$refs.bgImage.style[transform] = `scale(${scale})`
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`

      if (newY < this.maxTranslateY) {
        // bg-layer滚动到了保留高度的位置
        zIndex = 60
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        this.$refs.avatar.style.display = 'none'
        this.$refs.playBtn.style.display = 'none'
        this.$refs.title.style.display = 'block'
      } else {
        // bg-layer还没有滚动到保留高度的位置
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
        this.$refs.avatar.style.display = ''
        this.$refs.playBtn.style.display = ''
        this.$refs.title.style.display = 'none'
      }
      this.$refs.bgImage.style.zIndex = zIndex
    }
  },
  components: {
    SongList,
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 70
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 70
      width: 80%
      display: none
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-medium-x
      color: $color-dots-lll
    .avatar
      position: absolute
      top: 16%
      left: 10%
      z-index: 70
      .avatar-image
        width: 50px
        height: 50px
        border-radius: 50%
        background-size: cover
      .avatar-title
        no-wrap()
        line-height: 40px
        font-size: $font-size-medium-x
        color: $color-dots-lll
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
      z-index: 50
    .list
      position: absolute
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      z-index: 50
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
