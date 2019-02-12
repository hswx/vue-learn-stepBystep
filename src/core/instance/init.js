/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0 // 定义一个全局的uid，用来唯一标记vm

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    console.log(1, options)
    const vm: Component = this // {}
    console.log(2, vm)
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) { // 用来测试性能的
      startTag = `vue-perf-init:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true // 设置一个表示避免自身被观察，监听对象变化时用于过滤vm
    // merge options 合并options配置
    if (options && options._isComponent) { // 如果options存在且options._isComponent
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 需要优化内部组件的实例化因为动态options的合并非常慢，而且没有一个内部组件的options配置需要特殊处理
      // 暂时没用到options._isComponent，暂时不看这个分支的用途
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor), // vm.constructor就是vue函数本身
        options || {},
        vm
      )
      // 这一步实际上就是把一些属性和方法放到vm.$options上
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') { // 不管
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm // 这里添加了vm._renderProxy和vm._self属性，都是vm自身，不知道干啥用
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) { // 不管
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) { // 挂载el对应的dom
      vm.$mount(vm.$options.el)
    }
  }
}

/**
 * 组件的初始化使用的函数，效率比使用mergeOptions效率高
 * 因为函数内只赋值了特定的属性
 * @param vm
 * @param options
 */
function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  opts.parent = options.parent
  opts.propsData = options.propsData
  opts._parentVnode = options._parentVnode
  opts._parentListeners = options._parentListeners
  opts._renderChildren = options._renderChildren
  opts._componentTag = options._componentTag
  opts._parentElm = options._parentElm
  opts._refElm = options._refElm
  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

/**
 * 整理获取类的options
 * @param Ctor
 * @returns {*}
 */
export function resolveConstructorOptions (Ctor: Class<Component>) {
  console.log(3, Ctor)
  let options = Ctor.options
  console.log(4, options)
  console.log(5, Ctor.super)
  if (Ctor.super) {
    // 用来处理继承的，暂时不看，在调用Vue.extend时会生成一个子类，就会用到这里的东西了
    // 没有继承的情况下，这个函数直接原样返回
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

/**
 * 检查options的更新
 * @param Ctor
 * @returns {*}
 */
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const extended = Ctor.extendOptions
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  return modified
}

/**
 * 删除重复数据的函数
 * @param latest
 * @param extended
 * @param sealed
 * @returns {*}
 */
function dedupe (latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  // 主要是处理生命周期回调，让回调不会直接被替换赋值，而是被逐个添加
  if (Array.isArray(latest)) {
    const res = []
    sealed = Array.isArray(sealed) ? sealed : [sealed]
    extended = Array.isArray(extended) ? extended : [extended]
    for (let i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i])
      }
    }
    return res
  } else {
    return latest
  }
}
