/* @flow */

import config from '../config'
import { warn } from './debug'
import { nativeWatch } from './env'
import { set } from '../observer/index'

import {
  ASSET_TYPES,
  LIFECYCLE_HOOKS
} from 'shared/constants'

import {
  extend,
  hasOwn,
  camelize,
  capitalize,
  isBuiltInTag,
  isPlainObject
} from 'shared/util'

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 * 定义一个对象，对象中包含一些函数，这些函数决定了父选项与子选项合成最终值时采用的策略
 * 此时 strats 是一个空对象，因为 config中optionMergeStrategies = Object.create(null)
 */
const strats = config.optionMergeStrategies

/**
 * Options with restrictions
 * 非生产环境，暂时不管
 */
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}

/**
 * Helper that recursively merges two data objects together.
 * 递归地将两个数据对象合并到一起的方法
 * 1.如果from【childVal】中的某个属性to【parentVal】中也有，保留to中的，什么也不做
 * 2.如果to中没有，将这个属性添加到to中
 * 3.如果to和from中的某个属性值都是对象，则递归调用，进行深度合并。
 * @param to
 * @param from
 * @returns {Object}
 */
function mergeData (to: Object, from: ?Object): Object {
  console.log(9,to,from);
  if (!from) return to // 如果from不存在直接返回to的值
  let key, toVal, fromVal
  const keys = Object.keys(from) // 获取from对象自身可枚举的key值
  for (let i = 0; i < keys.length; i++) {
    key = keys[i] // 获取from中的key值
    toVal = to[key] // 获取to中key属性的值，应该有可能不存在吧
    fromVal = from[key] // 获取from中key属性的值
    if (!hasOwn(to, key)) { // 如果to中没有这个key属性就设置to中key属性的值为from[key]
      set(to, key, fromVal)
      // 这个方法是给to的属性key赋值
      // 如果to有__ob__属性, 还会把新合并的这个值设置成监控模式 , 并且即刻通知更新
      // 会调用这两个方法 defineReactive(ob.value, key, val)  ob.dep.notify()
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      // 如果toVal和fromVal都是对象,继续合并
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * Data
 * 处理数据
 * @param parentVal
 * @param childVal
 * @param vm
 * @returns {*}
 */
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  console.log(8,parentVal,childVal,vm);
  if (!vm) { // vm目前存在，还是先不管这个情况
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this) : childVal,
        parentVal.call(this)
      )
    }
  } else if (parentVal || childVal) { // 应该会走到这条分支
    return function mergedInstanceDataFn () {
      // instance merge 实例合并
      const instanceData = typeof childVal === 'function' // 如果childVal是方法就直接执行返回结果，否则返回原值
        ? childVal.call(vm)
        : childVal
      const defaultData = typeof parentVal === 'function' // 如果parentVal是方法就直接执行返回结果，否则返回undefined
        ? parentVal.call(vm)
        : undefined
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

/**
 * 处理config中data的内容，返回的是一个具体的合并属性的函数。
 * @param parentVal
 * @param childVal
 * @param vm
 * @returns {*}
 */
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  console.log(7,parentVal,childVal,vm)
  if (!vm) { // 如果没传入vm实例，目前会传入vm，暂时不管这个情况
    if (childVal && typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn( // 非生产环境，忽略
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    return mergeDataOrFn.call(this, parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm) //传入vm实例的情况下，直接调用mergeDataOrFn方法
}

/**
 * Hooks and props are merged as arrays.
 * 只有父时返回父，只有子时返回数组类型的子。
 * 父、子都存在时，将子添加在父的后面返回组合而成的数组。
 * 这也是父子均有钩子函数的时候，先执行父的后执行子的的原因
 */
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

/**
 * 得到生命周期钩子相对应的策略
 */
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (parentVal: ?Object, childVal: ?Object): Object {
  const res = Object.create(parentVal || null)
  return childVal
    ? extend(res, childVal)
    : res
}

/**
 *
 * 得到directives、components、filter相对应的策略
 */
ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal: ?Object, childVal: ?Object): ?Object {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (!parentVal) return childVal
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (parentVal: ?Object, childVal: ?Object): ?Object {
  if (!childVal) return Object.create(parentVal || null)
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  extend(ret, childVal)
  return ret
}
strats.provide = mergeDataOrFn

/**
 * Default strategy.
 * 默认策略
 * 这个函数表示当子选项存在时，返回子选项，否则返回父选项
 * @param parentVal
 * @param childVal
 * @returns {any}
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Validate component names
 * 验证组件名
 */
function checkComponents (options: Object) {
  for (const key in options.components) {
    const lower = key.toLowerCase()
    if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + key
      )
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 * 确保所有的属性选项的语法都基于对象格式规范化
 */
function normalizeProps (options: Object) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    // 如果props是一个数组
    // 这个分支把数组转化成对象['a','b','a-b'] -> { a:{ type: null }, b:{ type: null }, aB:{ type: null }}
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') { // val必须是string类型
        name = camelize(val) // 将连字符格式的字符串改成驼峰命名格式，'abc-abc' -> 'abcAbc'
        res[name] = { type: null } // 给每个属性赋值{type:null}
      } else if (process.env.NODE_ENV !== 'production') { // 非生产环境使用的，不管
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    // 严格判断对象，必须要是Object，像Date，Boolean等对象都不可以
    // { a: { b: 1}, c: 2 } -> { a: {b: 1}, c:{ type: 2 } }
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val) // props对象的属性也必须要严格是对象，否则赋值为{type:val}
        ? val
        : { type: val }
    }
  }
  options.props = res
}

/**
 * Normalize all injections into Object-based format
 * 将所有注入标准化为基于对象的格式
 * 这里把数组options.inject转换成对象
 * 比如['a','b','c'] -> {'a':'a', 'b':'b', 'c':'c'}
 * @param options
 */
function normalizeInject (options: Object) {
  const inject = options.inject
  if (Array.isArray(inject)) { // 由此看来，options.inject应该是一个数组，如果不是数组，则原样不变
    const normalized = options.inject = {}
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = inject[i]
    }
  }
}

