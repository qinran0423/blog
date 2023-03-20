
开启leetcode刷题系列。大佬云：“刷算法就像做数学题，首先要学定义，然后记住公式，最后利用公式和总结的套路去做题“。

我也是个算法小菜鸡，但是算法对于我们程序员来说确实很重要。写文章主要是为了输出，把我刷题的思路记录下来也可以更方便的复盘。当然也希望我的思路对你们也有所帮助。下面开始行动吧！虽然不知道能不能坚持住，先动手再说吧，感兴趣的同学可以联系我哦！

# 设计循环队列
首先我们要知道什么是队列。它通常用于存储和管理需要按顺序处理的数据集合。队列的操作通常分为两种：入队和出队。入队操作将一个元素添加到队列的末尾，而出队操作则从队列的头部移除一个元素。由于队列是一种先进先出（FIFO）的数据结构，因此出队操作总是从队列中最先加入的元素开始。大家可以想象成我们在火车站排队买票。
下面我们用图来表示一下

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/749878f130e24a3792277ef2669c7297~tplv-k3u1fbpfcp-watermark.image?)

以上就是最普通的入队、出队操作。队列有两个指针：头指针、尾指针。通常情况下尾指针是最后一个尾部元素的下一位。上面的`tail`代表的是尾元素。入队操作`tail`向后移动一位。出队操作`head`向后移动一位。
## 假溢出


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fcf5a20a2f5b4288908278511d491dff~tplv-k3u1fbpfcp-watermark.image?)

当出队3个，然后再向队列中插入6，此时已经到了队列的最后一个节点的位置。如果在插入7，对于普通队列来说，这种情况会认为队列满了，也叫作队列溢出。但是此时队列的容量总计是6个，由于出队了3个，所以队列容量还剩三个，所以这种情况被称为”假溢出“。

为了解决队列”假溢出“的现象，所以提出了循环队列。
## 循环队列

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/042ea24342674a3397bd6b753a9695cd~tplv-k3u1fbpfcp-watermark.image?)

当插入7的时候，发现此时队列已经满了，如果`tail`再往后移动一位的时候，发现就指向了一个不存在的位置，但是在循环队列中，就会将`tail`指针重新指向队列的第一位。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/883dc58634ef4632a0c6228979da28ea~tplv-k3u1fbpfcp-watermark.image?)

## 设计循环队列

下面我们就来看[leetcode622. 设计循环队列](https://leetcode.cn/problems/design-circular-queue/)


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69b40b426cdc4249a4aedcbcb5411ebb~tplv-k3u1fbpfcp-watermark.image?)

### MyCircularQueue
我们需要一个头节点，一个尾节点，当前队列中已经存储的数量，以及我们用数组来模拟队列。
```js
var MyCircularQueue = function (k) {
  this.head = 0;
  this.tail = 0;
  this.cnt = 0;
  this.arr = new Array(k);
};
```
我们先把简单的几个方法实现。
### isEmpty
检查循环队列是否为空，只需要判断`cnt`是否为0
```js
MyCircularQueue.prototype.isEmpty = function () {
  return this.cnt === 0;
};
```
### isFull
检查循环队列是否已满,是需要判断`cnt`的值是否和数组的长度相等即可
```js
MyCircularQueue.prototype.isFull = function () {
  return this.cnt === this.arr.length;
};
```
### enQueue
向循环队列插入一个元素。如果成功插入则返回真。
```js
MyCircularQueue.prototype.enQueue = function (value) {
  // 如果队列满了 则插入失败
  if (this.isFull()) return false;
  this.arr[this.tail] = value;
  this.tail = (this.tail + 1) % this.arr.length;
  this.cnt++;
  return true;
};
```

当插入一个元素的时候，要有一个边界条件，就是当队列已经满了的时候，是不能插入的。如果队列没有满，则`tail`对应的节点赋值。然后需要将`tail`节点移动到下一位。如果此时`tail`已经指向了数组的最后一位。那么`tail`就需要指向队列的第一个位置。
### deQueue
从循环队列中删除一个元素。如果成功删除则返回真。
```js
MyCircularQueue.prototype.deQueue = function () {
  if (this.isEmpty()) return false;
  this.head = (this.head + 1) % this.arr.length;
  this.cnt--;
  return true;
};
```
这里同样有个边界条件，如果独队列此时为空，那么是不能删除的。如果队列不为空，则需要将`head`节点向后移动以为。同时`cnt`数量需要减一。也就是下面这种情况。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cdd196b6d19247cb8304aac6fa5144f2~tplv-k3u1fbpfcp-watermark.image?)

### Front
从队首获取元素。如果队列为空，返回 -1 。
```js
MyCircularQueue.prototype.Front = function () {
  if (this.isEmpty()) return -1;
  return this.arr[this.head];
};
```
这里同样有个边界条件，如果独队列此时为空,是没有队首元素的。
### Rear
获取队尾元素。如果队列为空，返回 -1 。
```js
MyCircularQueue.prototype.Rear = function () {
  if (this.isEmpty()) return -1;
  return this.arr[(this.tail - 1 + this.arr.length) % this.arr.length];
};
```
这里同样有个边界条件，如果独队列此时为空,是没有队尾元素的。否则此时队列不为空。但是此时`tail`指针并不是指向的尾部元素，而是尾部元素的下一位。所以如果需要获取队尾元素，需要将`tail - 1`。但是如果此时`tail`为0呢，减一不就是`-1`了吗。所以我们再加上数组的长度，然后再对数组取余，其实是没有任何影响的，大家可以模拟一下。

## 总结
至此呢，我们就设计好了一个循环队列。怎么样，其实也没有很难吧。这道题在leetcode的等级为medium。

[掘金](https://juejin.cn/post/7212235580103475261)
