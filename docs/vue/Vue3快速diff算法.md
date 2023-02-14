[上篇](https://juejin.cn/post/7197229913158107192)我们介绍了vue2中的双端diff算法的优势（相比于简单算法相同场景下移动DOM次数更少）。如今Vue3的势头正盛，在diff算法方面也做了相应的变化，利用到了最长递增子序列把性能又提升了一个档次。对于技术栈使用Vue的同学来说又是必须要学习的一部分。

## 性能比较

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c564cd3af7654275b30b4f7a8b1b33a3~tplv-k3u1fbpfcp-watermark.image?)

此图借鉴了《Vuejs设计与实现》这本书

`ivi`和`inferno`所采用的快速diff算法的性能要稍优于Vue2的双端diff算法。既然快速diff算法这么高效，我们当然有必要了解它咯。

## 前置与后置的预处理


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4256d6db032d4bf18be56db7cb8c536a~tplv-k3u1fbpfcp-watermark.image?)

这里有两组子节点，`c1`表示老的子节点，`c2`表示新的子节点。首先将从`c1`和`c2`的头部节点开始对比，如果节点相同则通过patch更新节点的内容。`e1`表示老的子节点的尾部索引，`e2`表示新的子节点的尾部索引。
```js
while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = (c2[i] = optimized
        ? cloneIfMounted(c2[i] as VNode)
        : normalizeVNode(c2[i]))
        // 如果节点相同 则进行递归执行patch更新节点
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        )
      } else {
        // 如果节点不相同，则直接退出
        break
      }
      i++
}
```
然后将索引递增，发现`c1`中节点B和`c2`中节点D不是同一节点，则循环退出。接着将从`c1`和`c2`的尾部节点开始对比，如果节点相同则通过patch更新节点的内容。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ee00634284674f73a9e5c74ee7b94701~tplv-k3u1fbpfcp-watermark.image?)
```js
while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = (c2[e2] = optimized
        ? cloneIfMounted(c2[e2] as VNode)
        : normalizeVNode(c2[e2]))
        // 如果是相同节点 则递归执行patch
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        )
      } else {
        // 如果节点不相同 则退出
        break
      }
      e1--
      e2--
}
```
此过程经历了`c1`的节点C和`c2`的节点C对比，`c1`的节点B和`c2`的节点B对比,节点相同则通过patch更新节点的内容,每次循环`e1` `e2`向前推进。当循环到了`c1`中节点B和`c2`中节点D不是同一节点，则循环退出

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ce3405b699274229a6e349733389d3fb~tplv-k3u1fbpfcp-watermark.image?)

此时当新节点中还有剩余，则需要添加新节点。 相反的，如果旧节点有剩余需要删除旧节点
```js
if (i > e1) {
      // 当索引大于老节点的尾部
      if (i <= e2) {
        // 当索引小于新节点的尾部 需要将剩余的节点添加
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor
        while (i <= e2) {
          patch(
            null,
            (c2[i] = optimized
              ? cloneIfMounted(c2[i] as VNode)
              : normalizeVNode(c2[i])),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          )
          i++
        }
      }
}

else if (i > e2) {
      // 当索引i大于尾部索引e2 则直接删除旧子树从索引i开始到e1部分的节点
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true)
        i++
      }
}
```
上面的情况是有序的，下面我们看下无序的情况

