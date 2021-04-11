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
      select username from users where username=${username} and password=${password}
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

const register = (username, password) => {
  // 预防SQL注入攻击
  username = escape(username)

  // 生成加密密码
  password = genPassword(password)
  password = escape(password)

  const sql1 = `
      select username from users where username=${username}
  `
  const sql2 = `
      insert into users (username, password) values(${username}, ${password})
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
  })
}

module.exports = {
  login,
  register
}