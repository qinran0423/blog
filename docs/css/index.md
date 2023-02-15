# css样式
## 防止高度塌陷
父元素不写高度的时候，子元素写了浮动后，父元素会发生高度塌陷(造成父元素高度为0)

解决：
- 给父元素添加声明overflow:hidden
  - 优点：代码少，简单
  - 缺点：不能和position定位配合使用，超过的尺寸会被隐藏
  ** 其实display:table也行 因为BFC ** 
- 浮动元素下方添加空div,并给元素声明clear:both, 保险起见，再加height: 0。清除个别块元素可能再带的height: 16px
  - 缺点： 需要添加多余的空标签并添加属性
- 万能方式
  ```js
  box::after{
	content: '',
	display: block,
	clear:both,
	height: 0 // 为了清除个别块元素自带的16px高度
  }
  ```
- 父元素添加浮动
  - 缺点：可能产生新的浮动问题  因为BFC

## BFC
### BFC定义
BFC(Block formatting context)直译为"块级格式化上下文"。它是一个独立的渲染区域，只有块级元素参与， 它规定了内部的块级元素如何布局，并且与这个区域外部毫不相干。外部元素也不会影响这个渲染区域内的元素。

简单说：BFC就是页面上的一个隔离的独立渲染区域，区域里面的子元素不会影响到外面的元素。外面的元素也不会影响到区域里面的子元素。

Box，盒子， 是css布局的对象和基本单位，直观点说，就是一个页面是由很多个盒子区域组成。元素的类型和display属性，决定了这个盒子子区域的类型。
- 不同类型的盒子区域内的子元素，会以不同的Formatting context(一个决定如何渲染文档的容器)方式渲染
- 块级元素盒子，display 属性为 block, list-item, table 的元素，会生成 块级元素渲染区域。并且以BFC( block fomatting context)方式渲染；
- 行级元素盒子，display 属性为 inline, inline-block, inline-table 的元素，会生成 行级元素渲染区域。并且以IFC( inline formatting context)方式渲染；

所以，CSS中最常见的渲染方式有两大类：BFC和IFC

### BFC的布局规则
- 默认，内部的块元素会在垂直方向，一个接一个的放置，每个块元素独占一行
- 块元素垂直方向的总距离由margin决定，属于同一个BFC的两个相邻块元素在垂直方向上的margin会发成重合，但是水平方向的margin不会
- 左侧BFC渲染区域的margin，必须与右侧BFC渲染区域的margin相衔接，不能出现重叠
- BFC渲染区域不会与float浮动定义的元素区域重叠
- BFC就是页面上的一个隔离的独立渲染区域，渲染区域里面的子元素不会影响到外面的元素。反之外面的元素也不会影响到渲染区域里边的子元素。
- 计算父元素BFC渲染区域的高度时，内部浮动元素的高度，都必须算在内。

### 如何创建BFC
- float的值不是none
- position的值不是static或者relative。
- display的值是inline-block、table-cell、flex、table-caption或者inline-flex