## 节点无序

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d10b3d348c674e20903bd682e54f8ba0~tplv-k3u1fbpfcp-watermark.image?)
上图是经过上面的两层循环之后的结果。我们首先看下代码,由于节点无序情况的代码比较长，我们一段段的解刨
```js
const s1 = i // prev starting index  旧子序列开始索引 从i开始记录
const s2 = i // next starting index  新子序列开始索引 从i开始记录

// 5.1 build key:index map for newChildren
// 根据key 建立新子序列的索引图
const keyToNewIndexMap: Map<string | number | symbol, number> = new Map()
for (i = s2; i <= e2; i++) {
    // 获取新节点
    const nextChild = (c2[i] = optimized
      ? cloneIfMounted(c2[i] as VNode)
      : normalizeVNode(c2[i]))
    if (nextChild.key != null) {
      if (__DEV__ && keyToNewIndexMap.has(nextChild.key)) {
        warn(
          `Duplicate keys found during update:`,
          JSON.stringify(nextChild.key),
          `Make sure keys are unique.`
        )
      }
      //  根据新节点的key 和 对应的索引做映射关系
      // <key, index>
      keyToNewIndexMap.set(nextChild.key, i)
    }
}
let j
// 新子序列已经更新的节点数量
let patched = 0
// 新子序列待更新节点的数量，等于新子序列的长度
const toBePatched = e2 - s2 + 1
// 是否存在需要移动的节点
let moved = false
// 用于跟踪判断是否有节点需要移动的节点
let maxNewIndexSoFar = 0
// 这个数组存储新子序列中的元素在旧子序列节点出的索引，用于确定最长递增子序列
const newIndexToOldIndexMap = new Array(toBePatched)
// 初始化数组 为0
// 0是一个特殊的值，如果遍历之后仍有元素的值为0，则说明这个新节点没有对应的旧节点
for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0
```
`s1`表示旧子节点开始遍历的索引，从`i`开始记录，`s2`表示新子节点开始遍历的索引，也从`i`开始记录。根据新子节点的key建立新子序列的索引图`keyToNewIndexMap`。`patched`表示新子序列已经更新的节点数量，`toBePatched`表示新子序列待更新节点的数量，等于新子序列的长度。`moved`表示是否存在需要移动的节点。`maxNewIndexSoFar`用于跟踪判断是否有节点需要移动的节点。`newIndexToOldIndexMap`存储新子序列中的节点在旧子序列节点的索引，用于确定最长递增子序列，初始化全部为0，0是一个特殊的值，如果遍历之后仍有元素的值为0，则说明这个新节点没有对应的旧节点。我们在图中表示一下
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/388656a2e9cf44abaab5bd2e048bb5e8~tplv-k3u1fbpfcp-watermark.image?)

然后正序遍历旧子序列
```js
// 正序遍历旧子序列
for (i = s1; i <= e1; i++) {
    const prevChild = c1[i]
    if (patched >= toBePatched) {
      // 所有新的子序列节点都已经更新，删除剩余的节点
      // all new children have been patched so this can only be a removal
      unmount(prevChild, parentComponent, parentSuspense, true)
      continue
    }

    let newIndex
    if (prevChild.key != null) {
      // 查找旧子序列中的节点在新子序列中的索引
      newIndex = keyToNewIndexMap.get(prevChild.key)
    } else {
      // key-less node, try to locate a key-less node of the same type
      for (j = s2; j <= e2; j++) {
        if (
          newIndexToOldIndexMap[j - s2] === 0 &&
          isSameVNodeType(prevChild, c2[j] as VNode)
        ) {
          newIndex = j
          break
        }
      }
    }
    if (newIndex === undefined) {
      // 找不到说明旧子序列需要删除
      unmount(prevChild, parentComponent, parentSuspense, true)
    } else {
      // 更新新子序列中的元素在旧子序列中的索引，这里 +1 偏移是为了避免i为0的特殊情况 影响后面最长递增子序列的求解
      newIndexToOldIndexMap[newIndex - s2] = i + 1
      //maxNewIndexSoFar 存储的是上次旧值的newIndex 如果不是一直递增 则说明有移动 
      if (newIndex >= maxNewIndexSoFar) {
        maxNewIndexSoFar = newIndex
      } else {
        moved = true
      }
      patch(
        prevChild,
        c2[newIndex] as VNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized处
      )
      patched++
    }
}
```
每次遍历拿到旧子节点的值`prevChild`，如果`patched >= toBePatched`也就是说新子序列已经更新的节点数量大于等于待更新的节点数量，说明新子序列的所有节点更新完毕，旧子序列中剩余的节点删除即可。

如果每次循环拿到的旧子节点的值的`key`存在，则查找旧子序列中的节点在新子序列中的索引标记为`newIndex`。如果`key`不存在，则遍历新子序列待更新的节点，如果`prevChild`和遍历新子序列待更新的节点有相同的节点，则将索引赋值给`newIndex`。接着判断`newIndex`是否存在，如果不存在，则说明新子序列中找不到旧子序列中的这个节点，则直接删除。如果存在，则更新新子序列中的元素在旧子序列中的索引，这里 ‘+1’ 偏移是为了避免i为0的特殊情况，影响后面最长递增子序列的求解，因为我们现在规定的`newIndexToOldIndexMap`中的元素为0说明这个元素没有对应的老节点，如果不'+1'我们避免不了`i`为0的情况，这样就影响了最长递增子序列的求解。我们看下`newIndexToOldIndexMap`重新赋值之后的结果

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bf72e452f83e41cba6a0bf45cfbc2992~tplv-k3u1fbpfcp-watermark.image?)
`maxNewIndexSoFar`存储的是上次旧值的newIndex,如果不是一直递增 则说明有移动，则`moved`设置为`ture`。然后将`newIndex`对应的新节点和`prevChild`老节点进行`patch`，然后`patched++`记录更新的次数。

