// 建立返回数据的模型
class BaseModel {
  constructor (data, message) {
    console.log(data)
    if (typeof data === 'string') {
      this.message = data
      data = null
    }
    if (data) {
      this.data = data
    }
    if (message) {
      this.message = message
    }
  }
}

class SuccessModel extends BaseModel {
  constructor (data, message) {
    super(data, message)
    this.errno = 0
  }
}

class ErrorModel extends BaseModel {
  constructor (data, message) {
    super(data, message)
    this.errno = -1
  }
}

class OtherModel extends BaseModel {
  constructor (data, message) {
    super(data, message)
    this.errno = 1
  }
}

module.exports = {
  SuccessModel,
  ErrorModel,
  OtherModel
}