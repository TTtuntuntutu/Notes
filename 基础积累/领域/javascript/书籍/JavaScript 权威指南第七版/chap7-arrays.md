## 数组

> JavaScript arrays are untyped

> JavaScript arrays are dynamic

> JavaScript arrays may be sparse

> Every JavaScript array has a length property

> Arrays inherit properties from Array.prototype

> ES6 introduces a set of new array classes known collectively as “typed arrays.”

> Implementations typically optimize arrays so that access to numerically indexed array elements is generally significantly faster than access to regular object properties.

> Arrays that are sufficiently sparse are typically implemented in a slower, more memory-efficient way than dense arrays are, and looking up elements in such an array will take about as much time as regular object property lookup.

### 数组操作

创建数组中提到了方法扩展符和`Array.from` ：

- 扩展符，不仅仅可以后接数组，它可以后接任何  iterable object；
- `Array.from` ，将 an iterable or array-like object 转为数组，参数2⃣️可以指定一个mapping函数，这样比创建数组后再mapping效率高；
- 两者都可以浅复制一份数组；

在提到对数组做读和写操作时候，数组相对于对象有两个特点：

- 数组会自动维护`length`属性；
- `index` 值会自动由数字转为字符串；

稀疏数组的一个特别点：

```jsx
let a1 = [,];           // This array has no elements and length 1
let a2 = [undefined];   // This array has one undefined element
0 in a1                 // => false: a1 has no element with index 0
0 in a2                 // => true: a2 has the undefined value at index 0
```

数组方法分类：

- Array Iterator Methods: to iterate, map, filter, test, and reduce arrays
    - 概括：
        - 稀疏数组中不存在的元素不会被迭代；
        - 第一个参数是一个callback；第二个参数是this指定，如果callback是箭头函数语法就不起作用了；
    - `forEach` 没法在迭代过程中终止；
    - `map` 如果遇到稀疏数组，在迭代过程中会忽略，但是返回的新数组依旧保留，保持一样的`length`；
    - `filter` 遇到稀疏数组，一定会去掉不存在的值；
- Stack and queue methods:
    - `push` + `pop` 实现栈；
    - `push` + `shift` 实现队列；
- Subarray methods
- Searching and sorting methods
    - `indexOf`使用`===`做比较，所以`NaN`是找不出来的，而`includes` 可以；

以上的方法是挂在Array实例上，下面几个是Static Array Function：

- `Array.isArray`、`Array.of`、`Array.from`

### Array-Like Objects

验证：

```jsx
// Determine if o is an array-like object.
// Strings and functions have numeric length properties, but are
// excluded by the typeof test. In client-side JavaScript, DOM text
// nodes have a numeric length property, and may need to be excluded
// with an additional o.nodeType !== 3 test.
function isArrayLike(o) {
    if (o &&                            // o is not null, undefined, etc.
        typeof o === "object" &&        // o is an object
        Number.isFinite(o.length) &&    // o.length is a finite number
        o.length >= 0 &&                // o.length is non-negative
        Number.isInteger(o.length) &&   // o.length is an integer
        o.length < 4294967295) {        // o.length < 2^32 - 1
        return true;                    // Then o is array-like.
    } else {
        return false;                   // Otherwise it is not.
    }
}
```

给Array-Like Objects调用数组方法：

```jsx
let a = {"0": "a", "1": "b", "2": "c", length: 3}; // An array-like object
Array.prototype.join.call(a, "+")                  // => "a+b+c"
Array.prototype.map.call(a, x => x.toUpperCase())  // => ["A","B","C"]
Array.prototype.slice.call(a, 0)   // => ["a","b","c"]: true array copy
Array.from(a)                      // => ["a","b","c"]: easier array copy
```

### Strings as Arrays

调用Arrays方法：

```jsx
Array.prototype.join.call("JavaScript", " ")  // => "J a v a S c r i p t"
```