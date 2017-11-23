/* @flow */

// these helpers produces better vm code in JS engines due to their
// explicitness and function inlining
// 这些助手通过更明确的内联函数提供给js引擎更好的vm代码

/**
 * 判断是否是undefined或者null
 * @param v 要判断的字段，any表示跳过类型检查
 * @returns {boolean}
 */
export function isUndef (v: any): boolean %checks {
  return v === undefined || v === null
}

/**
 * 判断是否不是undefined或者不是null
 * @param v 要判断的字段，any表示跳过类型检查
 * @returns {boolean}
 */
export function isDef (v: any): boolean %checks {
  return v !== undefined && v !== null
}

/**
 * 判断是否是true
 * @param v 要判断的字段，any表示跳过类型检查
 * @returns {boolean}
 */
export function isTrue (v: any): boolean %checks {
  return v === true
}

/**
 * 判断是否是false
 * @param v 要判断的字段，any表示跳过类型检查
 * @returns {boolean}
 */
export function isFalse (v: any): boolean %checks {
  return v === false
}

/**
 * Check if value is primitive
 * 判断是否是基本类型，这里的基本类型包括string和number
 * @param v 要判断的字段，any表示跳过类型检查
 * @returns {boolean}
 */
export function isPrimitive (value: any): boolean %checks {
  return typeof value === 'string' || typeof value === 'number'
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 * 快速对象检查 - 主要用于在我们从原始值中知道该值是符合JSON的类型时通知对象，就是检查一个值是不是对象
 * 只要typeof为object的对象，都会返回true，比如{a:1}，[1,2,3]，new Boolean(1)等内置对象
 * @param obj 要判断的字段，mixed表示未知类型
 * @returns {boolean}
 */
export function isObject (obj: mixed): boolean %checks {
  return obj !== null && typeof obj === 'object'
}

const _toString = Object.prototype.toString // 引用Object.prototype的toString方法

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 * 严格对象检查。只返回明确的JavaScript对象
 * 相比于isObject方法，这里会检查对象的toString方法，只有{a:1}这种object的对象才会返回true
 * Object.prototype.toString.call(new Date())      [object Date]
 * Object.prototype.toString.call([1,2,3])         [object Array]
 * Object.prototype.toString.call(new Boolean(1))  [object Boolean]
 * qs:为什么不直接用对象的toString()方法？
 * an:Array、Boolean等构造函数的都在原型中重写了toString方法，不会输出[***]
 * @param obj 要判断的字段，any表示跳过类型检查
 * @returns {boolean}
 */
export function isPlainObject (obj: any): boolean {
  return _toString.call(obj) === '[object Object]'
}

/**
 * 判断输入值是否是正则表达式对象
 * @param v 要判断的字段，any表示跳过类型检查
 * @returns {boolean}
 */
export function isRegExp (v: any): boolean {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 * 判断val值是否是一个有效的数组索引，所以需要的应该是一个正整数
 * 这里先把数值转化成浮点数n
 * n>=0判断n是不是负数，可以去除负数和NaN的情况
 * Math.foor(n)===n判断n是不是浮点数(小数)，可以去除浮点数的情况
 * isFinite判断n是不是无穷数，可以去除无穷数的情况
 *
 * ps:为什么不用正则？或者es6的Number的方法之类的
 *
 * @param v 要判断的字段，any表示跳过类型检查
 * @returns {boolean}
 */
export function isValidArrayIndex (val: any): boolean {
  const n = parseFloat(val)
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

/**
 * Convert a value to a string that is actually rendered.
 * 将值转换成实际呈现的字符串
 * 这里接受任何类型的参数，如果这个值==null则返回空字符串，
 * 如果这个值的typeof值是object则转成缩进2个空格的字符串，基本就是原样转成json格式输出
 * 否则就用String来返回原字符串
 * 这里的作用应该主要是当假值null，undefined等返回空字符串用的
 * @param val 要判断的字段，any表示跳过类型检查
 * @returns {string}
 */
export function toString (val: any): string {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 * 将string类型的输入值转换成浮点型的数字，如果转换失败就返回原输入的string
 * 通过parseFloat转换string类型的输入值，判断是否是NaN来分析原值是否能转换
 * @param val string类型的输入
 * @returns {number|string}
 */
export function toNumber (val: string): number | string {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * 制作一个map并且返回一个方法来检查是否某个key在那个map里
 * 可以参考下面的isBuiltInTag和isReservedAttribute用法，
 * 主要是把一串带逗号的字符串转化成一个list，返回一个方法，查询输入的字符串是否在这个list里
 * @param str
 * @param expectsLowerCase
 * @returns {function(*): *}
 */
export function makeMap (
  str: string,
  expectsLowerCase?: boolean // 是否忽略大小写
): (key: string) => true | void {
  const map = Object.create(null)  // 创建一个完全空的对象{}，连prototype都是空的
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

/**
 * Check if a tag is a built-in tag.
 * 输出一个方法检索是否该标签一个内置标签，true表示忽略大小写，都会转成小写
 * @type {function(*): *}
 */
export const isBuiltInTag = makeMap('slot,component', true)

/**
 * Check if a attribute is a reserved attribute.
 * 输出一个方法判断是否该属性是一个保留属性，不忽略大小写
 * @type {function(*): *}
 */
export const isReservedAttribute = makeMap('key,ref,slot,is')

/**
 * Remove an item from an array
 * 从数组中删除一个item
 * 这里通过indexOf来查找到item所在的位置，
 * 然后通过splice删除该元素并返回删除后的数组，
 * 如果数组长度<=0或者没找到该元素，就不返回值
 * @param arr
 * @param item
 * @returns {Array.<any>}
 */
export function remove (arr: Array<any>, item: any): Array<any> | void {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

const hasOwnProperty = Object.prototype.hasOwnProperty// 引用Object的原型方法

/**
 * Check whether the object has the property.
 * 检查对象是否有某个属性
 * @param obj
 * @param key
 * @returns {*}
 */
export function hasOwn (obj: Object | Array<*>, key: string): boolean {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 * 创建一个带版本缓存的函数
 * 实际作用其实就是用一个{}把每次函数执行的结果存起来，key是输入的值，value是相对应运行的值，
 * 闭包原理
 * 可以提升函数的执行效率
 * @param fn
 * @returns {*}
 */
export function cached<F: Function> (fn: F): F {
  const cache = Object.create(null)
  // 创建一个{}的cache对象，保存每次执行fn函数的值，key是fn的输入str，value是fn执行的输出
  return (function cachedFn (str: string) {
    const hit = cache[str]
    // 获取cache对象中，key为输入值str的value->hit
    return hit || (cache[str] = fn(str))
    // 如果值存在就说明该函数曾经运行过，值为hit，
    // 否则传入参数str执行函数，并设置cache中key=str，value=fn(str)
  }: any)
}

const camelizeRE = /-(\w)/g  // 正则，获取'-'+包括下划线的任何单词字符

/**
 * Camelize a hyphen-delimited string.
 * 将一个连字符形式的字符串改成驼峰命名形式的字符串
 * 通过正则将字符串中符合/-(\w)/规则的所有字符串都变成大写并去除-
 * 这里用到了replace一个很不常见的用法，replace(reg/string,string/function)
 * replace方法第二个参数可以是函数，
 * 这个函数可以接受4个参数function(a,b,c,d)，返回值为当前匹配到的字符串替换之后的字符串
 * 第一个参数：正则所匹配到的字符；
 * 第二个参数：捕获正则中括号所匹配到的字符，如果没有括号，则该函数接受3个参数，这个参数不存在
 * 第三个参数：正则匹配到的每段字符的第一个字符的索引；
 * 第四个参数：用于匹配的字符串主体；
 * 当然，replace还有特殊替换字符的方法，下面的hyphenateRE就用到了这种方法
 * @type {F}
 */
export const camelize = cached((str: string): string => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

/**
 * Capitalize a string.
 * 将一个字符串的首字母大写
 * @type {F}
 */
export const capitalize = cached((str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

const hyphenateRE = /([^-])([A-Z])/g
// 正则表达式，第一个括号匹配除-外的任意字符，第二个括号匹配大写字符

/**
 * Hyphenate a camelCase string.
 * 将一个驼峰命名形式的字符串改成连字符形式的字符串
 * 这里还是用replace方法来做的，用的更加生僻了，replace的第二个参数可以用特殊替换字符：
 * $& 与正则相匹配的字符串
 * $` 匹配字符串左边的字符
 * $’ 匹配字符串右边的字符
 * $1,$2,$,3,…,$n 匹配结果中对应的分组匹配结果
 * 这里用这种方法加上了'-'，并把字符串变成小写
 * @type {F}
 */
export const hyphenate = cached((str: string): string => {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    // 这里的replace用了两次，原因是出现三个或三个以上连续的大写是会出问题
    // 比如WANG经过第一次replace之后，会变成W-AN-G，再进行一次replace才行
    .toLowerCase()
})

/**
 * Simple bind, faster than native
 */
/**
 * Simple bind, faster than native
 *
 * @param fn
 * @param ctx
 * @returns {boundFn}
 */
export function bind (fn: Function, ctx: Object): Function {
  function boundFn (a) {
    const l: number = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 */
export function toArray (list: any, start?: number): Array<any> {
  start = start || 0
  let i = list.length - start
  const ret: Array<any> = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * Mix properties into target object.
 */
export function extend (to: Object, _from: ?Object): Object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
export function toObject (arr: Array<any>): Object {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
export function noop (a?: any, b?: any, c?: any) {}

/**
 * Always return false.
 */
export const no = (a?: any, b?: any, c?: any) => false

/**
 * Return same value
 */
export const identity = (_: any) => _

/**
 * Generate a static keys string from compiler modules.
 */
export function genStaticKeys (modules: Array<ModuleOptions>): string {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
export function looseEqual (a: mixed, b: mixed): boolean {
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch (e) {
      // possible circular reference
      return a === b
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 *
 * @param arr
 * @param val
 * @returns {number}
 */
export function looseIndexOf (arr: Array<mixed>, val: mixed): number {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
export function once (fn: Function): Function {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
    }
  }
}
