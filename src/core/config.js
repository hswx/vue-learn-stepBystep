/* @flow */

import {
  no,
  noop,
  identity
} from 'shared/util'

import { LIFECYCLE_HOOKS } from 'shared/constants'

/**
 * 该js文件定义一个用户的全局配置类型，生成一个默认的配置对象出去
 * 相关配置属性的用途可以在api文档中找到https://cn.vuejs.org/v2/api/#全局配置
 */
export type Config = {
  // user 用户配置属性
  optionMergeStrategies: { [key: string]: Function };
  silent: boolean;
  productionTip: boolean;
  performance: boolean;
  devtools: boolean;
  errorHandler: ?(err: Error, vm: Component, info: string) => void;
  warnHandler: ?(msg: string, vm: Component, trace: string) => void;
  ignoredElements: Array<string>;
  keyCodes: { [key: string]: number | Array<number> };

  // platform 平台配置属性
  isReservedTag: (x?: string) => boolean;
  isReservedAttr: (x?: string) => boolean;
  parsePlatformTagName: (x: string) => string;
  isUnknownElement: (x?: string) => boolean;
  getTagNamespace: (x?: string) => string | void;
  mustUseProp: (tag: string, type: ?string, name: string) => boolean;

  // legacy 遗留使用的属性
  _lifecycleHooks: Array<string>;
};

export default ({
  /**
   * Option merge strategies (used in core/util/options)
   * 自定义合并策略的选项。用于core/util/options中
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   * 是否屏蔽日志警告
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   * 启动时是否显示生产模式的提示信息
   */
  productionTip: process.env.NODE_ENV !== 'production',

  /**
   * Whether to enable devtools
   * 是否使用调试工具
   */
  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Whether to record perf
   * 是否记录性能信息
   */
  performance: false,

  /**
   * Error handler for watcher errors
   * 监测到错误的处理程序
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   * 监测到警告的处理程序
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   * 忽略某些自定义元素
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   * v-on的用户自定义键名
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   * 检查一个标签是否是保留标签来判断它能否注册成一个组件。
   * 这是一个平台相关的方法，可以被重写。
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   * 检查一个属性是否是保留属性来判断它能否注册成一个组件的属性。
   * 这是一个平台相关的方法，可以被重写。
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   * 检查一个标签是否是位置元素
   * 平台相关
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   * 获取元素的命名空间，即元素的类型
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   * 解析特殊平台中标签真实的标签名
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   * 检查某个属性是否必须被用属性绑定，比如value等
   * 平台相关
   */
  mustUseProp: no,

  /**
   * Exposed for legacy reasons
   * 由于遗留原因暴露的生命周期钩子列表
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
}: Config)
