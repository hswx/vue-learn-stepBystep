/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 * 这个文件没有类型检查，因为flow不能很好的检查数组原型上的动态方法
 */

import { def } from '../util/index'

const arrayProto = Array.prototype // 获取原生Array数组的原型
export const arrayMethods = Object.create(arrayProto) // 以原生数组的原型创建一个新对象

/**
 * Intercept mutating methods and emit events
 * 拦截更改数组的方法并且抛出事件
 * 这里重写了原生数组的方法，在改变数组的时候监听数组发生的变化，抛出对应的事件给相关联的观察者做响应式处理
 */
;[
  'push', // 向数组的末尾添加一个或多个元素，并返回新的长度
  'pop', // 删除并返回数组的最后一个元素
  'shift', // 删除并返回数组的第一个元素
  'unshift', // 向数组的开头添加一个或更多元素，并返回新的长度
  'splice', // 删除元素，并向数组添加新元素
  'sort', // 对数组的元素进行排序
  'reverse' // 颠倒数组中元素的顺序
]
.forEach(function (method) {
  // cache original method
  // 缓存数组原本的方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
