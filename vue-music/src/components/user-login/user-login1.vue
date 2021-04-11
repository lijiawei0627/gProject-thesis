<template>
  <div class="wrapper">
    <div class="header">
      感受阳光，给予希望
    </div>
    <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="0px" class="userInfo">
      <el-form-item prop="username" class="id">
        <el-input placeholder="支持QQ号/邮箱/手机号登录" v-model.number="ruleForm.username"></el-input>
      </el-form-item>
      <el-form-item prop="password" class="psw">
        <el-input type="password" placeholder="请输入密码" v-model="ruleForm.password" autocomplete="off" show-password></el-input>
      </el-form-item>
      <el-form-item prop="checkPass" class="confirmPsw" v-show="subType == '注册'">
        <el-input type="password" placeholder="请再次输入确认密码" v-model="ruleForm.checkPass" autocomplete="off" show-password></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">{{subType}}</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
      <div v-if="subType==='登录'">
        <p class="register">没有账号? <a @click="change">点击创建</a>.</p>
      </div>
      <div v-else>
        <p class="register">已有账号? <a @click="change">立即登录</a>.</p>
      </div>
    </el-form>
  </div>
</template>

<script type="text/ecmascript-6">
import axios from 'axios'
export default {
  data () {
    var checkUserName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入手机号'))
      }
      var reP = /^1[3456789]\d{9}$/
      setTimeout(() => {
        if (reP.test(value)) {
          return callback()
        } else {
          return callback(new Error('请输入正确的手机号'))
        }
      }, 200)
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass')
        }
        var pwdRegex = /^(?=.*?[a-z)(?=.*>[A-Z])(?=.*?[0-9])[a-zA-Z0-9]{8,30}$/
        if (pwdRegex.test(value)) {
          return callback()
        } else {
          return callback(new Error('密码中必须包含字母、数字，且密码长度为8-30'))
        }
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      subType: '登录',
      ruleForm: {
        password: '',
        checkPass: '',
        username: ''
      },
      rules: {
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        username: [
          { validator: checkUserName, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    sub: function () {
      let url = '/api/user'
      url += this.subType === '登录' ? '/login' : '/register'
      const formData = {
        username: this.ruleForm.username,
        password: this.ruleForm.password
      }
      debugger
      axios.post(url, formData)
        .then(this.getResponse, (err) => {
          this.$message({
            message: '请求错误',
            type: 'error'
          })
          console.log(err)
        })
        .catch((a) => {
          console.log(a)
        })
    },
    getResponse: function (res) {
      const data = res.data
      if (data.errno === -1) {
        this.$message({
          message: data.errorInfo || data.message,
          type: 'error',
          center: true
        })
      } else if (data.errno === 0) {
        this.clearInput()
        this.handle(data)
      }
    },
    handle: function (data) {
      this.$confirm(data.message, '', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true
      })
        .then(() => {
          if (this.subType === '登录') {
            this.$router.push('/recommend')
            localStorage.isLogin = true
          } else {
            this.subType = '登录'
            this.clearInput()
          }
        })
        .catch(action => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    change: function () {
      this.subType = this.subType === '登录' ? '注册' : '登录'
      this.clearInput()
    },
    clearInput: function () {
      this.ruleForm.username = ''
      this.ruleForm.password = ''
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid, fields) => {
        var fieldKey
        var index = 1
        for (let key in fields) {
          fieldKey = key + index
          index++
        }
        if (valid || (this.subType === '登录' && fieldKey === 'checkPass1')) {
          this.sub()
        } else {
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
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
      display: block
      width: 70%
      margin: 20px auto
      .id
        margin-bottom: 15px
      .psw
        margin-bottom: 15px
      .confirmPsw
        margin-bottom: 30px
      p
        color: #ffffff
</style>
