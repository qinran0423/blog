还记得之前面试得物的时候，上来就是一道手写`bind`，当时咱也不知道啥情况，也没准备什么手写的题目，就这样轻轻松松的挂了😄

现在前端行业那么的卷，面试的时候让你手写的个什么东西是非常常见的。下面是我总结的3道手写题。希望对你有帮助。
## call
### call的作用是啥
我们首先看一个案例
```js
let foo = {
  value: 1
}

function bar() {
  console.log(this.value)
}

bar.call(foo) //1
```
可以总结两个点：
- call改变了`bar`的this指向，指向了`foo`
- bar被执行了
那我们是不是可以理解为是这样的情况呢
```js
let foo = {
  value: 1,
  bar: function() {
    console.log(this.value)
  }
}
foo.bar()
```
我们可以看到这个时候this就指向了`foo`,但是多了一个属性，那再把这个属性删掉就是咯。所以我们的思路可以是这样的：
- 将函数设置成foo的属性
- 执行这个函数
- 删除这个函数
暂时可以先写成这样
```js
Function.prototype.myCall = function (context) {
  context.fn = this
  context.fn()
  delete context.fn
}
```
现在我们再回到最初的案例，然后加上参数
```js
let foo = {
  value: 1
}

function bar(name, age) {
  console.log(this.value)
  console.log(name)
  console.log(age)
}

bar.call(foo, "mick", 18)
// 1
// mick
// 18
```
那我们就可以把call去除第一个参数，然后剩下的参数在执行的时候添加进去就好了
```js
Function.prototype.myCall = function (context) {
  context.fn = this
  const args = [...arguments].slice(1)
  context.fn(...args)
  delete context.fn
}
```
我们修改下案例
```js
var value = 1
function bar() {
  console.log(this.value)
}

bar.call(null) // 1
```
当绑定的this指向为null的时候，则认识指向了window
```js
let foo = {
  value: 1
}

function bar(name, age) {
  return {
    value: this.value,
    name,
    age
  }
}

console.log(bar.call(foo, "mick", 18))
// { value: 1, name: 'mick', age: 18 }
```
如果函数有返回值，我们实现的call不能仅仅是执行了，也要有返回值。
```js
Function.prototype.myCall = function (context) {
  context = context || window
  context.fn = this
  const args = [...arguments].slice(1)
  const res = context.fn(...args)
  delete context.fn
  return res
}
```
这样就实现了一个call
#### 总结
- 将函数设置成要指向的那个this的属性
- 执行这个函数
- 删除这个属性
- 考虑参数问题
- 考虑this为null的情况
- 考虑下返回值
## apply
apply和call差不多，只是入参不一样，apply的参数是数组
```js
Function.prototype.myApply = function (context, arr) {
  context = context || window
  context.fn = this
  var res
  if (!arr) {
    res = context.fn()
  } else {
    res = context.fn(...arr)
  }
  delete context.fn
  return res
}
```
## bind
MDN上解释的bind为：**`bind()`**  方法创建一个新的函数，在 `bind()` 被调用时，这个新函数的 `this` 被指定为 `bind()` 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。
我们可以得出两个点:
- 返回一个新的函数
- 可以传入参数

先看下案例：
```js
var foo = {
  value: 1
}

function bar(name, age) {
  console.log(this.value)
  console.log(name)
  console.log(age)
}

var bindFoo = bar.bind(foo, "mick")

bindFoo(18)
// 1
// mick
// 18
```
可以看到 bind的参数和返回的bindFoo的参数是合并的,而改变this可以利用apply来实现
```js
Function.prototype.myBind = function (context) {
  const self = this
  const args = [...arguments].slice(1)
  return function () {
    const bindArgs = [...arguments].slice()
    return self.apply(context, args.concat(bindArgs))
  }
}
```
然而bind还有一个特点。在MDN上这样说到：绑定函数自动适应于使用new操作符去构造一个由目标函数创建的新实例。当一个绑定函数是用来构建一个值的，原来提供的 `this` 就会被忽略。不过提供的参数列表仍然会插入到构造函数调用时的参数列表之前。

所以当执行bind被返回的那个函数被当做构造函数的时候，bind绑定的this值就会失效。
我们看下案例：
```js
var value = 2

var foo = {
  value: 1
}

function bar(name, age) {
  this.hobby = "studying"
  console.log(this.value)
  console.log(name)
  console.log(age)
}

bar.prototype.friend = "randy"

var bindFoo = bar.bind(foo, "mick")

var obj = new bindFoo(18)
// undefined
// mick
// 18

console.log(obj.hobby)
console.log(obj.friend)
// studying
// randy
```
可以看出this失效了，所以我们要完善一下
```js
Function.prototype.myBind = function (context) {
  const self = this
  const args = [...arguments].slice(1)
  var fBound = function () {
    const bindArgs = [...arguments].slice()
    // 用apply 实现this的绑定
    return self.apply(
      this instanceof fBound ? this : context,
      args.concat(bindArgs)
    )
  }

  fBound.prototype = this.prototype

  return fBound
}
```
首先加了`this instanceof fBound` 这个主要是为了判断fBound是不是被当做构造函数使用的，如果是，那么将绑定函数的this指向该实例。`fBound.prototype = this.prototype`修改fBound的prototype是为了绑定函数的prototype,实例就可以继承绑定函数原型中的值了。这也是为什么`new bindFoo`的实例能够访问bar原型的属性。

#### 优化
`fBound.prototype = this.prototype`，当我直接修改fBound的prototype的时候，也会直接修改绑定函数bar的prototype。这时候我们就需要一个空函数来中转：
```js
Function.prototype.myBind = function (context) {
  const self = this
  const args = [...arguments].slice(1)

  var fNOP = function () {}
  var fBound = function () {
    const bindArgs = [...arguments].slice()
    // 用apply 实现this的绑定
    return self.apply(
      this instanceof fNOP ? this : context,
      args.concat(bindArgs)
    )
  }

  fNOP.prototype = this.prototype
  fBound.prototype = new fNOP()

  return fBound
}
```
#### 总结
- 执行bind返回一个新的函数
- bind的参数和返回新的函数的参数会拼接，bind的参数优先级更高
- 如果返回的函数当做构造函数使用的时候，this会失效 
- 修改原型的值需要一个中转优化

[掘金](https://juejin.cn/post/7174790765778829370)