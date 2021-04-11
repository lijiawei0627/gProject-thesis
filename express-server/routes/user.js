const { login, register } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
var express = require('express');
const { object } = require('../db/redis');
var router = express.Router();

router.post('/login', function(req, res, next) {
  const { username, password } = req.body
  const result = login(username, password)
  result.then(data => {
    if (data.username) {

      // 设置session
      req.session.username = data.username
      req.session.realname = data.realname

      res.json(new SuccessModel(data, '登录成功'))
      return
    }
    const errRes = Object.assign(new ErrorModel('登录失败'), data)
    res.json(errRes)
  })
});

router.post('/register', function(req, res, next) {
  const { username, password } = req.body
  const result = register(username, password)
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
