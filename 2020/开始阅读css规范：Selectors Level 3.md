# 开始阅读css规范：Selectors Level 3            

## 写在前面

css已经走在css3模块化发展的道路上。

一直觉得css作为前端的一层“皮”，有着不可思议的魅力。再加上我喜欢看原始且完整的文档，打算写一系列css模块规范“观后感”，就叫做 **开始阅读css规范** 。

每一个模块的观后感大致包括两个点：

1. 模块的整体介绍
2. 通过demo讲述模块内容易被忽视，或者比较好玩的地方

这次的主角是 [Selectors Level 3](https://link.juejin.cn?target=https%3A%2F%2Fdrafts.csswg.org%2Fselectors-3%2F)：W3C Candidate Recommendation 30 January 2018。

<Br/>

## Selectors Level 3？

这位角哪怕你未曾听过、未曾阅读过css规范，也能极度丝滑地信手捏来。

比如：找到所有的`span`标签，让它的字体变为红色

```
span {color: red}

```

找所有`span`标签的匹配规则，仅仅是 Selectors 的规则之一。而 Selectors Level 3 是该模块来到了 **3** 的级别，幸运的是 Selectors Level 3已经达到了 REC 阶段，🉑️放心使用。

<Br/>

Selectors Level 3内容包括：

- Groups of selectors
- Simple selectors
  - Type selector
  - Universal selector
  - Attribute selectors
  - Class selectors
  - ID selectors
  - Pseudo-classes
- Pseudo-elements
- Combinators
- specificity

<Br/>

简单说明一下：

- Groups of selectors：选择多个对象
- Simple selectors：简单选择器 => 选择单个对象
- Pseudo-elements：特殊存在，伪元素选择器
- Combinators：组合简单选择器 => 选择单个对象
- specificity：规则优先级，当多个匹配规则落到一个元素上时，谁胜出！

<Br/>

Selectors 是css最最最基本的模块之一，Selectors Level 4也在如火如荼地进行中，比如很期待的 [mdn :has](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FCSS%2F%3Ahas) 。这个模块的发展是在增强元素匹配的能力，Selectors Level 4 也主要在升级伪类（ Simple selectors => Pseudo-classes）的战斗力。

可惜的是目前 Selectos Level 4 处于 WD阶段 (Working Draft)，还没法在生产环境使用。

只能说期待一下吧！

<Br/>

## 忽视

### 咦！Groups of selectors

前面提到 Groups of selectors 是选择多个对象，比如：

```css
/*形式一*/
h1 { font-family: sans-serif }
h2 { font-family: sans-serif }
h3 { font-family: sans-serif }

/*形式二: Groups of selectors*/
h1, h2, h3 { font-family: sans-serif }
```

<Br/>

Groups of selectors的价值就是精简咯。正常情况下，形式一和形式二是等价的，直到...

```css
/*形式一*/
h1 { font-family: sans-serif } 				/*work*/
h2..foo { font-family: sans-serif }		/*fail*/
h3 { font-family: sans-serif }				/*work*/

/*形式二：groups of selectors*/
h1, h2..foo, h3 { font-family: sans-serif } 	/*all fail*/
```

<Br/>

### 哈！鼻祖 Attribute selectors

Class selectors 如何用 Attribute selectors 表示呢，且看！

```css
H1.pastoral { color: green }
H1[class~="pastoral"]
```

注意这里用的是`[att~=val]` ，因为 class 值可能包含多个！

动动小脑筋，ID selectors 如何用 Attribute selectors 表示呢？

<Br/>

### specificity vs 惯性思维！

specificity 的功能前面有提到，这里列一下规则，它用的是3位数字，分别是百位、十位、个位，越靠前优先级越高。

- 百位：ID selectors
- 十位：Class selectors、Pseudo-classes selectors、Attributes selectors
- 个位：type selectors、Pseudo-elements selectors

<Br/>

看这个demo：

html代码：

```css
<span class="selectors_level_3">hello world!</span>
```

css代码：

```css
span[class="selectors_level_3"]{
	color:red;
}

span[class^="selectors"]{
	color:blue;
}

span[class$="3"]{
	color:green;
}
```

结果是什么颜色呢？

起初我以为 `[att=val]`  确切描述属性值，比 `[att^=val]` 描述属性值以`val`开头、`[att$=val]` 描述属性值以`val`结束，更加精确，所以我认为是红色...

啪啪啪！

真是不要你觉得我要我觉得，再看一眼定义优先级的 specificity，楼上这3位都是 Attributes selectors 一个级别的，所以它们不存在优先级的差异。

决定颜色的是写的顺序，所以结果是最后一位的绿色！

<Br/>

### Combinators！

前面提到了，Combinators 描述的是组合关系。

一共有4类：

- Descendant combinators：后代，`A B`：一个空格来表示
- Child combinators：直接子代，`A > B`
- Next-sibling combinator：直接相邻的下一个兄弟元素 `A + B`
- Subsequent-sibling combinator：后面的所有兄弟元素 `A ~ B`  （Selectors Level 3新增！）

<Br/>

## 好玩

### 并集！

引入一个html片段，作为下面css代码的作用对象：

```
<span class="hello world">你好世界</span>
<span class="hello">你好世界</span>
```

原来 Attribute selectors 是可以表达并集的！

```css
span[class~="hello"][class~="world"]{
	color: red;
}
```

仅有第一个“你好世界”会文本显示为红色！

原来 Class selectors 也是可以表达并集的！

```css
span.hello.world {
	color: red;
}
```

也仅有第一个“你好世界”会文本显示为红色！

此外伪类也可以去做并集奥！在下面，发现了吗。

<Br/>

### 解答 Structural pseudo-classes！

这个名字也许你很陌生，我来告诉你这个大家族有哪些人：

- `:nth-child(an+b)`
- `:nth-last-child`
- `:nth-of-type`
- `:nth-last-of-type`
- `:first-child`
- `:last-child`
- `:first-of-type`
- `:last-of-type`
- `:only-child`
- `:only-of-type`

<Br/>

眼熟吧！这些伪类。但是不是又头疼了👀

解释一下，且看`:nth-child(an+b)`！

首先基本认识：我们是从一排兄弟元素中找到我们的目标，且在这排兄弟元素中，排第一的序号是**1**！

那如何找到目标呢，且看`an+b` ，它表达了我们目标所在的序号。

其中`a`、`b`为整数，`n`为整数，且`n>=0`，形如`2n+1` 、`2n`等。

看个demo：

html

```html
<ul>
	<li>1</li>
	<li>2</li>
	<li>3</li>
	<li>4</li>
	<li>5</li>
	<li>6</li>
</ul>
```

css

```css
ul :nth-last-child(2n+1){
	color:red;
}

ul :nth-last-child(2n){
	color:blue;
}
```

我们从前往后数，即`<li>1</li>` 是 `ul` 标签内序号为 1 的兄弟元素

`2n+1` 匹配到的兄弟元素序号为 1、3、5，所以 1、3、5 展示红色；

`2n` 匹配到的兄弟元素序号位 2、4、6，所以 2、4、6 展示为蓝色。

贴心的css还为我们准备了关键字，下面css代码和上面是等价的：

```css
ul :nth-last-child(odd){
	color:red;
}

ul :nth-last-child(even){
	color:blue;
}
```

解释到这里，Structural pseudo-classes 已经讲完了。

<Br/>

(什么？还有这么多伪类！头大！)

咳咳，之所以说解释讲完了，是因为后面的那些伪类都可以以此类推：

- `:nth-last-child`：不过是从后往前数的`:nth-child`
- `:nth-of-type`：不过是`:nth-child`这些兄弟元素加了一个type限定
- `:nth-last-of-type`：不过是倒着数的`:nth-of-type`
- `:first-child` ：`:nth-child(1)`
- `:last-child`：`:nth-last-child(1)`
- `:first-of-type`：`:nth-of-type(1)`
- `:last-of-type` ：`:nth-last-of-type(1)`
- `:only-child` ：`:first-child:last-child`
- `:only-of-type` ：`:first-of-type:last-of-type`

你细品。

<Br/>

## 写在后面

Selectors Level 3到此就结束啦。

因为看的原始文档是英文版，文章出现了中英文混杂的情况，如果影响阅读，还请告知！

另外，demo现完全以代码内嵌在文中，如果放一个playground，比如codepen，是否会帮助理解！

等待你更多的交流和建议！

好啦，happy css coding！

