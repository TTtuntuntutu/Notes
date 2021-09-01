##写在前面

最近花时间看了一点ES2019和ES2020新增的特性。


因为之前看了infoQ的一篇文章：[JavaScript and Web Development InfoQ Trends Report 2020 ](www.infoq.com/articles/javascript-web-development-trends-2020/?itm_source=articles_about_Web-Development&itm_medium=link&itm_campaign=Web-Development)


提到：

- ES2020，是自ES2015以来，带来新语言特性最多的一版

  > The annual ECMAScript release, ES2020, is approaching with the greatest number of new language features since ES2015, including optional chaining, BigInt, globalThis, nullish coalescing, and dynamic import. All of these features are considered stable with at least two working browser implementations.

- ES2019，ES2019已经进入早期成熟阶段，支持性尚可

  > ES2019 added the flat and flatMap methods to arrays after the #smooshgate controversy, Object.fromEntries, and a few small improvements to strings and optional catch binding. This relatively small new set of features are now used by an early majority of JavaScript developers.



也因为最近团队开始使用typescript，typescript密切跟随着规范的发展：

> Evolving with Standards
> The TypeScript team contributes to the TC39 committees which help guide the evolution of the JavaScript language.
> When new features have reached stage 3, then they are ready for inclusion in TypeScript.
> For example the TypeScript team championed proposals like Optional Chaining, Nullish coalescing Operator, Throw Expressions and RegExp Match Indices.



再加上团队业务基本不考虑兼容性。


既然土壤已经如此成熟，就兴致勃勃地去种下新特性的种子，看看能否收获果实。

我摘取了对我吸引比较大的。

## ES2020
### 可选链（Optional chaining）

我们在JavaScript中肯定写过类似下面的代码，在这一大串中的任一一个节点值是 `undefined` 或者 `null` 的时候，程序就会报错：

```javascript
const nameLength = db.user.name.length;
```

所以我们会干点体力活，使用 if 语句：

```javascript
let nameLength;
if (db && db.user && db.user.name)
  nameLength = db.user.name.length;
```

或者使用3元运算符：

```javascript
const nameLength =
  (db
    ? (db.user
      ? (db.user.name
        ? db.user.name.length
        : undefined)
      : undefined)
    : undefined);
```

很费劲，可读性也很差。


所以引入了可选链，它的语法是 `?.` 。

回到上面的代码，在使用可选链后，当任意一个节点出现 undefined 或者 null 值的时候，nameLength会赋值 undefined：

```javascript
const nameLength = db?.user?.name?.length;
```

是否一下子就优雅了。


可选链语法还支持表达式和函数调用：

```javascript
obj?.prop
obj?.[expr]
arr?.[index]
func?.(args)
```


此外，可选链 和 空值合并运算符（nullish coalescing operator）一块使用也很香：

```javascript
const object = { id: 123, names: { first: 'Alice', last: 'Smith' }};

// 使用可选链 + 空值合并运算符
const firstName = object?.names?.first ?? '(no first name)';   // → 'Alice'

const middleName = object?.names?.middle ?? '(no middle name)';   // → '(no middle name)'
```


此外：

- 可选链是短路式的，如果链路上任一节点出现 null 或者 undefined值，链路后面的表达式不会再计算：

```javascript
// `age` 仅在 `db` and `user` 存在时会增加
db?.user?.grow(++age);
```

- 可选链和 delete方法一块使用也很智能：

```javascript
// `db.user` 仅在 `db` 存在时会被删除
delete db?.user;
```

### 空值合并运算符（Nullish coalescing operator）

空值合并运算符的语法是 `??` ，和 `&&` 、 `||` 很相似，也是一位短路操作符。

`左表达式 `??` 右表达式`，当 左表达式 值是 `undefined` 或者 `null` 的时候，返回 右表达式，否则返回左表达式。



空值合并运算符和可选链一块使用 已经提到了。

还有一个使用场景，我们希望组件在属性 enabled 值为 true / undefined / null 时，开启某个功能：

```javascript
function Component(props) {
  const enable = props.enabled ?? true;
  // …
}
```

### globalThis

浏览器端的全局对象是 `window`，后端的全局对象是 `global`，如果我们有代码既要跑在浏览器端，又要跑在后端，我们会加类似这样的代码探测：

```javascript
const getGlobalThis = () => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  if (typeof this !== 'undefined') return this;
  throw new Error('Unable to locate global `this`');
};
const theGlobalThis = getGlobalThis();
```



很麻烦，而且效率低（why?）

`globalThis` 关键字的引入，提供了在JavaScript中获取全局对象的统一机制。

### Promise.allSettled

继 `Promise.all`、`Promise.race` 后又一个新的 Promise 组合：`Promise.allSettled`。

`Promise.allSettled` 乖乖地等待所有promise的结果，无论其结果是成功还是 拒绝，对比 `Promise.all` ：

```javascript
var p1 = Promise.all([1,2,3, Promise.reject(555)]);
p1.then(v => console.log(v)).catch(e => console.log(e));    //555

var p2 = Promise.allSettled([1,2,3, Promise.reject(555)]);
p2.then(v => console.log(v.map(pr => pr.status)));  //["fulfilled", "fulfilled", "fulfilled", "rejected"]
```

### String.prototype.matchAll

假设这样一个场景，有下面这串数据，期望返回ing前面的动词，这里就是`['climb','jump','fly'] `：

```javascript
const test = "climbing, oranges, jumping, flying, carrot";
```


考虑构建正则表达式解决问题，构建它：

```javascript
const regex = /([a-z]*)ing/g;
```

有了正则表达式，我们开始想用API去检索数据。

`String.prototype.match` ?

