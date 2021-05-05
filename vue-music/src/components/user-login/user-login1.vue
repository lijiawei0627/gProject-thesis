<template>
  <div class="wrapper">
    <div class="header">
      感受阳光，给予希望
    </div>
    <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="0px" class="userInfo">
      <el-form-item prop="username" class="id" v-if="!remoteLogin">
        <el-input placeholder="支持手机号登录" v-model.number="ruleForm.username"></el-input>
      </el-form-item>
      <el-form-item prop="bindemail" class="id" v-if="subType == '注册'">
        <el-input placeholder="请输入绑定的邮箱号" v-model="ruleForm.bindemail"></el-input>
      </el-form-item>
      <el-form-item prop="password" class="psw" v-if="!remoteLogin">
        <el-input type="password" placeholder="请输入密码" v-model="ruleForm.password" autocomplete="off" show-password></el-input>
      </el-form-item>
      <el-form-item prop="checkPass" class="confirmPsw" v-if="subType == '注册' && !remoteLogin">
        <el-input type="password" placeholder="请再次输入确认密码" v-model="ruleForm.checkPass" autocomplete="off" show-password></el-input>
      </el-form-item>
      <!-- 异地登录邮箱验证 -->
      <el-form-item prop="bindemail" v-if="remoteLogin">
        <el-input placeholder="请输入绑定的邮箱号" v-model="ruleForm.bindemail"></el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="remoteLogin">
        <el-input placeholder="请输入验证码" class="verificationCode" v-model.number="ruleForm.verificationCode"></el-input>
        <el-button class="get-code" @click="getCode('ruleForm')">{{getCodeStatus}}</el-button>
      </el-form-item>
      <el-form-item v-if="remoteLogin">
        <el-button type="success" @click="submitCode()" class="sub-code">提交</el-button>
      </el-form-item>
      <el-form-item v-if="!remoteLogin">
        <el-button type="primary" @click="submitForm('ruleForm')">{{subType}}</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
      <div v-if="subType==='登录'">
        <p class="register" v-if="!remoteLogin">没有账号? <a @click="change">点击创建</a>.</p>
      </div>
      <div v-else>
        <p class="register" v-if="!remoteLogin">已有账号? <a @click="change">立即登录</a>.</p>
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
    var confirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    var validBindEmail = (rule, value, callback) => {
      const reg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确邮箱号'))
      }
    }
    return {
      subType: '登录',
      remoteLogin: false,
      ruleForm: {
        password: '',
        checkPass: '',
        username: '',
        email: '',
        verificationCode: '',
        bindemail: ''
      },
      rules: {
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: confirmPassword, trigger: 'blur' }
        ],
        username: [
          { validator: checkUserName, trigger: 'blur' }
        ],
        bindemail: [
          { validator: validBindEmail, trigger: 'blur' }
        ]
      },
      getCodeStatus: '获取验证码',
      date: 60
    }
  },
  methods: {
    submitCode: function () {
      let formData = {
        email: this.ruleForm.bindemail,
        code: this.ruleForm.verificationCode,
        username: localStorage.username,
        password: localStorage.password
      }
      axios.post('/api/code/postcode', formData)
        .then(this.getResponse)
        .catch((err) => {
          this.$message({
            message: '请求错误',
            type: 'error'
          })
          console.log(err)
        })
    },
    getCode: function (formName) {
      this.$refs[formName].validate((valid, fields) => {
        if (!valid) {
          return false
        }
        if (this.date !== 60) {
          return
        }
        var timer = setInterval(() => {
          if (this.date === 1) {
            clearInterval(timer)
            this.date = 60
            this.getCodeStatus = '获取验证码'
            return
          }
          this.date--
          this.getCodeStatus = `${this.date}秒后重试`
        }, 1000)
        axios.get('/api/code/getcode', {params: {
          email: this.ruleForm.bindemail,
          username: localStorage.username,
          password: localStorage.password
        }})
          .then((res) => {
            this.$message({
              message: res.data.message,
              type: 'error',
              center: true
            })
          })
          .catch((err) => {
            console.log(err)
          })
      })
    },
    sub: function () {
      let url = '/api/user'
      url += this.subType === '登录' ? '/login' : '/register'
      console.log(localStorage.getItem('positionInfo'))
      const positionInfo = localStorage.getItem('positionInfo')
      const formData = {
        username: this.ruleForm.username,
        password: this.ruleForm.password,
        bindemail: this.ruleForm.bindemail,
        positionInfo: positionInfo
      }
      console.log(formData)
      axios.post(url, formData)
        .then(this.getResponse, (err) => {
          this.$message({
            message: '请求错误',
            type: 'error'
          })
          console.log(err)
        })
        .catch((err) => {
          console.log(err)
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
        this.resetForm('ruleForm')
        this.handle(data)
      } else if (data.errno === 1) {
        localStorage.setItem('username', this.ruleForm.username)
        localStorage.setItem('password', this.ruleForm.password)
        this.resetForm('ruleForm')
        this.$message({
          message: data.errorInfo || data.message,
          type: 'success',
          center: true
        })
        this.remoteLogin = true
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
            this.resetForm('ruleForm')
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
      this.resetForm('ruleForm')
    },
    clearInput: function () {
      this.ruleForm.username = ''
      this.ruleForm.password = ''
      this.remoteLogin = false
      this.ruleForm.verificationCode = ''
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
      this.ruleForm.verificationCode = ''
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
      .verificationCode
        width: 60%
      .get-code
        width: 38%
      .sub-code
        width: 100%
      p
        color: #ffffff
</style>
