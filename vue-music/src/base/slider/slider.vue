<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" :class="{active: currentPageIndex===index}" v-for="(item,index) in dots" :key="index"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import {addClass} from 'common/js/dom'
import BScroll from 'better-scroll'

export default {
  name: 'slider',
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 3000
    }
  },
  data () {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  mounted () {
    // 浏览器通常间隔17ms刷新一次，所以设置20ms后渲染，是一个经验值
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()
      // 轮播图自动轮播
      if (this.autoPlay) {
        this._play()
      }
    }, 20)
    // 解决可视区域大小变化导致轮播图无法正常显示合理宽度的问题
    window.addEventListener('resize', () => {
      // 若页面中还没有选择染出slider，则直接返回
      if (!this.slider || !this.slider.enabled) return
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        if (this.slider.isInTransition) {
          this._onScrollEnd()
        } else {
          if (this.autoPlay) {
            this._play()
          }
        }
        // 重新计算slider的宽度
        this.refresh()
      }, 60)
    })
  },
  methods: {
    refresh () {
      if (this.slider) {
        this._setSliderWidth(true)
        this.slider.refresh()
      }
    },
    _setSliderWidth (isResize) {
      this.children = this.$refs.sliderGroup.children
      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        addClass(child, 'slider-item')
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots () {
      this.dots = new Array(this.children.length)
    },
    _initSlider () {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400
        }
      })
      this.slider.on('scrollEnd', this._onScrollEnd)
    },
    _onScrollEnd () {
      let pageIndex = this.slider.getCurrentPage().pageX
      this.currentPageIndex = pageIndex
      if (this.autoPlay) {
        this._play()
      }
    },
    _play () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.slider.next()
      }, this.interval)
    }
  },
  // 当改组件被销毁的时候，清理定时器
  destroyed () {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
      min-height: 1px
      .slider-group
          position: relative
          overflow: hidden
          white-space: nowrap
          .slider-item
              float: left
              box-sizing: border-box
              overflow: hidden
              text-align: center
              a
                  display: block
                  width: 100%
                  overflow: hidden
                  text-decoration: none
              img
                  display: block
                  width: 100%
      .dots
          position: absolute
          right: 0
          left: 0
          bottom: 12px
          text-align: center
          font-size: 0
          .dot
              display: inline-block
              margin: 0 4px
              width: 8px
              height: 8px
              border-radius: 50%
              background: $color-dots-l
              &.active
                  width: 20px
                  border-radius: 5px
                  background: $color-dots-ll
</style>
