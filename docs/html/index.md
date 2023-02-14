## HTML DOCTYPE 的含义？什么是HTML的标椎模式与混杂模式？
HTML的文档类型声明，doctype 告诉浏览器这个页面是用什么编写的，以什么样(html或xhtml)的文档类型定义来解析文档。
如果没有事先告诉浏览器用什么编写，大部分浏览器将开启最大兼容模式来解析网页
不同的渲染模式会影响浏览器对css代码甚至Js脚本的解析。必须声明在HTML文档的第一行

浏览器渲染页面的两种模式：
- CSS1Compat: 标准模式, 默认模式，浏览器使用W3C的标准解析渲染页面。在标准模式中，浏览器以其支持的最高标椎呈现页面。
- BackCompat: 混杂模式。 浏览器使用自己的怪异模式解析渲染页面。在怪异模式中，页面以一种比较宽松的向后兼容的方式显示

## HTML5有哪些语义化的标签及特性？HTML的元素有哪些分类和特性？
让我们根据结构化去选择一些标签

- SEO有利
- 在没有css样式的情况下能够让网页呈现更结构
- 代码的可读性更友好
- 标签上加上alt title 可以更好的进行描述 

## 如何检测浏览器是够支持HTML5特性

### HTML5都哪些新特性
- canvas
- video, audio
- 本地缓存的支持， localStorage sessionStorage
- article, footer, header
- form: calender, date
- esm
### 如何检测？
1. 检测特定的属性和方法
```js
!!navigator.getlocation
!!window.localStorage
!!window.Worker
```
2. 创建一个元素，看看特定元素，有没有属性和方法
```js
document.createElement('canvas').getContext()
```
3. 第三方库

## HTML的标签有哪些可以优化SEO？
1. 首先要保证是SSR的
2. meta 中的相关属性
	`<meta name="author"  content="xxxx@qq.com">`
	 `<meta name="description"  content="xxxx">`
	`<meta name="keyword"  content="xxxx">`
3. 语义化标签，以一些结构化为主的  title \ meta\ header\ nav\ article\ aside \ footer

## DOM和BOM有什么区别
JavaScript在浏览器环境下，一般由3部分组成
- ECMAScrIpt核心，描述了JS的语法和基本对象
- DOM 文档对象模型 document  有一些API可以操作文档
- BOM 浏览器对象模型， browser 有一些API可以操作浏览器


##  href=”javascript:void(0)“和href="#"的区别是什么？
href="#" 锚点默认是#top 会让网页往上走  定位位置的
href=”javascript:void(0)“ 死链接 阻止事件的 

## src和href的区别
src和href 都是用来引用外部资源的 它们的区别如下：
- src: 表示对资源的引用，它指向的内容会嵌入到当前标签所在的位置。src会将其指向的资源下载并应用到文档内，如请求js脚本。 当浏览器解析到该元素时候，会暂停其他资源的下载处理，直到将该资源加载、编译、执行完毕，所以一般js脚本会放在页面底部
- href：表示超文本引用，它指向一些网络资源，建立和当前元素或本文档的链接关系。当浏览器识别到它指向的文件时，就会并行下载资源，不会停止对当前文档的处理。常用在a、link等标签上


## 对HTML的语义化的理解
语义化是指根据内容的结构化（内容语义化）， 选择合适的标签。
- 对SEO友好
- 对开发者友好 增强了可读性

```html
<header></header>  头部

<nav></nav>  导航栏

<section></section>  区块（有语义化的div）

<main></main>  主要区域

<article></article>  主要内容

<aside></aside>  侧边栏

<footer></footer>  底部
```

## script标签中defer和async的区别
如果没有defer或async属性，浏览器会立即加载并执行相应的脚本。不会等待后续加载的文档元素，读取到就会开始加载和执行，这样就阻塞了后续文档的加载
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b0a8a139519f46dfa2d1992c58eb5397~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)
蓝色代表js脚本网络加载时间  红色代表js脚本的执行时间， 绿色代表htm解析时间

defer和async 都是去异步加载外部js脚本文件，它们不会阻塞页面的解析
- 执行顺序：多个带async属性的标签，不能保证加载的顺序；多个带defer属性的标签，按照加载顺序执行
- 脚本是否并行执行：async属性，表示后续文档的加载和执行与js脚本的加载和执行是并行进行的，即异步执行；defer属性，加载后续文档的过程和js脚本的加载（此时仅加载不执行）是并行进行的（异步）， js脚本需要等到文档所有元素解析完成之后才执行，DOMContentLoaded事件触发执行之前。
