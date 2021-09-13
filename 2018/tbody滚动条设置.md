文章介绍了如何将滚动条设置在`tbody`标签上，并且表格整体和未设置滚动条一致；此外补充了一些`table`的冷门知识。

<Br />

#### How to set tbody height with overflow scroll

[问题demo](http://jsfiddle.net/amit4mins/f2XYF)

[解决问题demo](http://jsfiddle.net/f2XYF/8/)

<Br />

要想给tbody一个超出的滚动条，其实只需要给tbody设置一个固定`height`，以及`overflow:auto`也就是超出添加滚动条。但是table固有的`display`属性使得为thead和tbody设置`height`没有用。

<Br />

这里首先做的就是改变`display`属性：


```css
table,thead,tbody{
    display:block
}
```

之后可以设置`height`，但是在设置`height`后，这时候表格的样式扭曲了，表现为问题demo表二，为了保持样式正常，需要：


```css
thead, tbody tr {
    display:table;
    width:100%;
    table-layout:fixed;
}
```

`display:table`使得`tr`标签表现为一个`table`,`table-layout:fixed`和设置宽度的`width:100%`是一套组合拳，使得这个"table"的第一行宽度为`100%`，并且每一列宽度是一致的，后面所有行按照第一行对齐，如果内容超出就出现滚动条。

<Br />

如果想使得`thead`和`tbody`宽度保持一致，需要额外去除`thead`多余的滚动条的宽度，比如：

```css
thead {
    width: calc( 100% - 1em )
}
```

<Br />

这之后每一列的列宽是一致的。存在的问题是如果提前使用标签`colgroup`设置不同列宽，这里是丢失的。

不是很好的解决方法是重新再去为`th`、`td`设置宽度，比如：


```css
th:nth-child(1),
td:nth-child(1) {
  width: 5%;
}
th:nth-child(2),
td:nth-child(2) {
  width: 6.7%;
}
```

<Br />

#### 顺便补充一下关于`table`的冷门姿势

什么时候去用`table`呢？tables are for tabular data. 啥意思呢？比如乘法口诀表...

不要用`table`去布局！因为html标签是语义化的，多余语义化的标签对screen readers不友好。

<Br />

##### `thead`、`tbody`、`tfoot`

只有一个表头推荐使用这个三个元素去包裹行（`tr`元素），语义化指定。

这里`tfoot`元素是特殊的，推荐在html中`tfoot`是放在`thead`之后，`tbody`之前。（但是渲染结果还是在最后的）理由：

> this is an accessibility concern, as the footer may contain information necessary to understand the table, it should be before the data in the source order.

[demo](https://codepen.io/chriscoyier/pen/mIjil?editors=1000)

<Br />

##### `td`、`th`

cells。其中`th`不限制只在`thead`中使用，它只是简单表示标题信息。比如双轴情况就跳过不使用`thead`了，[双轴](https://codepen.io/chriscoyier/pen/qJBpF)。

<Br />

##### cells合并

`rowspan`是多行合并，`colspan`是多列合并，比较常见的是组织table headers：[demo](https://codepen.io/chriscoyier/pen/AlxGt?editors=1100)。

<Br />

##### 基本样式

使用colors、lines去区分表格的各个部分。

默认情况下，table cells之间间隔2px（通过用户代理样式表）：

```css
table {
    border-collapse: separate;
    border-spacing: 2px;
}
```

可以去设置这个值的大小：

```css
table {
  border-spacing: 0.5rem;
}
```

更常见的是移除这个值：

```css
table {
  border-collapse: collapse;
}
```

[demo](https://codepen.io/chriscoyier/pen/kaErt)

<Br />

##### `table`的宽度

table元素有点儿像`display:block`，因为一个table元素会在新一行去显示。但是它的宽度...需要多宽就是多宽，也不能去设置。cell不换行，text默认换行：[demo](https://codepen.io/chriscoyier/pen/ILrKi?editors=1100)

<Br />

#### 参考链接

[how-to-set-tbody-height-with-overflow-scroll](https://stackoverflow.com/questions/23989463/how-to-set-tbody-height-with-overflow-scroll)

[A Complete Guide to the Table Element](https://css-tricks.com/complete-guide-table-element/)


