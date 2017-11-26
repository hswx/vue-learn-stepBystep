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
initMixin(Vue) // 挂载init方法
stateMixin(Vue) // 挂载状态方法
eventsMixin(Vue) // 挂载事件方法
lifecycleMixin(Vue) // 挂载生命周期方法
renderMixin(Vue) // 挂载render函数

export default Vue