/**
 * Normalize raw function directives into object format.
 * 将原始函数指令规范化为对象格式
 */
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        // 如果options.directives中属性的值是一个function，就替换成{ bind: [Function: ?], update: [Function: ?] }的格式
        // 如果不是function，原样不变
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 * 合并两个options到一个新对象中
 * 核心功能在实例和继承中都可以使用
 * @param parent
 * @param child
 * @param vm
 * @returns {{}}
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  console.log(6,parent,child,vm);
  if (process.env.NODE_ENV !== 'production') { // 非生产环境下的功能，暂不看，用来检查组件名是否合法
    checkComponents(child)
  }

  if (typeof child === 'function') { // 如果child是个方法，则child设置为child.options，暂时没看到child是方法的情况
    child = child.options
  }

  normalizeProps(child) // 格式化child的props
  normalizeInject(child) // 格式化child的inject，2.2.0新增的属性，需要和provide一起使用，具体用法https://cn.vuejs.org/v2/api/#provide-inject
  normalizeDirectives(child) // 格式化child的directives

  const extendsFrom = child.extends

  // https://cn.vuejs.org/v2/api/#extends
  // 允许声明扩展另一个组件(可以是一个简单的选项对象或构造函数),而无需使用
  // 将child的extends也加入parent扩展，父实例合并子实例的extends属性
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }

  // 将child的mixins加入parent中，父实例合并子实例的mixins属性
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }

  const options = {}
  let key
  for (key in parent) { // 遍历Vue.options对象的属性
    mergeField(key)
    // 合并父选项和子选项中相同key的值
  }
  for (key in child) { // 遍历options对象的属性
    if (!hasOwn(parent, key)) {
      mergeField(key)
      // 合并子选项中存在的而父选项中没有的key对应的值
    }
  }
  function mergeField (key) {
    // 每个key都会对应在strats中初始化好的函数，根据key值找到对应的处理策略函数
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key) // key值传入是为了非生产环境用的，可以忽略
  }
  console.log(10,options);
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  // check local registration variations first
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
