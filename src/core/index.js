import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'

initGlobalAPI(Vue) // 初始化全局API，这里主要挂载一些方法到Vue上

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
