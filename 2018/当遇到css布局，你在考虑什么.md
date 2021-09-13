![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/2/169dc16972f2bee0~tplv-t2oaga2asx-zoom-crop-mark:1304:1304:1304:734.image)

#             当遇到css布局，你在考虑什么？            

CSS布局在前端开发中像呼吸一样——再平常不过的事。然而会有这样的现象：

- 同事A在尝到了Flexbox布局的甜头之后，任何布局都会以`display:flex`打头阵；
- 同事B因为项目得支持IE10，像避开毒蛇一样的避开Flexbox布局方法；

我曾经也是这样的一员。我想为这个问题——*当遇到css布局，你在考虑什么？* 整理一个完整的解决方案。

解决以下这些问题：

- 从什么样的HTML结构出发能够帮助到css布局？
- 你的布局方法武器库都有什么，在具体场景下，选择什么合适的布局方法？
- 需要做支持旧浏览器吗？
- Flexbox、Grid这些布局的方法弄潮儿在旧浏览器中的最佳实践是？
- ...

<Br/>

## 使用语义化标签构建文档流

标准文档流（Normal flow）指的是如果没有改变css布局代码，网页中标签的默认表现方式。比如块级标签`p`挨个从上往下，而内联标签`span`表现得像段落中的文本。当我们创建、自定义一个布局，其实是调整标签在文档流中的位置，或是直接从文档流移除，写布局样式的起点就是文档流。

<Br/>

建议使用语义化标签（semantic  markup），因为可以构建一个结构良好的初始文档流。

