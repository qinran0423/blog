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
双端diff算法是一种同时对新旧两组子节点的两个断点进行对比的算法。所以我们需要四个索引值，分别指向新旧两组子节点的端点。


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbcb0654d44d474f9f4682191a0752eb~tplv-k3u1fbpfcp-watermark.image?)

### 比较方式
在双端diff算法比较中，每一轮比较都会分成4个步骤

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/704760157d224068bd80f5e00871133a~tplv-k3u1fbpfcp-watermark.image?)
- **第一步**：旧子节点的开始节点和新子节点的开始节点进行对比，看看他们是否相同。根据他们的标签和key判断，两个节点不相同，所以什么都不做
- **第二步**：旧子节点的结束节点和新子节点的结束节点进行对比，看看他们是否相同。根据他们的标签和key判断，两个节点不相同，所以什么都不做
- **第三步**：旧子节点的开始节点和新子节点的结束节点进行对比，看看他们是否相同。根据他们的标签和key判断，两个节点不相同，所以什么都不做
- **第四步**：旧子节点的结束节点和新子节点的开始节点进行对比，看看他们是否相同。根据他们的标签和key判断，两个节点相同，说明节点可以复用，此时节点需要通过移动来更新。

那又该怎么移动呢？

根据对比我们发现，我们在第四步是将旧子节点的结束节点和新子节点的开始节点进行对比，发现节点可复用。说明节点’D‘在旧子节点中是最后一个节点，在新子节点中是第一个节点，而我们要**操作的是老节点也就是现有节点**，来实现视图的更新。所以我们只需要**将索引 oldEndIdx 指向的虚拟节点所对应的真实DOM 移动到索引 oldStartIdx 指向的虚拟节点所对应的真实 DOM前面**。我们看下源码：
```js
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) { 
        // 老的开始节点 和 新的开始节点一样
       ···
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 老的结束节点 和 新的结束节点一样
       ···
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 老的开始节点 和 新的结束节点一样
       ···
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // 老的结束节点 和 新的开始节点一样
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        // 将老的结束节点 塞到 老的新节点之前
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {  // 非理想状态下的处理方式
        ···
      }
    } 
  }
  ```
  从源码中我们看到执行了`patchVnode`。这个函数其实就是将需要对比的两个新老节点进行打补丁，因为我们此时只能确认新老节点他们的标签和key是一样的，并不代表他们的内容一样，所以需要先更新节点的内容，然后再修改节点的位置。最后我们只需要以头部元素`oldStartVNode.elm` 作为锚点，将尾部元素 `oldEndVNode.elm` 移动到锚点前面即可。最后涉及的两个索引分别是`oldEndIdx`和`newStartIdx`，所以我们需要更新两者的值，让它们各自朝正确的方向前进一步，并指向下一个节点。
 
 
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/98de34827a1f4893824337a67504144f~tplv-k3u1fbpfcp-watermark.image?)

接着继续进行**下一轮对比**：


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c52ae92862447c4bc9163b25a23172c~tplv-k3u1fbpfcp-watermark.image?)
还是按照我们上面说的那4步对比。此时，当我们执行第二步对比的时候，发现老的结束节点和新的结束节点是一样的。所以就会执行以下操作：
```js
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) { 
        // 老的开始节点 和 新的开始节点一样
       ···
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 老的结束节点 和 新的结束节点一样
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 老的开始节点 和 新的结束节点一样
       ···
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // 老的结束节点 和 新的开始节点一样
       ···
      } else {  // 非理想状态下的处理方式
        ···
      }
    } 
}
```
这里就只需要通过`patchVnode`更新新旧子节点的内容，然后更新`oldEndIdx`和`newStartIdx`，让它们各自朝正确的方向前进一步，并指向下一个节点。

接着继续进行**下一轮对比**：


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d94848c536e47df96c5696fb26a0709~tplv-k3u1fbpfcp-watermark.image?)

当对比到第三步的时候，发现老的开始节点和新的结束节点一样
```js
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) { 
        // 老的开始节点 和 新的开始节点一样
       ···
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 老的结束节点 和 新的结束节点一样
       ···
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 老的开始节点 和 新的结束节点一样
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        // 将老的开始节点 塞到 老的结束节点后面
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // 老的结束节点 和 新的开始节点一样
       ···
      } else {  // 非理想状态下的处理方式
        ···
      }
    } 
}
```
首先通过`patchVnode`更新新旧子节点的内容。旧的一组子节点的头部节点与新的一组子节点的尾部节点匹配，则说明该旧节点所对应的真实 DOM 节点需要移动到尾部。因此，我们需要获取当前尾部节点的下一个兄弟节点作为锚点，即 oldEndVNode.el.nextSibling。最后，更新相关索引到下一个位置。


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ddc173e3d3e94c71907d5ac1f3c1dd76~tplv-k3u1fbpfcp-watermark.image?)

接着继续进行**下一轮对比**：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02b2ebb658954975ae84caccff371a69~tplv-k3u1fbpfcp-watermark.image?)
这里就只需要通过`patchVnode`更新新旧子节点的内容,发现内容一样什么都不做，然后更新`oldEndIdx`和`newStartIdx`，让它们各自朝正确的方向前进一步，并指向下一个节点，这就退出了循环。

以上是理想情况下的处理方式，当然还有非理想情况下的处理方式
### 非理想情况的处理方式
比如：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a393f405e7d402d843c1483c8f229d4~tplv-k3u1fbpfcp-watermark.image?)
此时我们发现之前说的情况都无法命中，所以我们只能通过增加额外的步骤去处理。由于我们都是对比的头部和尾部，既然都无法命中，那就试试非头部、非尾部节点能否复用。此时我们可以发现新子节点中头部节点和旧子节点中的第二个节点是可以复用的，所以只需要将旧子节点中的第二个节点移动到当前旧子节点的头部即可。
```js
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) { 
        // 老的开始节点 和 新的开始节点一样
       ···
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 老的结束节点 和 新的结束节点一样
       ···
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 老的开始节点 和 新的结束节点一样
       ···
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // 老的结束节点 和 新的开始节点一样
       ···
      } else {  // 非理想状态下的处理方式
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          // 新的一组子节点的头部 去 旧的一组节点中寻找
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          // 拿到新节点头部 在旧的一组节点中对应的节点
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) { // 如果是相同的节点 则patch 
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            // 将老的节点中对应的设置为undefined
            oldCh[idxInOld] = undefined
            // 移动节点 
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    } 
}
```
首先那新的子节点的头部去旧的一组子节点中寻找，如果没有找到，说明这个节点是一个新的节点，则直接创建节点。如果找到了，通过索引去获取对应的旧节点的信息，如果节点可复用，则需要将当前旧节点移动到头部即可。最后更新新节点的开始节点的索引位置。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e286de3c19546ba8198ebbc65595fda~tplv-k3u1fbpfcp-watermark.image?)

