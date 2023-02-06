
## 简单diff算法
### 更新文本节点
```js
const oldVNode = {
  type: "div",
  children: [{ type: "p", children: " 1" }],
  children: [{ type: "p", children: " 2" }],
  children: [{ type: "p", children: " 3" }],
};

const newVNode = {
  type: "div",
  children: [{ type: "p", children: " 4" }],
  children: [{ type: "p", children: " 5" }],
  children: [{ type: "p", children: " 6" }],
};
```
我们知道，操作DOM的性能开销都比较大，比如我们创建一个DOM的时候，会连带着创建很多的属性。如果我们想将`oldVNode`替换成`newVNode`，最暴力的解法就是卸载所有旧子节点，挂载所有新的子节点，这样就会频繁的操作dom。但是我们根据例子发现，如果说节点都是`p`标签，只是内容发生了改变，那是不是就只可以直接修改内容了，这样就不需要频繁的删除dom,创建dom了。
### key的作用
```js
const oldVNode = [{ type: "p" }, { type: "div" }, { type: "span" }];

const newVNode = [{ type: "span" }, { type: "p" }, { type: "div" }];
```
根据上面的例子，如果操作DOM的话，则需要将旧子节点中的标签和新子节点中的标签进行一对一的对比，如果旧子节点中的`{type: 'p'}`和新子节点中的`{type: 'span'}`不是相同的标签，会先卸载`{type: 'p'}`，然后再挂载`{ type:'span'}`，这需要执行 2 次 DOM 操作。仔细观察可以发现，新旧子节点仅仅是顺序不同，这样就可以通过DOM的移动来完成子节点的更新了。

如果仅仅通过type判断，那么type相同，内容不同呢。比如：
```js
const oldVNode = [
  { type: "p", children: " 1" },
  { type: "p", children: " 2" },
  { type: "p", children: " 3" },
];

const newVNode = [
  { type: "p", children: " 3" },
  { type: "p", children: " 1" },
  { type: "p", children: " 2" },
];
```
这里我们确实可以通过移动DOM来完成更新，但是我们现在继续用type去判断还能行吗？肯定不行的，因为type都是一样的。这时，我们就需要引入额外的**key**来作为vnode的标识。
```js
const oldVNode = [
  { type: "p", children: " 1", key: " 1" },
  { type: "p", children: " 2", key: " 2" },
  { type: "p", children: " 3", key: " 3" },
];

const newVNode = [
  { type: "p", children: " 3", key: " 3" },
  { type: "p", children: " 1", key: " 1" },
  { type: "p", children: " 2", key: " 2" },
];
```
这时我们找到需要移动的元素更新即可了。
### 如何移动呢？

![截屏2023-02-06 22.13.27.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/26c6afa6da6243de9caf75c4aeaa797b~tplv-k3u1fbpfcp-watermark.image?)

比如我们有三个节点，我们希望移动将老的节点更新成为新的节点，此时我们需要一个变量lastIndex为0来记录，只要当前的节点索引小于lastIndex,则说明此节点需要移动。如果当前的索引大于等于lastIndex,则说明此节点不需要移动，并且将当前节点的索引值赋值给lastIndex。
```js
let lastIndex = 0;
for (let i = 0; i < newChildren.length; i++) {
  const newVNode = newChildren[i];
  // 遍历旧的children
  // 在第一场循环中定义变量find,代表是否在旧的一组子节点中找到可复用的节点
  let find = false;
  for (let j = 0; j < oldChildren.length; j++) {
    const oldVNode = oldChildren[j];
    // 如果找到具有相同的key值得两个节点，说明可以复用，仍然需要调用patch函数更新
    if (newVNode.key === oldVNode.key) {
      patch(oldVNode, newVNode, container);
      if (j < lastIndex) {
        // 如果当前找到的节点在旧children中的索引小于最大索引值lastIndex
        // 说明该节点对应的真实DOM需要移动

        // 先获取newVnode的前一个vnode, prevVNode
        const prevVNode = newChildren[i - 1];
        if (prevVNode) {
          // 由于我们要将newVnode对应的真实DOM移动到prevVNode所对应真实DOM后面
          // 所以我们需要获取prevVNode所对应真实DOM的下一个兄弟节点，并将其作为锚点
          const anchor = prevVNode.el.nextSibling;

          // 调用insert方法将newVNode对应的真实DOM插入到锚点元素前面
          // 也就是preVNode对应真实DOM的后面
          insert(newVNode.el, container, anchor);
        }
      } else {
        // 如果当前找到的节点在旧children中的索引不小于最大索引值
        // 则更新lastIndex的值
        lastIndex = j;
      }
      break;
    }

  }
}
```
以上是一个简单的demo实现，则发现需要对旧子节点移动两次才能更新成新的子节点。

![截屏2023-02-06 22.27.46.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/083915e8d5104a05b9764685d6a988cb~tplv-k3u1fbpfcp-watermark.image?)

但是我们仔细观察发现，其实只需要将C移动到最前面，这一步就可以实现了。此时我们就需要**双端diff算法**了
## 双端diff算法
双端diff算法是一种同时对新旧两组子节点的两个断点进行对比的算法。所以我们需要四个索引值，分别指向新旧两组子节点的断点。