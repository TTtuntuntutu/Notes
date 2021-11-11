# Scope&Closures

<!--写于2021年-->

作用域和闭包，是JavaScript三大支柱之一。其中，作用域是变量定义和获取的规则，闭包是基于作用域的一种代码组织方式。

<br/>

这篇总结在阅读 [You Don't Know JS Yet: Scope & Closures - 2nd Edition](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/README.md#you-dont-know-js-yet-scope--closures---2nd-edition) 后，回答下面几个核心问题：

1. JavaScript作用域是怎么确定的？
2. JavaScript作用域是怎么起作用的？
3. 在使用JavaScript作用域时应该小心的陷阱？
4. 基于作用域的模式 闭包 是怎么样的？
5. 基于作用域的模式 模块化（Modules） 是怎么样的？

<br/>

## 作用域

### 词法作用域的确定

JavaScript作用域被称为词法作用域（Lexical Scope），所谓词法作用域，指的是作用域是在编译阶段确定的，换句话说，代码一写下就敲定了。

<br/>

这里补一个JavaScript是编译型（Compilation）还是解释型语言（Interpretation）的辩论。

编译型语言，一次性将程序代码全部编译为可执行语言后，再执行；解释型语言，将一行代码编译为可执行语言，执行，紧接着下一行同样的工作。严格意义来说，JavaScript 不是标准的编译型也不是标准的解释型，但是它更倾向于编译型。因为在代码执行之前，在编译阶段，JS引擎会分析整片代码，而不是解释型语言仅着眼于一行。（书中举了很好的[3个例子](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch1.md#required-two-phases)）

抛开以上细节不论，JS引擎对待JS程序有两个阶段：编译阶段，代码执行阶段。

<br/>

作用域确定的具体形态是怎么样的呢？

JS引擎在编译阶段解析到一个块级范围或者函数范围时，会将遇到的变量声明（`var、let、const、function...`）定义到这个作用域里面，块级范围定义的作用域称为块级作用域，函数范围定义的作用域称为函数作用域。因为块级作用域和函数作用域会出现嵌套关系，这就会形成作用域链。其中，顶层的作用域就是 Global Scope。

![作用域链](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/0414c2ab-366b-4758-9aeb-f04e55454c67/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210913%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210913T043320Z&X-Amz-Expires=86400&X-Amz-Signature=556939dd22ea1940ed3d70bacff0dd5696a63509daee97f03424d574733c8888&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)

p.s. 在ES Modules(ESM)中的顶层变量不是全局变量，可以类比为包装了一个function scope。Node JS 文件的顶层变量也不是全局变量。考虑到不同环境获取 "global" 的差异，ES2020引入了 `globalThis` 。

### 作用域起作用逻辑

有必要先提一个作用域“生命周期”的细节点，作用域链在编译阶段定义，但可以理解这个时候仅仅是定义而没有构建。直到运行时，JS引擎进入一个范围时（块级 OR 函数），对应的作用域才会真正地创建，并会和它绑定。

<br/>

在运行时，变量引用可分为 target 和 source 两类，比如：

```jsx
var a = b
// a 是 target，被赋值
// b 是 source
```

JS引擎会顺着作用域链去查询，从当作作用域开始，直到 Global Scope，如果找到就返回，如果没有找到会报错：

```tsx
Reference Error: XYZ is not defined.
```

### 小心陷阱

提升（Hoisting）：这是在编译时定义好的指令，指令内容就是将变量声明移动到作用域（范围）开始位置。当运行时进入这个作用域（范围），指令执行。

<br/>

当 `var、let、const`  发生re-declaration时会发生什么？

- `var` ：没有报错，按照提升的逻辑理解即可；

  ```jsx
  var studentName = "Frank";
  console.log(studentName);   // Frank
  
  var studentName;
  console.log(studentName);   // Frank
  ```

- `let`：SyntaxError；

  ```jsx
  let a = 'a';
  let a = 'b';  // SyntaxError: Identifier 'a' has already been declared
  ```

- `const`：SynaxError、TypeError

  ```jsx
  // case1
  const studentName = "Frank";
  const studentName = "Suzy";  // SynaxError
  
  // case2
  const anotherStudentName = "Frank";
  anotherStudentName = "Suzy";  // TypeError
  ```

<br/>

`let`、`const`  在For循环中的行为解释。

为什么For循环中的`let`序列定义是块级作用域的呢？比如：

```jsx
for (let i = 0; i < 3; i++) {
    let value = i * 10;
    console.log(`${ i }: ${ value }`);
}
```

有个辅助理解的代码类比：

```jsx
{
    // a fictional variable for illustration
    let $$i = 0;

    for ( /* nothing */; $$i < 3; $$i++) {
        // here's our actual loop `i`!
        let i = $$i;

        let value = i * 10;
        console.log(`${ i }: ${ value }`);
    }
    // 0: 0
    // 1: 10
    // 2: 20
}
```

所以在For循环中不能用`const` 定义序列，因为这会发生const的re-declaration：

```jsx
{
    // a fictional variable for illustration
    const $$i = 0;

    for ( ; $$i < 3; $$i++) {
        // here's our actual loop `i`!
        const i = $$i;  
        // ..
    }
}
```

<br/>

[The TDZ](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch5.md#uninitialized-variables-aka-tdz) (temporal dead zone) error 是怎么一回事？

`var`、`const`、`let`定义的变量都会有TDZ的概念，区别是 `var` 的TDZ不可直接观察，具体解释：

1. `var`、`const`、`let`定义的变量都会发生提升，这时变量就会进入TDZ；
2. 区别是编译阶段定义的对于 `var` 的指令，在提升的同时，还会做自动初始化（Auto-initialized），即默认值为`undefined`，而 `let`、`const` 不会，所以变量暂时不可用；
3. 当`let、const`的初始化代码执行的时候，complier指令做变量的初始化，变量从TDZ移除，变量在后面的代码中才可用；

## 常见作用域模式

在理解了Scope的机制之后，下一步是如何在 coding 环节更好地使用它来组织代码。

<br/>

这里提到一个原则 **POLE(Principle Of Least Exposure)** ：即在代码组织上，通过IIFE、BlockScope方式，使得不过度暴露变量在不必要的作用域内。这帮助代码更加易于理解和可维护，避免冲突等一些问题。

### 闭包

首先，闭包是什么？

有一个外层作用域（outer scope），这个外部作用域可以是 Function Scope，也可以是 Block Scope，当这个外层作用域执行结束的时候，它返回一个**函数实例** 。这个函数实例可以获取到原始外层作用域内的变量，这就叫做 **闭合**，也是 Closure 的名字由来。

Block Scope:

```jsx
// 外部作用域也可以是 Block Scope
var hits;
{   // an outer scope (but not a function)
    let count = 0;
    hits = function getCurrent(){
        count = count + 1;
        return count;
    };
}
hits();     // 1
hits();     // 2
hits();     // 3
```

Function Scope:

```jsx
function adder(num1) {
    return function addTo(num2){
        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

<br/>

闭包相关的细节：

1. **闭包和作用域不是一码事，但两者是有关联的。**闭包是基于编译阶段确定的作用域，但是瞧见闭包是一个运行时行为。此外，每一次外层作用域的执行，返回一个函数实例，这个函数实例关联的作用域是独立的；

   ![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3ceac8cc-0c51-4fb6-a32c-d8ba56a4b05b/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3ceac8cc-0c51-4fb6-a32c-d8ba56a4b05b/Untitled.png)

2. 函数实例关联的作用域，不是某一个时刻变量的快照，而是**Live**；

3. [Per Variable or Per Scope?](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md#per-variable-or-per-scope) 这一节讨论了一个函数实例闭合的是，它使用到的变量（包含在外部作用域中），还是整个外层作用域。一些老旧的浏览器闭合的是整个外层作用域，但是新的浏览器会做优化（如果没有`eval` 之类的黑科技的话），减小到使用到的变量，这样未使用的变量就会被自动GC掉；

<br/>

闭包有什么用：

1. 基于POLE的指导思想，闭包是一个代码组织工具，比如防抖、缓存等；

2. 闭包可以去类比函数式编程里面的 partial application and currying(more reusable)，它可以给返回的函数实例，预置一些个逻辑。

   比如：

   ```jsx
   var APIendpoints = {
       studentIDs:
           "<https://some.api/register-students>",
       // ..
   };
   
   var data = {
       studentIDs: [ 14, 73, 112, 6 ],
       // ..
   };
   
   function makeRequest(evt) {
       var btn = evt.target;
       var recordKind = btn.dataset.kind;
       ajax(
           APIendpoints[recordKind],
           data[recordKind]
       );
   }
   
   // <button data-kind="studentIDs">
   //    Register Students
   // </button>
   btn.addEventListener("click",makeRequest);
   ```

   考虑到 这段代码 `var recordKind = btn.dataset.kind;` 在每次事件响应的时候都执行，包一层闭包：

   ```jsx
   var APIendpoints = {
       studentIDs:
           "<https://some.api/register-students>",
       // ..
   };
   
   var data = {
       studentIDs: [ 14, 73, 112, 6 ],
       // ..
   };
   
   function setupButtonHandler(btn) {
       var recordKind = btn.dataset.kind;
   
       btn.addEventListener(
           "click",
           function makeRequest(evt){
               ajax(
                   APIendpoints[recordKind],
                   data[recordKind]
               );
           }
       );
   }
   
   // <button data-kind="studentIDs">
   //    Register Students
   // </button>
   
   setupButtonHandler(btn);
   ```

3. 闭包是构建其他模式的基础；

<br/>

### Modules

Modules的实现方式有很多，也在发生着变化。在进入细节之前，有必要给Modules下一个定义，以及思考为什么要用Modules的方式组织代码。

<br/>

定义一个Module必须满足两个条件：

1. 它是数据和行为的封装；
2. 它有对数据和行为可见性的控制：

所以namespace，不是一个Module，因为没有可见性的控制，它是完全暴露的：

```jsx
// 这是一个反面教材，这是一个 namespace, not module
// 因为各个函数是状态独立的
var Utils = {
    cancelEvt(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
    },
    wait(ms) {
        return new Promise(function c(res){
            setTimeout(res,ms);
        });
    },
    isValidEmail(email) {
        return /[^@]+@[^@.]+\\.[^@.]+/.test(email);
    }
};
```

<br/>

Modules作为代码组织工具的价值，是在于它有着明确的职责边界，同时不过度暴露数据和行为操作。以这种方式构建的软件具有更好的扩展性和维护性。

<br/>

具体构建Modules的方式：

- classic module format(IIFE ⇒ Singleton, Module Factory)
- CommonJS modules are file-based, behave as singleton instances
- ESM is file-based, and module instances are singletons ⇒ assumed to be strict-mode

<br/>

## 有意思的DEMO

```jsx
var greeting = "Hello";

console.log(greeting);

greeting = ."Hi";
// SyntaxError: unexpected token .
```

- 这个代码片段在执行的时候没有输出 `"Hello"` ，证明JavaScript不是一行代码编译一行代码执行的解释型语言，而是在代码执行之前会对整片代码有一个分析，推导出JavaScript更加接近于编译型语言；
- `SyntaxError` 错误在编译阶段发现，所以代码不会再执行；

<br/>

```jsx
const studentName = "Frank";
console.log(studentName); // Frank

studentName = "Suzy";   // TypeError
```

- 与 SyntaxError 在编译阶段抛出代码不会执行 相比，TypeError在运行时抛出，在TypeError之前的代码正常执行！

<br/>

```jsx
var askQuestion = function ofTheTeacher(){
    console.log(ofTheTeacher);
};

askQuestion();
// function ofTheTeacher()...

console.log(ofTheTeacher);  
// ReferenceError: ofTheTeacher is not defined
// ofTheTeacher属于function scope，而不是outer scope
```

- 函数表达式的函数名变量 `ofTheTeacher` 作用域在该函数作用域内，在外不可获取到；




