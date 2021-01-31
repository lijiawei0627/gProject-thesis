<template>
  <div class="wrapper">
    <div class="header">
      感受阳光，给予希望
    </div>
    <div class="userInfo">
      <div class="id">
          <input name="ID" type="text" placeholder="支持QQ号/邮箱/手机号登录" v-model="username">
      </div>
      <div class="pasw">
          <input name="password" type="password" placeholder="密码" v-model="password">
      </div>
      <button @click="sub">{{subType}}</button>
      <div v-if="subType==='登录'">
        <p class="register">没有账号? <a @click="change">点击创建</a>.</p>
      </div>
      <div v-else>
        <p class="register">已有账号? <a @click="change">立即登录</a>.</p>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
// import axios from 'axios'
export default {
  data () {
    return {
      subType: '登录',
      username: '',
      password: ''
    }
  },
  methods: {
    sub: function () {
      let url = '/api/user'
      url += this.subType === '登录' ? '/login' : '/register'
      const formData = {
        username: this.username,
        password: this.password
      }
      this.$axios.post(url, formData)
        .then(this.getResponse)
    },
    getResponse: function (res) {
      console.log(res)
    },
    change: function () {
      this.subType = this.subType === '登录' ? '注册' : '登录'
      this.username = ''
      this.password = ''
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .wrapper
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background-image: url('./login.jpg')
    background-size: 100% 100%
    .header
      font-size: 25px
      width: 300px
      height: 25px
      line-height: 25px
      margin: 200px auto 0
      text-align: center
      color: $color-theme
    .userInfo
      height: 200px
      width: 100%
      div
        width: 90%
        input
          display: block
          width: 272px
          height: 32px
          margin: auto
          border: 1px solid $color-theme
          color: #333
          border-radius: 4px
          outline: none
      .id
        margin: 20px auto 0px
      .pasw
        margin: 10px auto 15px
      button
        display: block
        width: 278px
        height: 35px
        margin: auto
        border: 1px solid $color-theme
        border-radius: 4px
        font-size: 20px
        color: $color-background
        background-color: $color-theme
      .register
        margin-left: 50px
        color: $color-background
        a
          color: $color-theme
</style>
