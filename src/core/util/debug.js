/* @flow */

import config from '../config' // 引入配置文件
import { noop } from 'shared/util' // 引入不执行操作的函数

export let warn = noop
export let tip = noop
export let formatComponentName: Function = (null: any) // work around flow check

if (process.env.NODE_ENV !== 'production') {
  // 当前环境不是生产环境时执行以下函数，返回定义好的warn、tip和formatComponentName函数，否则就返回无效的函数
  const hasConsole = typeof console !== 'undefined' // 检查console对象是否存在
  const classifyRE = /(?:^|[-_])(\w)/g // 正则，表示(匹配但不获取开头或匹配字符'-'或_)(匹配并获取包括下划线的任何单词字符)
  const classify = str => str
    .replace(classifyRE, c => c.toUpperCase())
    // 经验证abc-abc -> Abc-Abc，abc_abc -> Abc_Abc
    .replace(/[-_]/g, '') // 去掉字符'-'和'_'

  /**
   * 打印警告信息
   * @param msg
   * @param vm
   */
  warn = (msg, vm) => {
    const trace = vm ? generateComponentTrace(vm) : ''

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace)
    } else if (hasConsole && (!config.silent)) {
      console.error(`[Vue warn]: ${msg}${trace}`)
    }
  }

  /**
   * 打印提示信息
   * @param msg
   * @param vm
   */
  tip = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.warn(`[Vue tip]: ${msg}` + (
        vm ? generateComponentTrace(vm) : ''
      ))
    }
  }

  /**
   * 格式化组件的名字，这里根据传入的vm对象和includeFile
   * 返回所在标签名和所在组件，给报错信息之类的使用
   * @param vm
   * @param includeFile
   * @returns {*}
   */
  formatComponentName = (vm, includeFile) => {
    if (vm.$root === vm) { // 如果vm的根元素就是vm，返回<Root>标签
      return '<Root>'
    }
    let name = typeof vm === 'string' // 如果vm为string类型，则name为vm值，否则继续判断
      ? vm
      : typeof vm === 'function' && vm.options // 如果vm的类型为function且vm.options值为true，则返回vm.options.name，否则继续判断
        ? vm.options.name
        : vm._isVue // 如果vm.isVue值为true，则返回vm.$options.name，如果vm.$options.name不存在则返回vm.$options._componentTag
          ? vm.$options.name || vm.$options._componentTag
          : vm.name // 如果vm.isVue值为false，则返回vm.name

    const file = vm._isVue && vm.$options.__file // 定义一个file值，vm._isVue为真值时file=vm.$options.__file，否则file为vm._isVue的值
    if (!name && file) { // 如果name不存在而file存在时
      const match = file.match(/([^/\\]+)\.vue$/)
      // 正则匹配(除/和\\之外的字符).vue，下方的match[1]拿到的就是匹配后括号内的结果
      // 比如abc.vue -> abc，a/bc -> bc，a\\bc -> bc
      name = match && match[1] // 如果match存在且match[1]有值，name=match[1]
    }

    return (
      (name ? `<${classify(name)}>` : `<Anonymous>`) +  // name有值的话就返回格式中转换后名为name的标签，否则返回<Anonymous>标签
      (file && includeFile !== false ? ` at ${file}` : '') // file存在且includeFile为真值时打印at 某个文件
    )
  }

  /**
   * 通过位运算重复n次字符串str后输出，
   * 即输入(abc,4)，输出abcacbacbacb
   * @param str
   * @param n
   * @returns {string}
   */
  const repeat = (str, n) => {
    let res = ''
    while (n) {
      if (n % 2 === 1) res += str
      if (n > 1) str += str
      n >>= 1
    }
    return res
  }

  /**
   *
   * @param vm 传入vm对象
   * @returns {string}
   */
  const generateComponentTrace = vm => {
    if (vm._isVue && vm.$parent) { // 如果vm._isVue且vm.$parent为真值
      const tree = []
      let currentRecursiveSequence = 0
      while (vm) {
        if (tree.length > 0) {
          const last = tree[tree.length - 1]
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++
            vm = vm.$parent
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence]
            currentRecursiveSequence = 0
          }
        }
        tree.push(vm)
        vm = vm.$parent
      }
      return '\n\nfound in\n\n' + tree
        .map((vm, i) => `${
          i === 0 ? '---> ' : repeat(' ', 5 + i * 2)
        }${
          Array.isArray(vm)
            ? `${formatComponentName(vm[0])}... (${vm[1]} recursive calls)`
            : formatComponentName(vm)
        }`)
        .join('\n')
    } else {
      return `\n\n(found in ${formatComponentName(vm)})`
      // 如果vm._isVue且vm.$parent为假值，将vm对象放入函数formatComponentName中，返回相关信息
    }
  }
}
