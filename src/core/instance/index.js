import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) { // vue的构造函数就在这里
  if (process.env.NODE_ENV !== 'production' && // 在非生产模式下提示vue是一个构造函数且需要使用new关键字
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) // 根据传入的options初始化vue对象
}

// 以下几步主要是在Vue.prototype上挂载方法
// 在最终打包的时候还会挂载__patch__和$mount，暂且不管

initMixin(Vue)
// 挂载init方法
// Vue.prototype._init = function (options?: Object) {}

stateMixin(Vue)
// 挂载$set、$delete、$watch方法和$data、$props属性
// Vue.prototype.$data
// Vue.prototype.$props
// Vue.prototype.$set = set
// Vue.prototype.$delete = del
// Vue.prototype.$watch = function(){}

eventsMixin(Vue)
// 挂载$on、$once、$off、$emit方法
// Vue.prototype.$on = function (event: string, fn: Function): Component {}
// Vue.prototype.$once = function (event: string, fn: Function): Component {}
// Vue.prototype.$off = function (event?: string, fn?: Function): Component {}
// Vue.prototype.$emit = function (event: string): Component {}

lifecycleMixin(Vue)
// 挂载_update、$forceUpdate、$destroy方法
// Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {}
// Vue.prototype.$forceUpdate = function () {}
// Vue.prototype.$destroy = function () {}

renderMixin(Vue)
// 挂载$nextTick、_render方法
// Vue.prototype.$nextTick = function (fn: Function) {}
// Vue.prototype._render = function (): VNode {}
// Vue.prototype._o = markOnce
// Vue.prototype._n = toNumber
// Vue.prototype._s = toString
// Vue.prototype._l = renderList
// Vue.prototype._t = renderSlot
// Vue.prototype._q = looseEqual
// Vue.prototype._i = looseIndexOf
// Vue.prototype._m = renderStatic
// Vue.prototype._f = resolveFilter
// Vue.prototype._k = checkKeyCodes
// Vue.prototype._b = bindObjectProps
// Vue.prototype._v = createTextVNode
// Vue.prototype._e = createEmptyVNode
// Vue.prototype._u = resolveScopedSlots
// Vue.prototype._g = bindObjectListeners

export default Vue
