#vue-learn-stepBystep

这里采用的是vue2.4.0的源码

## 目录

	|
	|-benchmarks 基准测试目录，用来测试某些性能数据，比如时间啊，FPS啊
	|-build 构建脚本目录
	|-dist 构建之后得到的输出目录
	|-example 一些vue功能的使用示例
	|-flow 声明了一些静态类型，用了脸书的开源项目[Flow](https://flowtype.org/)
	|  |- compiler.js 编译相关的数据结构
	|  |- component.js 组件数据结构
	|  |- global-api.js 全局API结构
	|  |- modules.js 第三方库相关的结构
	|  |- options.js 选项相关结构
	|  |- ssr.js 服务端渲染相关结构
	|  |- vnode.js 虚拟节点相关结构
	|-packages 构建后server side render和weex版本的输出目录，暂时没看出来干啥用的
	|-src 源码目录
	|  |-compiler 编译tempate模板，将template转成ast语法树再生产render函数
	|  |-core vue核心源码
	|  |-platforms 不同平台渲染时需要的独特的模块
	|  |-server 服务器渲染相关模块
	|  |-sfc 包含单文件组件(.vue文件)的解析逻辑，用于vue-template-compiler包
	|  |-shared 通用工具集
	|
	|-test 测试目录
	|-types 据说是类型检查测试的部分，用typescript写的，暂时没看出来干啥用的
	|-.babelrc babel转码器的配置
	|-.editorconfig 猜测是编辑器的配置文件
	|-.eslintignore eslint忽略的文件
	|-.eslintrc eslint配置文件
	|-.flowconfig flow配置文件
	|-其余的文件就不赘述了


参考：[Vue2.0源代码阅读](https://www.kancloud.cn/zmwtp/vue2/148822)，[Vue2.1.7源码学习](http://hcysun.me/2017/03/03/Vue%E6%BA%90%E7%A0%81%E5%AD%A6%E4%B9%A0/)，[快速了解 Vue2 MVVM](https://github.com/wangfupeng1988/learn-vue2-mvvm#%E5%85%B3%E4%BA%8E%E7%B2%BE%E7%AE%80%E5%90%8E%E7%9A%84%E6%BA%90%E7%A0%81)，[Vue.js 源码解析](https://github.com/answershuto/learnVue)，[理解vue2.0的响应式架构](https://github.com/georgebbbb/fakeVue/blob/master/2.%E7%90%86%E8%A7%A3vue2.0%E7%9A%84%E5%93%8D%E5%BA%94%E5%BC%8F%E6%9E%B6%E6%9E%84.md)，[vue源码阅读笔记](https://www.brooch.me/2017/03/17/vue-source-notes-1/)，[Vue源码解读一：Vue数据响应式原理](http://www.jishux.com/plus/view-619356-1.html)，[Vue源码笔记本](https://zhuanlan.zhihu.com/p/25994997)，[read-vue-code](https://www.gitbook.com/book/114000/read-vue-code/details)，[vue源码分析 -- 基于 2.2.6版本](https://github.com/liutao/vue2.0-source)，[
随笔分类 - vue](http://www.cnblogs.com/dhsz/category/937029.html)，[vue源码学习--合并策略对象mergeOptions](http://www.cnblogs.com/mlFronter/p/7718600.html)
