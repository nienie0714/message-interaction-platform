// 用户密码校验
var passwordReg418 = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[a-zA-Z0-9_]{4,18}$/
    if (!reg.test(value)) {
      callback(new Error('密码必须是4-18位数字字母下划线'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 消费者校验
var consumerReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[a-zA-Z0-9_]{1,20}$/
    if (!reg.test(value)) {
      callback(new Error('请输入1-20位数字字母下划线'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 资源校验
var resourceReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,25}$/
    if (!reg.test(value)) {
      callback(new Error('请输入1-25位数字字母汉字下划线'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 备注校验
var remarkReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,50}$/
    if (!reg.test(value)) {
      callback(new Error('请输入1-50位数字字母汉字下划线'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 消息类型校验
var msgNoValidator = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[a-zA-Z0-9_]{1,50}$/
    if (!reg.test(value)) {
      callback(new Error('请输入1-50位数字字母下划线'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 消息类型校验
var msgCnValidator = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$/
    if (!reg.test(value)) {
      callback(new Error('请输入1-20位数字字母汉字'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 描述校验
var urlValidator = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[a-zA-Z0-9_/]{1,50}$/
    if (!reg.test(value)) {
      callback(new Error('输入1-50位数字字母汉字下划线/'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 唯一性校验
// basicTableMixin.vue的methods里定义
/* var unique = (rule, value, callback) => {
  if (value != '') {
    let key = rule.field
    let data = {
      key: value
    }
    postData(this.baseUrl + '/checkExist', data).then(response => {
      if (response.code == 0 && response.data.hasOwnProperty('exist')) {
        if (response.data.exist > 0) {
          callback(new Error('当前编号已存在'))
        }
      } else {
        callback(new Error('请求失败'))
      }
    })
  }
  callback()
} */

// 数字、大写字母或-_/ => 1~20
var idReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[A-Z0-9-_/]{1,20}$/
    if (!reg.test(value)) {
      callback(new Error('必须由数字、大写字母或-_/组成'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 数字、字母 => *
var maxENReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[A-Za-z0-9]*$/
    if (!reg.test(value)) {
      callback(new Error('必须由数字或字母组成'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 2位大写字母/数字 => 2
var ndENReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[A-Z0-9]{2}$/
    if (!reg.test(value)) {
      callback(new Error('必须由2位大写字母或数字'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 3位大写字母 => 3
var rdEReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[A-Z]{3}$/
    if (!reg.test(value)) {
      callback(new Error('必须由3位大写字母组成'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 4位大写字母 => 4
var rthEReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[A-Z]{4}$/
    if (!reg.test(value)) {
      callback(new Error('必须由4位大写字母组成'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 数字 => *
var idNumReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[0-9]*$/
    if (!reg.test(value)) {
      callback(new Error('必须由纯数字组成'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 数字 => *
var phoneReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^(\d{3}-\d{8}|\d{4}-\{7,8}|((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8})?$/
    if (!reg.test(value)) {
      callback(new Error('该号码格式或位数有误'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// ±9999999.99之间 => 1~11
var sevDotTwoDigit = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[0-9]{1,7}(\.([0-9]{1,2}))?$/
    if (!reg.test(value)) {
      callback(new Error('必须在0~9999999.99之间'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 0~999999.999999之间 => 1~13
var sixDotSixDigit = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^((\d{1})|([1-9]{1}\d{1,5})){1}(\.\d{1,6})?$/
    if (!reg.test(value)) {
      callback(new Error('必须在[0,999999.999999]之间'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 3位正整数 => 0~3
var threeD = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^([1-9]\d{0,2})?$/
    if (!reg.test(value)) {
      callback(new Error('必须由0-3位正整数组成'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 0~360° => 3
var degreePos = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^(([0-9]{1})|([1-9]{1}[0-9]{1})|([1-2]{1}[0-9]{2})|([3]{1}[0-5]{1}[0-9]{1})){1}(\.\d{1,4})?$/
    if (!reg.test(value)) {
      callback(new Error('必须在[0°,359.9999°]之间'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 位数在6-8位 => 6-8
var passwordReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[0-9]{6,8}$/
    if (!reg.test(value)) {
      callback(new Error('必须输入6-8位数字'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 数字 => 0~6
var sixNum = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[0-9]{0,6}$/
    if (!reg.test(value)) {
      callback(new Error('必须由0-6位纯数字组成'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 整数
var intNum = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^\d+$/
    if (!reg.test(value)) {
      callback(new Error('必须为整数'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 保留两位小数
var twoDecimal = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/
    if (!reg.test(value)) {
      callback(new Error('必须为正数且最多保留两位小数'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 保留两位小数 => ±
var twoDecimalAll = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^-?(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/
    if (!reg.test(value)) {
      callback(new Error('最多保留两位小数'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

var IPReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^(((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))?$/
    if (!reg.test(value)) {
      callback(new Error('IP地址格式不对'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 正整数
var portReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[+]{0,1}(\d+)$/
    if (!reg.test(value)) {
      callback(new Error('端口号为正整数'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 中文
var chReg = (rule, value, callback) => {
  if (value != '' && value != null) {
    let reg = /^[\u4e00-\u9fa5]$/
    if (!reg.test(value)) {
      callback(new Error('必须为中文字符'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

export { passwordReg418, consumerReg, msgNoValidator, msgCnValidator, resourceReg, urlValidator, remarkReg, idReg, maxENReg, ndENReg, rdEReg, rthEReg, idNumReg, phoneReg, sevDotTwoDigit, sixDotSixDigit, threeD, degreePos, passwordReg, sixNum, intNum, twoDecimal, twoDecimalAll, IPReg, portReg, chReg }