```javascript
const test = "climbing, oranges, jumping, flying, carrot";
const regex = /([a-z]*)ing/g;

test.match(regex);
// ["climbing", "jumping", "flying"]
```

`str#match` 方法应用带g标识的regex，是不支持 capturing groups 的，得到的是带ing的数据，还得手动体力活一下...

`RegExp.prototype.exec` ?

```javascript
const test = "climbing, oranges, jumping, flying, carrot";
const regex = /([a-z]*)ing/g;

const matches = [];

while (true) {
  const match = regex.exec(test);
  if (match === null) break;
  matches.push(match[1]);
}

console.log(matches);
//["climb", "jump", "fly"]
```

`regx#exec` 支持 capturing groups ，可以解决问题，但是很绕...

`String.prototype.matchAll` 以直观、优雅地方式解决这个问题，因为它支持 capturing groups ，而且只能应用带 g 的正则表达式：

```javascript
const test = "climbing, oranges, jumping, flying, carrot";

const regex = /([a-z]*)ing/g;

const matches = [...test.matchAll(regex)];

const result = matches.map(match => match[1]);

result
// ["climb", "jump", "fly"]
```

### 其他

BigInt：跨越了Number.Number.MAX_SAFE_INTEGER限制

```javascript
typeof 123;
// → 'number'
typeof 123n;
// → 'bigint'
```



动态模块加载（Dynamic import）

适用：

1. 按需加载模块
2. 在runtime时计算模块说明符
3. ...

```html
<script type="module">
  (async () => {
    const moduleSpecifier = './utils.mjs';
    const module = await import(moduleSpecifier)
    module.default();
    // → logs 'Hi from the default export!'
    module.doStuff();
    // → logs 'Doing stuff…'
  })();
</script>
```

对比静态模块加载（static import）：

1. 仅接收字符串作为模块说明符
2. 在pre-runtime时绑定引入本地范围
3. 静态模块加载 必须出现在文件的top-level
4. use cases: static analysis、bundling tools、tree-shaking

```html
<script type="module">
  import * as module from './utils.mjs';
  module.default();
  // → logs 'Hi from the default export!'
  module.doStuff();
  // → logs 'Doing stuff…'
</script>
```

<script type="module">
  import * as module from './utils.mjs';
  module.default();
  // → logs 'Hi from the default export!'
  module.doStuff();
  // → logs 'Doing stuff…'
</script>
## ES2019

### Array.prototype.flat

`arr#flat` 的作用非常明确：对数组做层级展开

```javascript
const arr1 = [1, 2, [3, 4]];
arr1.flat(); 
// [1, 2, 3, 4]

const arr2 = [1, 2, [3, 4, [5, 6]]];
arr2.flat();
// [1, 2, 3, 4, [5, 6]]

const arr3 = [1, 2, [3, 4, [5, 6]]];
arr3.flat(2);
// [1, 2, 3, 4, 5, 6]

const arr4 = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]];
arr4.flat(Infinity);
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

比较有意思的是，我们是有其他替换方法，娱乐娱乐！

方法一：`arr#reduce`+`arr#isArray+arr#concat`

```javascript
const arr = [1, 2, [3, 4, [5, 6]]];

// to enable deep level flatten use recursion with reduce and concat
function flatDeep(arr, d = 1) {
   return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
                : arr.slice();
};

flatDeep(arr, Infinity);
// [1, 2, 3, 4, 5, 6]
```

方法二：`generator`

```javascript
function* flatten(array, depth) {
    if(depth === undefined) {
      depth = 1;
    }
    for(const item of array) {
        if(Array.isArray(item) && depth > 0) {
          yield* flatten(item, depth - 1);
        } else {
          yield item;
        }
    }
}

const arr = [1, 2, [3, 4, [5, 6]]];
const flattened = [...flatten(arr, Infinity)];
// [1, 2, 3, 4, 5, 6]
```

新增的数组api还有`Array.prototype.flatMap` ，它相当于`arr.map(fn).flat() `。

### try...catch...支持catch不捕获参数

以前的try...catch...必须是这样的：

```javascript
try {
    throw Error('some random error')
} catch(e) {
    console.log(e)
}
```

现在的try...catch...支持catch不捕获参数了，两种形式都可以～

```javascript
try {
    throw Error('some error')
} catch {
    console.log('no params for catch')
}
```

## typescript配置：tsconfig

要在项目中使用ES2020，需要配置tsconfig，相关的属性是 compilerOptions下的target和lib属性：

```json
{
  "compilerOptions":{
    "target": "ESNEXT"
  }
}
```

- 指定target 值为 ESNEXT 或者 ES2020，target 指定后会默认指定好相关的lib值
- 一般不手动指定lib值，仅有两种场景：
  - 比如 target 指定了ES2020，默认lib是包含"DOM"的，但是我的代码如果不是跑在浏览器，那手动去指定不包含“DOM”的lib值
  - 比如 target 指定了ES5，但是对于ES5+的一些语法做了ployfill，所以得增加lib，在编译过程得告诉typescript这些语法的合法性





## 参考链接

[optional-chaining](https://v8.dev/features/optional-chaining)
[nullish-coalescing](https://v8.dev/features/nullish-coalescing)
[bigint](https://v8.dev/features/bigint)
[dynamic import](https://v8.dev/features/dynamic-import)
[ES2020: Everything You Need to Know](https://www.martinmck.com/posts/es2020-everything-you-need-to-know/)
[JavaScript: What's new in ECMAScript2019(ES2019)/ES10?](https://medium.com/@selvaganesh93/javascript-whats-new-in-ecmascript-2019-es2019-es10-35210c6e7f4b)


