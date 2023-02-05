# new Vue到底都干了啥呢？🙄
很多时候我们都会被问到new Vue到底发生了肾么事？这篇文章我们就来好好的看看!!!😁

## 首先我们从源码调试开始
之前有一篇文章提到了[vue源码调试](https://juejin.cn/post/6875607031621877773)，可以移步至此。
## 入口文件
当执行run dev时，我们可以根据package.json中配置拿到相应的参数

`
"dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev",
`

此时我们可以拿到一个路径`scripts/config.js` 和参数`TARGET:web-full-dev`

在`scripts/config.js`文件中可以看到定义的builds对象找到`web-full-dev`对应的属性值
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cd06fe6492194db7abdc90c455e99b55~tplv-k3u1fbpfcp-watermark.image)
这时找到了入口文件`src\platforms\web\entry-runtime-with-compiler.js`

## 入口文件干了啥？
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2f6cf8f1af5e4ce199130a6d3152c4db~tplv-k3u1fbpfcp-watermark.image)
从上面的代码可以看出拓展了`$mount`,接着就是根据传入的参数el获取dom元素。然后判断有没有`render`,如果没有`render`则去找`template`,如果没有`template`则根据函数`getOuterHTML`将`el`内部内容作为`template`,所以我们可以得出结论，`render template el`的优先级是 `render > template > el`。如果`template` 则需要函数`compileToFunctions`将`template`编译得到一个`render`函数,并把`render`设置到组件选项上。最后执行了`mount`方法的默认任务。

接下来正式进入主题
## 寻找构造函数Vue
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/900a5dbc144143959909e843222865ce~tplv-k3u1fbpfcp-watermark.image)
在入口文件中可以看到从`./runtime/index`文件导入`Vue`,进入此文件。
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e36bee949ab9418fb57fd2b7091fa52a~tplv-k3u1fbpfcp-watermark.image)可以看到`core/index`文件中导入的`Vue`,还可以看到实现了`$mount`方法。![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7cc89a3ef754cae8844fd02c55fa4d0~tplv-k3u1fbpfcp-watermark.image)

进入文件`core/index`![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f539bdb02814856a15d874f33646eed~tplv-k3u1fbpfcp-watermark.image)可以看到从`./instance/index`中导入了`Vue`，而且执行了一个全局Api初始化方法`initGlobalAPI`,继续进入`./instance/index`![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7c955c33a114c22a38a9308c4944fe1~tplv-k3u1fbpfcp-watermark.image)终于找到了`Vue`构造函数。在`Vue`构造函数中执行了`_init`方法。下面也执行了一系列的混入。可以在`initMixin`中找到`_init`方法。下面我们来看看`_init`方法到底干了什么。
## 构造函数中的_init干了啥？
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/264662478590416bb9791b9357051a3f~tplv-k3u1fbpfcp-watermark.image)这里我们可以很清楚的看到这一系列的流程。属性的合并接着是各种初始化。

* `initLifecycle` -> 定义了 `$parent`、`$children`、`$root`、`$ref`
* `initEvent` -> 对于一些自定义事件的监听
* `initRender` -> 定义了`$slots`、`$createElement`， 让`$attrs` `$listeners`变成响应式的
* 执行生命周期`beforeCreate`
* `initInjections` -> 获取祖辈注入的数据
* `initState` -> 数据初始化：`data`、`props`、`methods`、`computed`、`watch`
* `initProvide` -> 将数据提供给后代
* 执行生命周期`created`
* 执行挂载
## 如何挂载
回到刚刚提到的实现了`$mount`方法的文件`core/index`![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27bd452773d048b1a6b3e0e6444ca957~tplv-k3u1fbpfcp-watermark.image)这里返回了一个从文件`core/instance/lifecycle`函数`mountComponent`![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/99f9be8dd3534d329aa69bc2eae53289~tplv-k3u1fbpfcp-watermark.image)在执行这个函数之前首先是执行的是我们拓展的`$mount`函数，在那里可以拿到`render`。在`mountComponent`中执行了`beforeMount`钩子，然后`new Watcher`执行`updateComponent`函数。这个函数主要做的事情就是通过`_render()`函数把`render`变成虚拟dom,通过`_update`把虚拟dom变成真实dom插入到试图中，最后执行`mount`钩子函数
## 总结
以上大概就是我理解的new Vue干了一系列的操作，如有需要改进的地方，欢迎留言哦~~~最后来个思维导图
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9314c7fe4b1c4efb90551b8bbeaa66b7~tplv-k3u1fbpfcp-watermark.image)

[掘金](https://juejin.cn/post/6976824603456831495)