## 函数
<!--写于2021年-->

定义函数有3种方式：函数声明（declaration）、函数表达式（expression）、箭头函数表达式（arrow functions expression）；

讲清楚函数声明和函数表达式的差别是一个很技术的问题。

先来看一下两者的定义：

> declaration: One of the important things to understand about function declarations is that the name of the function becomes a variable whose value is the function itself.

> expression: A function declaration actually declares a variable and assigns a function object to it. If a function expression includes a name, the local function scope for that function will include a binding of that name to the function object.

函数声明会以函数的名字去定义一个变量，函数声明定义的函数会发生Hoisting，即在当前作用域都可以调用函数；而函数表达式，如果定义了函数名字，这个值为函数名字的变量只会在函数体内获取到，此外，这个函数也仅在赋值在变量之后才可以调用到。

此外箭头函数表达式也有两点差别：

1. `this` 指向（这就不多说了...）；
2. 没有 prototype 属性，无法作为构造函数（constructor functions）被 `new` 调用；

展开来讲讲构造函数调用（即`new`调用）时，发生了什么？

很少使用到的 `Function()` 构造函数：

1. 允许在运行时动态构建函数；
2. `Function()` 创建的函数并不是使用词法作用域，相反，函数体代码的编译类似顶层函数：

    ```jsx
    let scope = "global";
    function constructFunction() {
        let scope = "local";
        return new Function("return scope");  // Doesn't capture local scope!
    }
    // This line returns "global" because the function returned by the
    // Function() constructor does not use the local scope.
    constructFunction()()  // => "global"
    ```

有趣的DEMO：

1. 参数默认值是在函数调用时赋值，可以使用前面定义的参数变量；

   ```jsx
   // This function returns an object representing a rectangle's dimensions.
   // If only width is supplied, make it twice as high as it is wide.
   const rectangle = (width, height=width*2) => ({width, height});
   rectangle(1)  
   // => { width: 1, height: 2 }
   ```

2. `bind` 函数的神奇行为：

   ```jsx
   let sum = (x,y) => x + y;      // Return the sum of 2 args
   let succ = sum.bind(null, 1);  // Bind the first argument to 1
   succ(2)  // => 3: x is bound to 1, and we pass 2 for the y argument
   ```

   - `succ` 是 `bind` 函数执行的返回值，查看 `succ.name` 发现值是 `bound sum` ；