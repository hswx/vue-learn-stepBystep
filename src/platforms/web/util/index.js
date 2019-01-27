/* @flow */

import { warn } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 * 查找一个元素选择器如果传过来的这个元素选择器不是一个元素
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') { // 如果是字符串，就去查找这个css选择器字符串对应的第一个元素
    const selected = document.querySelector(el) // 匹配指定CSS选择器的第一个元素。 如果没有找到，返回 null
    if (!selected) { // 如果没找到会返回一个div标签创建的元素，非生产环境还会在控制台报错
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }
    return selected // 找到的话就返回找到的元素
  } else { // 如果是元素的话，就直接返回元素
    return el
  }
}
