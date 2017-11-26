export const SSR_ATTR = 'data-server-rendered'

//工具类型？
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]

//生命周期钩子
export const LIFECYCLE_HOOKS = [
  'beforeCreate', // 在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用。
  'created', // 在实例创建完成后被立即调用。在这一步，实例已完成以下的配置：数据观测 (data observer)，属性和方法的运算，watch/event 事件回调。然而，挂载阶段还没开始，$el 属性目前不可见。
  'beforeMount', // 在挂载开始之前被调用：相关的 render 函数首次被调用。
  'mounted', // 在挂载开始之前被调用：相关的 render 函数首次被调用。
  'beforeUpdate', // 数据更新时调用，发生在虚拟 DOM 重新渲染和打补丁之前。
  'updated', // 由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。
  'beforeDestroy', // 实例销毁之前调用。在这一步，实例仍然完全可用。
  'destroyed', // Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。
  'activated', // keep-alive 组件激活时调用。
  'deactivated' // keep-alive 组件停用时调用。
]
