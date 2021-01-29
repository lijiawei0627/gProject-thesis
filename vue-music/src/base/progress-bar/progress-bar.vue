<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <!-- 歌曲播放进度 -->
      <div class="progress" ref="progress"></div>
      <!-- 总进度条 -->
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <!-- 进度条按钮 -->
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import {prefixStyle} from 'common/js/dom'

const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  created () {
    this.touch = {}
  },
  methods: {
    // 拖动进度条实现播放进度的改变
    progressTouchStart (e) {
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      // 屏幕点击的当前位置 - 屏幕点击的初始位置 = 当前的偏移量
      const deltaX = e.touches[0].pageX - this.touch.startX
      // this.touch.left + deltaX 已有的播放进度+当前的偏移量=当前被拖动到的播放进度
      // 但是被拖动到的播放进度不能超过整个进度条的宽度，所以还要再加上一个Math.min()
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
      this._offset(offsetWidth)
      this.$emit('percentChanging', this._getPercent())
    },
    progressTouchEnd () {
      this.touch.initiated = false
      this._triggerPercent()
    },
    // 点击进度条实现播放进度的改变
    progressClick (e) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
      // this._offset(e.offsetX)
      this._triggerPercent()
    },
    setProgressOffset (percent) {
      if (percent >= 0 && !this.touch.initiated) {
        // progressBar是整个进度条模块，减去进度条按钮的宽度，就是进度条横线部分的宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 进度条横线部分宽度乘上歌曲已经播放的比例，就是歌曲播放进度的宽度
        const offsetWidth = percent * barWidth
        this._offset(offsetWidth)
      }
    },
    _triggerPercent () {
      // 根据进度条的比例改变歌曲的播放进度
      this.$emit('percentChange', this._getPercent())
    },
    _offset (offsetWidth) {
      // 设置歌曲播放进度的进度条宽度
      this.$refs.progress.style.width = `${offsetWidth}px`
      // 用tarnsform实现进度条按钮的位移
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    },
    _getPercent () {
      // 计算当前播放进度条栈总进度条的比例
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      return this.$refs.progress.clientWidth / barWidth
    }
  },
  watch: {
    percent (newPercent) {
      this.setProgressOffset(newPercent)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-dots-ll
          border-radius: 50%
          background: $color-theme
</style>
