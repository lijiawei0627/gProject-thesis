const { login, register, updatePositionInfo } = require('../controller/user')
const { SuccessModel, ErrorModel, OtherModel } = require('../model/resModel')
var express = require('express');
const { sendEmail } = require('../utils/sendEmails')
const { object } = require('../db/redis');
var router = express.Router();

router.post('/login', function(req, res, next) {
  console.log(req.cookies)
  const { username, password, positionInfo } = req.body
  const newPosition = JSON.parse(positionInfo)
  const result = login(username, password)
  result.then(data => {
    if (data.username) {
      // 设置session
      req.session.username = data.username
      req.session.realname = data.realname
      const bindemail = data.bindemail
      console.log(data)

      const oldPosition = JSON.parse(data.positionInfo)
      if (newPosition.province !== oldPosition.province) {
        updatePositionInfo(positionInfo, data.username)
        const options = {
          from: `Vue-Music<1472406718@qq.com>`,
          to: `${bindemail}`,
          subject: "Vue-Music异地登录提醒",
          html: `<div>您的账号在异地登录，登录地为<span style="color:red">${newPosition.province}${newPosition.city}</span></div>`
        }
        sendEmail(options, false)
        res.json(new OtherModel(data, `异地登录,上次登录地为${oldPosition.province}${oldPosition.city}，请使用邮箱验证`))
      } else {
        res.json(new SuccessModel(data, '登录成功'))
      }
      return
    }
    const errRes = Object.assign(new ErrorModel('登录失败'), data)
    res.json(errRes)
  })
});

router.post('/register', function(req, res, next) {
  const { username, password, positionInfo, bindemail } = req.body
  console.log(bindemail)
  const result = register(username, password, JSON.stringify(positionInfo), bindemail)
  result.then(data => {
    if (data.successInfo) {

      // 设置session
      // req.session.username = data.username
      // req.session.realname = data.realname

      res.json(new SuccessModel(data.successInfo))
      return
    }
    const errRes = Object.assign(new ErrorModel(data.errorInfo))
    res.json(errRes)
  })
});

// router.post('favorite', function(req, res, next) {

// })

// router.get('/login-test', (req, res, next) => {
//   if (req.session.username) {
//     res.json({
//       error: 0,
//       msg: '已登录'
//     })
//     return
//   }
//   res.json({
//     error: -1,
//     msg: '未登录'
//   })
// })

// router.get('/session-test', (req, res, next) => {
//   const session = req.session
//   if (session.viewNum == null) {
//     session.viewNum = 0
//   }
//   session.viewNum++
//   res.json({viewNum: session.viewNum})
// })

module.exports = router;
