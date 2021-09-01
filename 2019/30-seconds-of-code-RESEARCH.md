### 说在前面

在前端日常开发中，经常会遇到后端接口返回的数据结构，和前端组件需要的数据结构不一致的情况，很多时候需要前端来做这个转换。比较多的是 `Array` 类型的转换，这个事儿比较费时间。所以想找找有没有开源的snippet集合直接拿来用，而且最好是原生JavaScript实现。

偶尔看到了这个[30 seconds of code](https://www.30secondsofcode.org/list)网站，之所以取这个名字，它是希望每个snippet可以在30s或者以内被理解。嗯...整个网站风格很符合前端审美...简单实用。进入[github:30-seconds-of-code](https://github.com/30-seconds/30-seconds-of-code) ，了解到star数还挺多，以及 30-seconds-of-code 仅仅是 30 seconds 这个系列的代表作，其他还有css、react等，详情移步这里：[github:30 seconds](https://github.com/30-seconds)。

一拍即合。

<br />

### 定位

我对这个网站定位类似于MDN，有需要的工具来这里查，有时间来看一下方法具体的实现细节。

在[about](https://www.30secondsofcode.org/about)有提到：有些snippets可能不大适合大型的企业级应用。稍微留意下。

> #### Our work
>
> In order to help grow the open source community, we have collected hundreds of snippets that can be of use in a wide range of situations. We welcome new contributors and we like fresh ideas, as long as the code is short and easy to grasp in about 30 seconds.
>
> **The only catch, if you may, is that a few of our snippets are not perfectly optimized for large, enterprise applications and they might not be deemed production-ready.** We strive, however, to keep our collections up to date and add content as often as possible to ensure we cover a wide variety of topics and techniques.

<br />

### JavaScript

这一周有看到一些有意思的snippts，在这里摘录的考虑点不是实用性，有些是思维角度独特，有些是API冷门地方。Array、String、Type、Utility也是网站内的一个分类。

做一下记录。

#### Array

`allEqual`：判断数组内元素是否相等。

【思维】这里做了一个角度切换，不去互相之间比较是否相等，竖了一个靶，转为所有元素和`arr[0]`比较：

```javascript
const allEqual = (arr) => arr.every((val) => val === arr[0])
```

<br />

`findLastIndex`：返回数组中，函数执行结果为true的，最后一个元素的index

【思维】摘出来是因为这行`.map((val,i)=>[i,val])`，妙哉

```javascript
const findLastIndex = (arr, fn) =>
  (arr
    .map((val, i) => [i, val])
    .filter(([i, val]) => fn(val, i, arr))
    .pop() || [-1])[0]
```

<br />

`bifurcateBy`：根据一个函数将一个数组分为两组。

【Api】`arr#reduce`真的很适合做数据聚合；

【操作符】[逗号操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Comma_Operator)对它的每个操作数求值（从左到右），并返回最后一个操作数的值，进一步简化箭头函数：

```javascript
const bifurcateBy = (arr, fn) =>
  arr.reduce((acc, val, i) => (acc[fn(val, i) ? 0 : 1].push(val), acc), [[], []])
```

<br />

`chunk`：将一个数组，分成指定size的多块。

【Api】`Array#from`能将两种类型转为数组，array-like objects（一种是有`length`属性的对象，比如`{length:3}`和熟悉的`arguments`，另一种是indexed elements，比如字符串）、iterable objects（比如`Map`和`Set`）。另外`Array#from`还提供第二个可选参数`mapFn`：

```javascript
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  )
```

<br />

`deepFlatten`：数组展开，比如 `[1, [2], [[3], 4], 5]` => `[1,2,3,4,5]`

【Api】`Array#concat`的参数，即合并的目标，可以是数组，也可以是值。利用递归展开嵌套的数组。

```javascript
const deepFlatten = (arr) =>
  [].concat(...arr.map((v) => (Array.isArray(v) ? deepFlatten(v) : v)))
```

<br />

`filterNonUnique`：返回数组中唯一存在的元素组成的数组

【Api】`arr#indexOf`的兄弟`arr#lastIndexOf`

```javascript
const filterNonUnique = (arr) => arr.filter((i) => arr.indexOf(i) === arr.lastIndexOf(i))
```

<br />

#### String

`capitalize`：单词首字母大写

【Api】这里的解构的target居然是一个字符串，而且还神奇地起作用了。

```javascript
const capitalize = ([first, ...rest], lowerRest = false) =>
  first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''))
```

<br />

本着探索的精神～找到了这篇文章：[掘金：【译】JS解构的五种有趣用法](https://juejin.im/post/5d673044f265da03d60f12f7)

提了JS解构的5个有趣操作：

1. 交换变量（再也不用一个中间变量了）

   ```javascript
   let a = 1;
   let b = 2;
   
   [a, b] = [b, a];
   
   a; // => 2
   b; // => 1
   
   /* ----  滑腻腻的分割线  ----*/
   
   let zero = 2;
   let one = 1;
   let two = 0;
   
   [zero, one, two] = [two, one, zero];
   
   zero; // => 0
   one;  // => 1
   two;  // => 2
   ```

2. 访问数组元素，如果不存在设置默认值

   ```javascript
   const colors = [];
   
   const [firstColor = 'white'] = colors;
   
   firstColor; // => 'white'
   
   const [, secondColor = 'black'] = colors;
   
   secondColor; // => 'black'
   ```

3. 不可变操作，浅拷贝

   ```javascript
   const numbers = [1, 2, 3];
   
   const [, ...fooNumbers] = numbers;
   
   fooNumbers; // => [2, 3]
   numbers; // => [1, 2, 3]
   
   /* ----  滑腻腻的分割线  ----*/
   
   const big = {
    foo: 'value Foo',
    bar: 'value Bar'
   };
   
   const { foo, ...small } = big;
   
   small; // => { bar: 'value Bar' }
   big; // => { foo: 'value Foo', bar: 'value Bar' }
   ```

4. 可解构的值，除了数组和一般对象以外，还有所有可迭代对象，例如类数组、字符串、`set`、`map`

5. 解构动态属性

   ```javascript
   function greet(obj, nameProp) {
    const { [nameProp]: name = 'Unknown' } = obj;
    return `Hello, ${name}!`;
   }
   
   greet({ name: 'Batman' }, 'name'); // => 'Hello, Batman!'
   greet({ }, 'name'); // => 'Hello, Unknown!'
   ```

<br />

这里的3是`capitalize`能工作的原因。其中1我感觉蛮特别的。

<br />

#### Type

`getType`：返回值的类型

【思维】之前稳妥的获取值类型的方法是`Object.prototype.toString.call(xxx)`，居然可以通过`constructor.name`去获得，当然对`undefined`和`null`做了特殊处理

```javascript
const getType = (v) =>
  v === undefined ? 'undefined' : v === null ? 'null' : v.constructor.name.toLowerCase()
```

<br />

`isPromiseLike`：判断值是否是一个Promise

【思维】判断是不是一个promise，一般就是判断有没有`then`属性，这没啥。这里的细节点在于`obj !== null`，排除特殊情况。

```javascript
const isPromiseLike = (obj) =>
  obj !== null &&
  (typeof obj === 'object' || typeof obj === 'function') &&
  typeof obj.then === 'function'
```

<br />

#### Utility

`toDecimalMark`：返回数字的千位分割

【思维】数字的千位分割，之前一直用正则，比如：`/(?!^)(?=(\d{3})+$)/g`，原来可以这样...

```javascript
const toDecimalMark = (v) => (+v).toLocaleString('en-US')
```

<br />

`nthArg`：返回数组中第`n`个元素（吐槽，这个例子感觉没啥用）

【思维】这里是一个偏函数的做法（柯里化和偏函数都是参数复用，本质上是**降低通用性，提高适用性**）

```javascript
nthArg = n => (...args) => args.slice(n)[0];
```

<br />

### 贡献

[给30-seconds-of-code做一些贡献](https://github.com/30-seconds/30-seconds-of-code/blob/master/CONTRIBUTING.md)。






