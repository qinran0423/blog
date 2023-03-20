开启leetcode刷题系列。大佬云：“刷算法就像做数学题，首先要学定义，然后记住公式，最后利用公式和总结的套路去做题“。

我也是个算法小菜鸡，但是算法对于我们程序员来说确实很重要。写文章主要是为了输出，把我刷题的思路记录下来也可以更方便的复盘。当然也希望我的思路对你们也有所帮助。下面开始行动吧！虽然不知道能不能坚持住，先动手再说吧，感兴趣的同学可以联系我哦！

## 设计循环双端队列
所谓循环双端队列和循环队列的区别在于，循环双端队列的队首和队尾都可以执行出队和入队的操作，而循环队列仅仅是头部出队，尾部入队。

话不多说，直接上题

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0dcd504d71ac4ab7a9e41e71b56fcf58~tplv-k3u1fbpfcp-watermark.image?)

其实和我们上一次[设计循环队列](https://juejin.cn/post/7212235580103475261)的思路一样，无非就是拓展了两个功能：头部入队和尾部出队。

### MyCircularDeque
需要一个头节点，一个尾节点，当前队列中已经存储的数量，以及我们用数组来模拟队列。
```js
var MyCircularDeque = function (k) {
  this.head = 0;
  this.tail = 0;
  this.cnt = 0;
  this.arr = new Array(k);
};
```
和设计循环队列一样，先把简单的实现了，这里我就直接copy上篇文章的内容
### isEmpty
检查循环队列是否为空，只需要判断`cnt`是否为0
```js
MyCircularDeque.prototype.isEmpty = function () {
  return this.cnt === 0;
};
```
### isFull
检查循环队列是否已满,是需要判断`cnt`的值是否和数组的长度相等即可
```js
MyCircularDeque.prototype.isFull = function () {
  return this.cnt === this.arr.length;
};
```
### insertFront
将一个元素添加到双端队列头部。 如果操作成功返回 `true` ，否则返回 `false` 。
```js
MyCircularDeque.prototype.insertFront = function (value) {
  if (this.isFull()) return false;
  this.head = (this.head - 1 + this.arr.length) % this.arr.length;
  this.arr[this.head] = value;
  this.cnt++;
  return true;
};
```
由于我们需要从队列头部添加，需要先考虑边界条件，如果此时队列已满，是不能添加的。如果队列没有满，则将`head`向前移动一位，所以`this.head - 1`,考虑到此时`head`为0的情况，向前移动一位则需要添加到队列的尾部了。`(this.head - 1 + this.arr.length) % this.arr.length;`比如`head`为0，队列的长度为3，`head - 1`为 -1， `-1 + 3` 为 2， `2 % 3` 为2，所以此时head的位置为2。还有一种比较好理解的方式。
```js
MyCircularDeque.prototype.insertFront = function (value) {
  if (this.isFull()) return false;
  this.head = this.head - 1;
  if (this.head === -1) {
    this.head = this.arr.length - 1;
  }
  this.arr[this.head] = value;
  this.cnt++;
  return true;
};
```
如果`head`为-1的时候，则将`head`直接指向队列的末尾。和上面的实现方式一样。

最后将移动过的`head`对应的位置赋值，`cnt`递增即可。
### insertLast
将一个元素添加到双端队列尾部。如果操作成功返回 `true` ，否则返回 `false`。
这个就和循环队列的入队的操作是一样的了。
```js
MyCircularDeque.prototype.insertLast = function (value) {
  if (this.isFull()) return false;
  this.arr[this.tail] = value;
  this.tail = (this.tail + 1) % this.arr.length;
  this.cnt++;
  return true;
};
```
当插入一个元素的时候，要有一个边界条件，就是当队列已经满了的时候，是不能插入的。如果队列没有满，则`tail`对应的节点赋值。然后需要将`tail`节点移动到下一位。如果此时`tail`已经指向了数组的最后一位。那么`tail`就需要指向队列的第一个位置。
### deleteFront
从双端队列头部删除一个元素。 如果操作成功返回 `true` ，否则返回 `false`
这个就和循环队列的出队的操作是一样的了。
```js
MyCircularDeque.prototype.deleteFront = function () {
  if (this.isEmpty()) return false;
  this.head = (this.head + 1) % this.arr.length;
  this.cnt--;
  return true;
};
```
这里同样有个边界条件，如果独队列此时为空，那么是不能删除的。如果队列不为空，则需要将`head`节点向后移动以为。同时`cnt`数量需要减一。
### deleteLast
从双端队列尾部删除一个元素。如果操作成功返回 `true` ，否则返回 `false` 。
```js
MyCircularDeque.prototype.deleteLast = function () {
  if (this.isEmpty()) return false;
  this.tail = (this.tail - 1 + this.arr.length) % this.arr.length;
  this.cnt--;
  return true;
};
```
这里同样有个边界条件，如果独队列此时为空，那么是不能删除的。如果不为空，则需要将`tail`向前移动一位。同时`cnt`需要减一。
### getFront
从双端队列头部获得一个元素。如果双端队列为空，返回 `-1` 。
```js
MyCircularDeque.prototype.getFront = function () {
  if (this.isEmpty()) return -1;
  return this.arr[this.head];
};
```
这里同样有个边界条件，如果独队列此时为空,是没有队首元素的。
### getRear
获得双端队列的最后一个元素。 如果双端队列为空，返回 `-1` 。
```js
MyCircularDeque.prototype.getRear = function () {
  if (this.isEmpty()) return -1;
  return this.arr[(this.tail - 1 + this.arr.length) % this.arr.length];
};
```
这里同样有个边界条件，如果独队列此时为空,是没有队尾元素的。否则此时队列不为空。但是此时`tail`指针并不是指向的尾部元素，而是尾部元素的下一位。所以如果需要获取队尾元素，需要将`tail - 1`。但是如果此时`tail`为0呢，减一不就是`-1`了吗。所以我们再加上数组的长度，然后再对数组取余，其实是没有任何影响的，大家可以模拟一下。
## 总结
其实和计循环队列的思路基本一样，就是拓展了两个功能：头部入队和尾部出队。所以整体写下来也不是很难的。
