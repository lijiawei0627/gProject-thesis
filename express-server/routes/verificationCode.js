const { verificationCode, updateCode } = require('../controller/user')
const { SuccessModel, ErrorModel, OtherModel } = require('../model/resModel')
var express = require('express');
const { sendEmail } = require('../utils/sendEmails')
const { object } = require('../db/redis');
var router = express.Router();

router.post('/postcode', function(req, res, next) {
  const { email, username, password, code } = req.body
  console.log(email, code)
  const result = verificationCode(username, password)
  result.then(data => {
    if (data.code == code && data.bindemail === email) {
      res.json(new SuccessModel(data, '登录成功'))
    } else {
      res.json(new ErrorModel('验证码错误'))
    }
  })
});

router.get('/getcode', function(req, res, next) {
  const { email, username, password } = req.query
  verificationCode(username, password)
    .then((result) => {
      if (result.bindemail !== email) {
        res.json(new ErrorModel('邮箱错误'))
        return
      } else {
        const options = {
          from: `Vue-Music<1472406718@qq.com>`,
          to: `${email}`,
          subject: "Vue-Music验证码"
        }
        const code = sendEmail(options, true);
        updateCode(code, username)
      }
    })
    .catch((err) => {
      console.log(err)
    })
});

module.exports = router;
