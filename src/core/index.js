import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'

initGlobalAPI(Vue)
// 初始化全局API，这里主要挂载一些方法到Vue上
// Vue.util = { warn, extend, mergeOptions, defineReactive}
// Vue.set = set
// Vue.delete = del
// Vue.nextTick = nextTick
// Vue.options = {components: {KeepAlive}, directives: {}, filters: {}, _base: Vue}
// Vue.use
// Vue.mixin
// Vue.cid = 0
// Vue.extend
// Vue.component = function(){}
// Vue.directive = function(){}
// Vue.filter = function(){}

// Vue.options是比较复杂的属性，设置了组件，指令和过滤器，
// 初始化的时候对象为{components: {KeepAlive}, directives: {}, filters: {}, _base: Vue}
// 但在打包的时候会加入一些平台特有的指令和组件，
// Vue.options = {
// components: {
//   KeepAlive,
//     Transition,
//     TransitionGroup
// },
// directives: {
//   model,
//     show
// },
// filters: {},
// _base: Vue
// }

Object.defineProperty(Vue.prototype, '$isServer', { // Vue的原型上挂载一个只读属性$isServer，表示是否服务端
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', { // Vue的原型上挂载一个只读属性$ssrContext，表示服务端渲染的上下文
  get () {
    /* istanbul ignore next*/ // 该注释用于istanbul覆盖率测试工具用的
    return this.$vnode && this.$vnode.ssrContext
  }
})

Vue.version = '__VERSION__' // 设置Vue版本，构建的时候会替换成build/config.js中的变量

export default Vue
