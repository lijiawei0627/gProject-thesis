const { exec, escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')

const login = (username, password) => {
  // 预防SQL注入攻击
  username = escape(username)

  // 生成加密密码
  password = genPassword(password)
  password = escape(password)

  const sql1 = `
      select username from users where username=${username}
  `
  const sql2 = `
      select * from users where username=${username} and password=${password}
  `
  return exec(sql1).then(rows => {
    if(!rows[0]) {
      return { errorInfo: '该用户不存在'}
    }
    return exec(sql2).then(rows => {
      // 返回查询结果的第一项
      return rows[0] || { errorInfo: '密码错误' }
    })
  })
}

const register = (username, password, positionInfo, bindemail) => {
  console.log(username ,bindemail)
  // 预防SQL注入攻击
  username = escape(username)

  // 生成加密密码
  password = genPassword(password)
  password = escape(password)

  const sql1 = `
      select username from users where username=${username}
  `
  const sql2 = `
      insert into users (username, password, positionInfo, bindemail) values (${username}, ${password}, ${positionInfo}, '${bindemail}')
  `
  return exec(sql1).then(rows => {
    if(rows[0]) {
      return { errorInfo: '该用户已存在'}
    }
    return exec(sql2).then(rows => {
      return { successInfo: '注册成功，立即登录' }
    })
    // return exec(sql2).then(rows => {
    //   // 返回查询结果的第一项
    //   return rows[0] || { errorInfo: '密码错误' }
    // })
  }).catch(err => {
    console.log(err)
    return { successInfo: '请求错误' }
  })
}

const updatePositionInfo = (positionInfo, username) => {
  const sql = `
    update users set positionInfo=${JSON.stringify(positionInfo)} where username=${username};
  `
  return exec(sql).then(() => {
    return { successInfo: '位置信息更新成功' }
  }, (err) => {
    // console.log(err)
  })
}

const verificationCode = (username, password) => {
  // 预防SQL注入攻击
  username = escape(username)

  // 生成加密密码
  password = genPassword(password)
  password = escape(password)

  const sql = `
      select * from users where username=${username} and password=${password}
  `
  return exec(sql).then(rows => {
    // 返回查询结果的第一项
    return rows[0] || { errorInfo: '密码错误' }
  })
}

const updateCode = (code, username) => {
  const sql = `
    update users set code=${code} where username=${username};
  `
  return exec(sql).then(() => {
    return { successInfo: '验证码更新成功' }
  }, (err) => {
    // console.log(err)
  })
}

module.exports = {
  login,
  register,
  updatePositionInfo,
  verificationCode,
  updateCode
}