我们继续看下面的代码
```js
const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : EMPTY_ARR
j = increasingNewIndexSequence.length - 1
// 倒序遍历 以便使用更新的节点作为锚点
for (i = toBePatched - 1; i >= 0; i--) {
    const nextIndex = s2 + i
    const nextChild = c2[nextIndex] as VNode
    // 锚点指向上一个更新的节点， 如果nextIndex超过新节点的长度，则指向parentAnchor
    const anchor =
      nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode).el : parentAnchor
    if (newIndexToOldIndexMap[i] === 0) {
      // mount new
      // 挂载新节点
      patch(
        null,
        nextChild,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      )
    } else if (moved) {
      // 没有最长递增子序列或者当前节点索引不在最长递增子序列中， 需要移动
      if (j < 0 || i !== increasingNewIndexSequence[j]) {
        move(nextChild, container, anchor, MoveType.REORDER)
      } else {
        j--
      }
    }
}
```
首先判断是否需要移动，如果需要移动怎么才能以移动最少的步数完成更新呢？这就需要用到最长递增子序列（`getSequence`这个方法代码我们贴到文章最后)。我们得到了最长递增子序列的索引值的集合`increasingNewIndexSequence`，我们看下结果。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c39ed582efb4b4e81b1fae2f97d0f9b~tplv-k3u1fbpfcp-watermark.image?)

根据结果我们发现在`newIndexToOldIndexMap`中只有索引为0和1的节点是递增的，所以只有这两个对应的旧的子序列的节点是不需要移动的，其他的则需要移动。

倒序遍历。为什么要倒序遍历呢？因为我们将节点插入到已经更新的节点前面(从后往前遍历可以始终保持当前遍历的节点的下一个节点是更新过的)这里使用的是`insertBefore`。


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8dc397237c994200af6a77b4013e8198~tplv-k3u1fbpfcp-watermark.image?)

比如这个例子节点‘G’就要插入到节点‘E’的前面，节点‘E’是已经更新过的了。

继续往前推进，节点‘B’不在最长递增子序列`increasingNewIndexSequence`中，所以需要移动。然后拿到节点‘B’对应的el插入到节点‘G’的前面。这个节点‘B’的el我们从节点‘B’的`Vnode`上面就可以获取到了。因为当两个新旧节点进行对比的时候会进行下面的操作


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f1e2522a078d475c80c72c5b014c8c70~tplv-k3u1fbpfcp-watermark.image?)

以上就是我们要介绍的Vue3的diff算法的核心内容

### 总结
有序的情况比较简单，我们就直接说无序的情况。
1. 根据`key`建立新子序列的索引图 `keyToNewIndexMap`
   - 通过遍历新子序列的节点 将`key`和`index`映射
2. 根据新子序列中待更新节点的数量`toBePatched`创建数组`newIndexToOldIndexMap`数组初始化为0
   - 这个数组就是保存新子序列中的节点在旧子序列中的索引位置。
3. 遍历旧子节点 拿旧的子节点去`keyToNewIndexMap`中找对应新子节点的位置
   - 如果找不到 则说明这个节点在新的子节点中没有则删除
   - 找到了之后则更新`newIndexToOldIndexMap`,数组中的元素被重新赋值为新子序列中的节点在旧子序列中的索引位置，为0的元素说明这个节点是新增的。
   - 将新旧子节点对比更新
4. 通过最长递增子序列找到那些节点是需要移动的，哪些节点是不需要的移动的
## 最长递增子序列
```js
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    // arrI 为当前顺序取出的元素
    const arrI = arr[i]
    // 排除0的情况
    if (arrI !== 0) {
      // result 存储的是长度为i的递增子序列最小末尾值的索引 
      j = result[result.length - 1]
      // arr[j]为末位置，如果满足arr[j]<arrI 那么直接在当前递增子序列后面添加
      if (arr[j] < arrI) {
        // 存储result更新前的最后一个索引的值
        p[i] = j
        // 存储元素对应的索引值
        result.push(i)
        continue
      }
      // 不满足 则执行二分搜索
      u = 0
      v = result.length - 1
      // 查找第一个比arrI小的节点，更新result的值
      while (u < v) {
        // c记录中间的位置
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          // 若中间的值小于arrI 则在后边 更新下沿
          u = c + 1
        } else {
          // 更新下沿
          v = c
        }
      }
      // 找到第一个比arrI小的位置u，插入它
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
```


[掘金](https://juejin.cn/post/7197676871634255927)