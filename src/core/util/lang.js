/* @flow */

export const emptyObject = Object.freeze({}) // 创建一个冻结的空对象

/**
 * Check if a string starts with $ or _
 * 检查是否一个字符串用'$'或者'_'开头
 * @param str
 * @returns {boolean}
 */
export function isReserved (str: string): boolean {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 * 定义一个属性，
 * 这里用了Object.defineProperty方法，给一个对象添加属性，并且设置该属性可写，可配置
 * 可以自己设置该属性是否可枚举
 * @param obj
 * @param key
 * @param val
 * @param enumerable
 */
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

const bailRE = /[^\w.$]/
// 正则，匹配除了（包括下划线的任何单词字符--类似但不等价于“[A-Za-z0-9_]”，这里的"单词"字符使用Unicode字符集，字符.和字符$）之外的字符

/**
 * Parse simple path.
 * 解析简单的路径
 * @type {RegExp}
 * @param path
 * @returns {Function}
 */
export function parsePath (path: string): any {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    // 返回一个方法，该方法接收一个obj对象，返回path路径所对应的值
    // 比如obj={ a1: { b1: 0 }, a2: 1}，path='a2.a1'返回undefined，path='a1.b1'返回0
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
