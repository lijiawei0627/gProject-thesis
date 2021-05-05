var nodemailer = require("nodemailer"); 
// 建立一个SMTP传输连接
var smtpTransport = nodemailer.createTransport({ 
  host: 'smtp.qq.com',//网易163邮箱 smtp.163.com
  port: 465,//网易邮箱端口 25
  auth: {
      user: '1472406718@qq.com', //邮箱账号
      pass: 'nyuzecyovuuafjje'  //邮箱的授权码
  }
}); 
// 邮件选项
var mailOptions = { 
  from: "Vue-Music<1472406718@qq.com>", // 发件人邮件地址
  to: "1227768172@qq.com", // 收件人邮件地址列表
  subject: "Vue-Music验证码", // 标题
  text: "Hello world ✔", // 纯文本内容
  // html: "<b>Hello world ✔</b>" // HTML内容
}
// 发送邮件
// smtpTransport.sendMail(mailOptions, function (err, response) { 
//   if (err) { 
//     console.log(err); 
//   } else { 
//     console.log("Message sent: " + response.message); 
//   } 
// });

function sendEmail (mailOptions, bVerificationCode) {
  // 验证码
  let code = "";
  for (let i = 0; i < 6; i++) {
    let radom = Math.floor(Math.random()*10);
    code += radom;
  }
  console.log(code)
  if (bVerificationCode) {
    mailOptions.html = `<div>您正在获取邮箱验证码,验证码为<span style="color:red">${code}</span>,验证码五分钟内有效</div>`;
  }
  // 发送邮件
  smtpTransport.sendMail(mailOptions, function (err, response) {
    console.log(mailOptions)
    if (err) { 
      console.log(err); 
    } else { 
      console.log("Message sent: " + response.message); 
    }
  });
  return code;
}

// sendEmail(mailOptions, true);
module.exports = {
  sendEmail
};
