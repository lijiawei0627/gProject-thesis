// 添加新的class
export function addClass (el, className) {
  if (hasClass(el, className)) {
    return
  }
  // 将el中原有的class分割成一个数组
  let newClass = el.className.split(' ')
  // 把要添加的class加到数组中
  newClass.push(className)
  // 再将数组拼接成字符串，各class之间用空格隔开
  el.className = newClass.join(' ')
}

// 判断是否含有该class
export function hasClass (el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

// 获取到标签中前缀为‘data-’的变量，
// 若函数中传入了参数val，则是设置该变量的值，否则就是获取改变量的值
export function getData (el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}

// 根据当前浏览器，给style加上兼容前缀
let elementStyle = document.createElement('div').style
const vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()
export function prefixStyle (style) {
  if (vendor === false) {
    return false
  }
  if (vendor === 'standard') {
    return style
  }
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