HTML5新加了些帮助结构化的标签，[html-document-structured](https://link.juejin.cn?target=https%3A%2F%2Fhtml.com%2Fdocument%2F) 这篇文章可以参考，这里做一个概览：

- `header`：`body`、`main`标签的直接子标签，位置在页面头部，内容可能为logo、标语、搜索提示、导航栏；
- `nav`：导航栏包在`nav`标签内，可能出现在头部、侧边栏、底部等等，这里有个[demo-mdn-nav](https://link.juejin.cn?target=https%3A%2F%2Fcodepen.io%2FTTtuntuntutu%2Fpen%2FXGOYRZ)，神奇的地方在于设置`nav`标签的`display:inline-block`，是作用在`li`标签上的；
- `main`：`body`标签的直接子标签，主内容区域；
- `aside`：侧边栏；
- `article`：一般出现在`main`标签内，`article`标签内可以有`section`、`footer`等标签，是比较独立的内容，比如像博客网站主页的一个文章简介；
- `section`：`section`和`div`很类似，如果使用`div`标签是为了对内容做样式控制，或者为了便于javascript获取做其他操作，那么使用`div`就是你的答案，其他情况就用`section`；
- `address`：提供联系信息，放在`article`标签内提供文章作者信息，放在`main`、`body`、`footer`内提供网站信息；
- `footer`：一般在HTML结构底部，补充网站信息，如果放在`article`内补充文章信息；



<Br/>

## 选择合适的布局方法

css布局方法有很多，如Flexbox、Grid、Float等等等等。在开始之前得把握**两个中心思想**：

1. 从上下文选择合适的布局方法；
2. 一个页面往往会应用多种布局方法，而不是一种布局方法解决所有问题，布局方法间是合作的关系；

<Br/>

### Flexbox

Flexbox是Flexible Box Layout的简称。Flexbox既可以用于整个页面的布局，也可以用于局部部件的布局。Flexbox存在些浏览器兼容性的问题，在旧浏览器中的实践会在之后说明。

#### Flexing sizing of flex items

Flexbox全称Flexible Box Layout中的Flexible（灵活性），是它的**立命之本**。Flexbox的第一个使用场景也呼之欲出——Flexing sizing of flex items，也就是盒子尺寸的高度灵活性：

1. [demo-flexbox-flex](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Fzuzobuderu%2F1%2Fedit%3Fcss%2Coutput)：`section`标签是Flex容器，`article`标签是Flex item，其中前面两个`article`标签`flex:1 200px`，最后一个`article`标签`flex:2 200px`。具体表现为，如果不能提供3个Flex item都是`200px`宽度的空间，则它们仨宽度一致，如果能提供，剩余空间按照1:1:2分配；



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/2/169dc14e704b1192~tplv-t2oaga2asx-watermark.image)





![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/2/169dc15049fb3d77~tplv-t2oaga2asx-watermark.image)



2.  [demo-flexbox-flex-fixedWidthWithFlex](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Freveqeqaka%2Fedit%3Fhtml%2Ccss%2Coutput)：这是实际使用中一个很常见的做法，这里将`footer`标签高度固定，`section`标签因为`flex:1`而占据余下所有空间。在水平方向，也可以是侧边栏宽度固定，主要内容占据余下所有空间；

<Br/>

#### 水平、垂直位置调整

Flexbox提供像`align-items`、`justify-content`这样的属性去调整flex items在主轴（main axis）、副轴（cross axis）的位置。比如最常见的考试题，水平垂直居中某个元素，[demo-flexbox-alignment](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Fyabogejoqe%2Fedit%3Fhtml%2Ccss%2Coutput) ；再比如`justify-content:space-around` 作用于导航条的样式，[demo-flexbox-alignment-justify-content](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Flebepuzuni%2Fedit%3Fhtml%2Ccss%2Coutput)。

<Br/>

#### 调整标签顺序

一般来说，标签出现顺序由源代码中出现顺序决定，Flexbox为Flex items提供了`order`属性，提供从css角度调整Flex items在页面中出现的顺序的能力。

<Br/>

#### 补充一个黑科技

如果为Flex item设置主轴方向（main axis）的`margin`值为`auto`，比如主轴是横向的，设置`margin-left:auto`，这个Flex item会占据往左这个方向的剩余空间：[demo-flex-flex-item-margin:auto](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Fqosegesawo%2Fedit%3Fhtml%2Ccss%2Coutput)。

<Br/>

### Grid

Grid布局，和Flexbox设计为在一个方向布局不同，它帮助我们更加容易地从两个方向上布局元素。Grid布局更加推荐应用于在页面。它同样存在浏览器兼容问题，在旧浏览器中的实践会在之后说明。

<Br/>

#### 优雅的整个页面布局

为什么说它优雅呢？看几个demo就知道了。

[demo-grid-layout](https://link.juejin.cn?target=https%3A%2F%2Fcodepen.io%2FTTtuntuntutu%2Fpen%2FVRgEbR%3Feditors%3D1100)、[demo-grid-layout-grid-template-areas](https://link.juejin.cn?target=https%3A%2F%2Fcodepen.io%2FTTtuntuntutu%2Fpen%2FMxLPvE)：两个demo都实现了最基本的一个页面情况，一个头部、一个侧边栏、一个主要内容区域、一个底部，前者是Grid布局最常规的使用，后者使用了`grid-template-areas`属性；

另外在Grid布局之前，有一些库在做模拟Grid System的工作，将一个页面分成6列或者12列，标签按列去占据页面。Grid布局方法完全有这样一个能力，使用12列布局的Grid重写前面两个demo实现的效果：[demo-grid "framework"](https://link.juejin.cn?target=https%3A%2F%2Fjsfiddle.net%2F6c1htw2f%2F1%2F)；

如果能使用Grid布局整个页面，我是强烈推荐的，它的思维切入点不再是一维，而是二维，这是一场变革。

<Br/>

### Floats

Floats布局方法既可以针对整个页面，也可以针对局部部件，虽然设计之初并不是为了布局整个页面。我是把Floats作为无法使用Grid、Flexbox时候的第一选择。像前面提到的做Grid System的css库，它其实也是将其中的每一个item设置为了`float:left`，然后计算占据宽度的百分比以模拟Grid System。

另外，"floated item"（设置`float:left`或`float:right`）会从文档流中移除。来看看具体应用的demo吧。

<Br/>

#### 文字环绕图片

“文字环绕图片”是Floats设计的初衷：[demo-float-avatar image](https://link.juejin.cn?target=https%3A%2F%2Fcodepen.io%2Fteam%2Fcss-tricks%2Fpen%2F429479abb959d19657fedd04d8f14007)

<Br/>

#### 文本首单词首字母特殊处理

[demo-float-a fun drop-cap effect](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Fhakukavalo%2Fedit%3Fhtml%2Ccss%2Coutput)



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/2/169dc157e4e4d3a2~tplv-t2oaga2asx-watermark.image)



<Br/>

#### 页面布局：一个最常见Floats问题的解决

"Floated item"的高度是不包括在容器标签内，如果高度超出容器标签，会出现显示上的错误，这是Floats应用于页面布局最常见的一个问题：[demo-float-floated items overflow the wrapper](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Fmihiyofavo%2F1%2Fedit%3Fhtml%2Ccss%2Coutput)



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/2/169dc15d2d3f2096~tplv-t2oaga2asx-watermark.image)



解决方案有三种：

1. [demo-float-clearfix hack](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Ffodihosato%2F1%2Fedit%3Fhtml%2Ccss%2Coutput)：在容器标签伪类`::after`清除浮动，或者在容器标签内加一个空的`div`元素清除浮动也可以解决问题；
2. [demo-float-overflow](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Fladaderebe%2F1%2Fedit%3Fhtml%2Ccss%2Coutput)：使用`overflow`属性建立一个BFC，但是小心`overflow:hidden`、`overflow:auto`可能增加了你不需要的显示效果；
3. [demo-float-display:flow-root](https://link.juejin.cn?target=https%3A%2F%2Fjsbin.com%2Fhusunasera%2F1%2Fedit%3Fhtml%2Ccss%2Coutput)：更现代的方法是使用`display:flow-root`建立一个BFC，而且不会像`overflow`增加不需要的显示效果，但是得考虑浏览器支不支持这个属性；



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/2/169dc15fa47fda35~tplv-t2oaga2asx-watermark.image)

<Br/>

### Table layout

在许多年以前，web开发者使用`table`标签做整个页面的布局，将页面内容放入`table`的行和列中，这种方法的问题在于不灵活，而且语义错误（对于屏幕阅读器的用户很不友好）。之所以放入`table`标签能布局，是因为`table`下的这些标签，绑定了可布局的一些列css属性：[demo-using css tables](https://link.juejin.cn?target=https%3A%2F%2Fjsfiddle.net%2FLd0kh2fm%2F)；

"using css tables" 被称作是一种遗留方法（legacy method），用于整个页面布局，适用于不支持Flexbox和Grid的浏览器，但是我这里的最佳替补还是Floats。

<Br/>

### Positioning

Positioning的定位和前面四种不太一样，它一般不用于创建整个页面布局，而是**管理和微调标签，做一个局部位置的调整**。要注意如果已经设置以下几个`position`属性值的标签，层级是高于文档流的，层级可通过`z-index`属性调整。

#### `position:relative` 相对定位，做位置调整

[demo-positioning-relative-left/right](https://link.juejin.cn?target=https%3A%2F%2Fjsfiddle.net%2Fyuz1vbha%2F)：这个例子不是很深动形象，但是demo糙理不糙，确实是通过设置`left`、`top`等属性值去移动位置。

#### `posision:absolute` 绝对定位，做任何可弹出、可拖拽UI部件

MDN上放了这样一个使用场景说明：

> popup information boxes and control menus; rollover panels; UI  features that can be dragged and dropped anywhere on the page; and so  on...

#### `postion:fixed` 固定定位

[demo-position-fixed](https://link.juejin.cn?target=https%3A%2F%2Fjsfiddle.net%2FqLto2d69%2F)：固定表头，表头位置始终定于页面顶部，不随滚动条滚动而滚动。

当然可用于任何需要固定于页面某个位置的UI部件。

#### `position:sticky` 粘性定位

这里有个很经典的例子： [demo-sticky-a scrolling index page where different headings stick to the top of the page as they reach it](https://link.juejin.cn?target=https%3A%2F%2Fjsfiddle.net%2F9p8ry5hb%2F) ；但是在使用时得考虑浏览器兼容问题。

<Br/>

### Multicol

Multicol是Multi-columns layout的简称，它提供了一种在列中布置内容的方法，**类似于文本在报纸中的流动方式，使得阅读更加友好**，不用上下滚动。Multicol的定位是这一种特殊的内容展示布局。

<Br/>

#### 报纸阅读模式

[demo-multi-column layout](https://link.juejin.cn?target=https%3A%2F%2Fjsfiddle.net%2Fzmd5tp9a%2F)：通过在`container`块级元素上设置`column-count`或者`column-width`属性开启Multicol：



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/2/169dc163aee371eb~tplv-t2oaga2asx-watermark.image)



<Br/>

## 支持旧浏览下的Flexbox、Grid实践

最初吸引我做这个话题的原因，是公司项目得支持IE10、IE11，现状是项目中的布局方法没有Grid、鲜有Flexbox，就比较心痒痒，想搞搞明白到底能不能在支持IE10、IE11的情况使用。所以在旧浏览器中的实践重点考虑的是IE10、IE11两位。

<Br/>

### Flexbox: Postcss插件Autoprefixer

浏览器对Flexbox的支持还是挺不错的，IE10支持2012版语法，IE11支持的语法和现代浏览器一毛一样。在IE10和IE11中使用Flexbox存在一些已知的问题，在[caniuse-flexbox](https://link.juejin.cn?target=https%3A%2F%2Fcaniuse.com%2F%23search%3Dflex)有说明，同时还有一个[Flexbugs](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fphilipwalton%2Fflexbugs)是一个问题的列表以及解决措施。

所以这里的最佳实践分两步：

1. 借助Postcss插件为我们自动加上前缀，以支持IE10的2012版语法和现代语法；
2. 使用过程避开在IE10和IE11中使用Flexbox的已知问题，如果还是碰到了在旧浏览器和现代浏览器中表现不一致，去[Flexbugs](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fphilipwalton%2Fflexbugs) 找找有没有相同情况。如果再没有，再考虑替换方案，也可以给 Flexbugs 这个项目提issue；

另外贴两篇Postcss扫盲文章：[Some things you may think about PostCSS... and you might be wrong](https://link.juejin.cn?target=http%3A%2F%2Fjulian.io%2Fsome-things-you-may-think-about-postcss-and-you-might-be-wrong%2F)、[It's Time for Everyone to Learn About PostCSS*What It Really Is; What It Really Does*](https://link.juejin.cn?target=https%3A%2F%2Fdavidtheclark.com%2Fits-time-for-everyone-to-learn-about-postcss%2F)

<Br/>

### Grid: Feature Queries

浏览器对Grid的支持较Flexbox要差很多，IE10、IE11支持的是旧版本的规范，是带有`-ms-`前缀，但即使使用autoprefixer补上了前缀，相同属性名相同属性值在页面中的表现也可能不一致。这样我是不推荐Flexbox实践中的方法，而是使用Feature Queries。

Feature Queries是使用css的`@supports`检测浏览器是否支持参数中的属性属性值，如果支持则渲染花括号中的css代码，类似于：

```css
@supports (display: grid) {
   // code that will only run if CSS Grid is supported by the browser 
 }
```

这里有个细节点，IE10、IE11是不支持`@supports`规则，所以压根不会进入这个条件判断，花括号中的css代码是不会渲染的，这与我们考虑的逻辑：支持`@supports`规则、不支持`display:grid`是不同的，但是最后的结果是一样的。

<Br/>

以一个例子讲述一下整个流程：[demo-creating fallbacks in CSS](https://link.juejin.cn?target=https%3A%2F%2Fjsfiddle.net%2Fcpaq1t7v%2F1%2F)

1. **首先是给旧浏览器做支持**，准备一套Fallback method，保证在所有浏览器上都是工作的：

```css
.wrapper{
  overflow:auto;
}

.item {
  float:left;
  width:33.3%;
}
```

2. **再给支持Grid的浏览器做覆盖**，覆盖代码分两部分，一部分是直接放入对旧浏览没有影响的：

```css
.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
```

因为旧浏览器不支持Grid布局，Grid相关属性旧浏览器都无法解释。在支持的浏览器中使得item由floated item转为grid item，这样的覆盖行为由css规定，更多覆盖情况见[Fallback method](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FLearn%2FCSS%2FCSS_layout%2FSupporting_Older_Browsers%23Fallback_Methods)。另一部分是直接放入对旧浏览器是有影响的，要做Feature queries：

```css
@supports (display: grid) {
  .item {
      width: auto;
  }
}
```

覆盖原有的`width:33.3%`。

<Br/>

没错，这里的实践得写两套样式。所以有人提出问题，写一套支持所有浏览器的不就得了，干嘛非得用Grid？这是个很实际的问题，毕竟写两套，再加测试调试，会增加一定工作量。有几个场景建议使用Grid：

1. 项目得支持IE10、IE11等旧浏览器，但是开发者想尝鲜Grid布局，Feature Queries提供了这样的能力；
2. 项目周期会很长，可能现在不支持Grid布局的浏览器，以后就支持了；
3. 要实现的效果不使用Grid布局很难实现，且对在旧浏览器中访问效果要求不高，能看就行；

<Br/>

### 测试

尤其是支持IE10、IE11的项目，测试是很重要的一个环节，最佳的测试还是在各个浏览器中打开。但这里存在获取浏览器的问题，例如win10系统上仅有IE11，而不能使用IE10等。有些公司有自己的服务器，有各种浏览器可供测试；如果没有的话，可以考虑下载虚拟机：[download the Virtual Machines offered by Microsoft](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.microsoft.com%2Fen-us%2Fmicrosoft-edge%2Ftools%2Fvms%2F) ，或者使用像 [BrowserStack](https://link.juejin.cn?target=https%3A%2F%2Fwww.browserstack.com%2F) 访问远程的虚拟机。

从开发者角度，整个工作流程应该是这样子：

1. 初始开发计划制定；
2. 开发；
3. 测试、发现问题；
4. 修复问题，重复2～4步骤；

<Br/>

## 总结

1. 做css布局：
   1. 布局的出发点是语义化标签；
   2. 考虑在具体场景下使用什么布局方法最合适最简单；
   3. 考虑要不要支持旧浏览器，要明确支持不意味着显示一模一样，可存在体验优秀+体验一般两种模式；
2. Flexbox、Grid考虑旧浏览器（IE10、IE11）的实践：
   1. Flexbox支持性比Grid好，使用Autoprefixer前缀，避开Flexbox bug、已知issues，放开了使用；
   2. Grid布局要想使用，得用Feature Queries的方法，额外准备一套Fallback Methods；
   3. Autoprefixer关闭对Grid属性添加前缀（默认行为）；
3. 测试：
   1. 测试流程：初始开发计划制定 > 开发 > 测试、发现问题 > 修复问题，重复2～4步骤
   2. 借助虚拟机等。



## 参考链接

[MDN-CSS-layout](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FLearn%2FCSS%2FCSS_layout)

[html-document-structured](https://link.juejin.cn?target=https%3A%2F%2Fhtml.com%2Fdocument%2F)

[Using Feature Queries in CSS](https://link.juejin.cn?target=https%3A%2F%2Fhacks.mozilla.org%2F2016%2F08%2Fusing-feature-queries-in-css%2F)

[CSS Grid Layout and Progressive Enhancement](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FCSS%2FCSS_Grid_Layout%2FCSS_Grid_and_Progressive_Enhancement)

[Using CSS Grid: Supporting Browsers Without Grid](https://link.juejin.cn?target=https%3A%2F%2Fwww.smashingmagazine.com%2F2017%2F11%2Fcss-grid-supporting-browsers-without-grid%2F)

[Some things you may think about PostCSS... and you might be wrong](https://link.juejin.cn?target=http%3A%2F%2Fjulian.io%2Fsome-things-you-may-think-about-postcss-and-you-might-be-wrong%2F)

[It's Time for Everyone to Learn About PostCSS*What It Really Is; What It Really Does*](https://link.juejin.cn?target=https%3A%2F%2Fdavidtheclark.com%2Fits-time-for-everyone-to-learn-about-postcss%2F)


