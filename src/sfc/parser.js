/* @flow */

import deindent from 'de-indent' // 尤雨溪自己写的第三方库，用来删除代码中额外的缩进
import { parseHTML } from 'compiler/parser/html-parser'
import { makeMap } from 'shared/util'

const splitRE = /\r?\n/g // 匹配零个或多个回车和一个换行
const replaceRE = /./g // 匹配除“\r\n”之外的任何单个字符
const isSpecialTag = makeMap('script,style,template', true)
// 通过makeMap方法创建一个忽略大小写的查找传入值是否是script,style或template的方法，方法源码在src/shared/util下

type Attribute = { // 创建一个对象类型Attribute，对象中包含string格式的name和string格式的value
  name: string,
  value: string
};

/**
 * Parse a single-file component (*.vue) file into an SFC Descriptor Object.
 * 将单文件组件（.vue）转化成一个 sfc 对象（可识别的组件对象）
 * @param content 文件内容
 * @param options 配置项，默认为{}
 * @returns {SFCDescriptor} 一个用来描述单文件组件的对象，类型的具体内容用flow写在flow/compiler.js中
 */
export function parseComponent (
  content: string,
  options?: Object = {}
 ): SFCDescriptor {
  const sfc: SFCDescriptor = {
    template: null,
    script: null,
    styles: [],
    customBlocks: []
  }
  // 定义一个SFCDescriptor类型的对象，分为template、script、style和自定义块四部分，
  // 其中style和自定义块允许多个，template和script只允许一个

  let depth = 0 // 表示嵌套标签的深度
  let currentBlock: ?(SFCBlock | SFCCustomBlock) = null

  /**
   * 解析标签对象，获取标签的名字以及标签相关的属性，放入到sfc对象中
   * @param tag 标签名
   * @param attrs 标签内属性的数组
   * @param unary 是否是单标签
   * @param start 标签中'<'开始的位置
   * @param end 标签中'>'结束的位置
   */
  function start (
    tag: string,
    attrs: Array<Attribute>,
    unary: boolean,
    start: number,
    end: number
  ) {
    if (depth === 0) {
      currentBlock = {
        type: tag,
        content: '',
        start: end, // 表示标签中内容开始的位置
        attrs: attrs.reduce((cumulated, { name, value }) => {
          cumulated[name] = value || true // 如果没有value就默认为true
          return cumulated
        }, Object.create(null))
        // 将属性数组变成一个对象，即[{key1:value1},{key2:value2}]转成{key1:value1,key2:value2}
      }
      if (isSpecialTag(tag)) { // 判断是不是script,style,template标签
        checkAttrs(currentBlock, attrs) // 检查标签的属性
        if (tag === 'style') {
          sfc.styles.push(currentBlock) // 如果是style标签就放到sfc的style数组中
        } else {
          sfc[tag] = currentBlock // 分别把script和template标签的内容放到sfc的script和template属性中
        }
      } else { // custom blocks 不是script,style,template标签，就是用户自己定义的标签了，放到sfc的customBlocks数组中
        sfc.customBlocks.push(currentBlock)
      }
      // 可见一个vue组件中可以有多个style和自定义标签，但只能有一个script和template标签
    }
    if (!unary) { // 如果不是单标签，depth嵌套深度+1
      depth++
    }
  }

  /**
   * 用来接收start方法中的currentBlock对象以及传入start方法的attrs参数
   * @param block SFCBlock类型的对象，{ type, content, start, attrs }
   * @param attrs 属性数组
   */
  function checkAttrs (block: SFCBlock, attrs: Array<Attribute>) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i]
      if (attr.name === 'lang') { // 属性名为lang则block.lang为属性值，lang的值可能为jade，ejs等，或者css使用的语言stylus等
        block.lang = attr.value
      }
      if (attr.name === 'scoped') { // 属性名为scoped则block.scoped为true，一般用来表示css样式只在本vue组件内生效
        block.scoped = true
      }
      if (attr.name === 'module') { // 属性名为module则block.module值为属性值，属性值不存在则为true，还没碰到过，不知道干啥用
        block.module = attr.value || true
      }
      if (attr.name === 'src') { // 属性名为src则block.src值为属性值，src的值可以用来导入css，js文件
        block.src = attr.value
      }
    }
  }

  /**
   * 解析标签中的内容代码，加上一些空行，方便报错和警告信息中显示正确的行号
   * @param tag 标签名称
   * @param start 标签中'<'开始的位置
   * @param end 标签中'>'结束的位置
   */
  function end (tag: string, start: number, end: number) {
    if (depth === 1 && currentBlock) { // 判断是否depth深度为1且currentBlock存在，
      // 由此可以看出start和end方法结合，只处理第一层标签，即depth=0的标签
      currentBlock.end = start // 获取标签中内容结束的位置
      let text = deindent(content.slice(currentBlock.start, currentBlock.end)) // 获取标签中的内容
      // pad content so that linters and pre-processors can output correct
      // line numbers in errors and warnings
      // 填充内容以便预处理器能正确输出代码中错误和警告的行号
      if (currentBlock.type !== 'template' && options.pad) { // 判断代码块的标签不是template且options.pad存在值
        text = padContent(currentBlock, options.pad) + text // 这里在标签中的内容前面加上空行
      }
      currentBlock.content = text
      currentBlock = null // 置空currentBlock的引用，释放内存，等待内存处理
    }
    depth-- // 减少一层depth嵌套深度
  }

  /**
   * 在标签前填充相应数量的空行
   * @param block 当前标签代码块
   * @param pad 值可以是true或者line或者space
   * @returns {*}
   */
  function padContent (block: SFCBlock | SFCCustomBlock, pad: true | "line" | "space") {
    if (pad === 'space') { // 如果pad为space就把内容前除了/r/n之外的字符替换成空格' '
      return content.slice(0, block.start).replace(replaceRE, ' ')
    } else {
      const offset = content.slice(0, block.start).split(splitRE).length // 获取代码内容前有多少行，可以知道当前代码到底在多少行
      const padChar = block.type === 'script' && !block.lang
        ? '//\n' // 如果代码的type为script且没有设置标签lang类型，则返回'//\n'，
        : '\n'   // 否则返回'\n'，实际操作发现'//\n'和'\n'都会换行且行数相同，只是前者多了'//'，暂时不知道加了'//'的用处
      return Array(offset).join(padChar) // 根据offset和padChar添加offset个padChar
    }
  }

  parseHTML(content, { // 解析vue组件，传入标签的内容以及相关信息，暂时还不知道 parseHTML 的用处，等看到再说呗
    start,
    end
  })

  return sfc
}
