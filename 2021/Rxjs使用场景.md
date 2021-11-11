## 多HTTP请求场景

假设有这样一个场景，需要发送100个请求，如何在保证发起请求成功同时，尽可能快的发送请求？

如何表达：串行、中间地段（越快越好）、并行？

这里使用了Promise、async/await、Rxjs三种表达方式！

<Br/>


### Promise

```javascript
// 并行，没有顺序性
function workInParallel(arr) {
    return Promise.all(arr.map(function(item) {
        return doSomethingAsync(item);
    }));
}
```

```javascript
// 串行
function workInSerial(arr) {
    return arr.reduce(function(promise, item) {
        return promise.then(function(result) {
            return doSomethingAsyncWithResult(item, result);
        });
    }, Promise.resolve());
}
```

```javascript
// 串行+并行： n指定最大并行请求数

// 串行
function workInSerial(arr) {
  function doSomethingAsyncWithResult(item, result) {
    return Promise.resolve([...result, item]);
  }

  return arr.reduce((pr, item) => {
    return pr.then((res) => {
      return doSomethingAsyncWithResult(item, res);
    });
  }, Promise.resolve([]));
}

// 并行
function workInParaller(prs) {
  return Promise.all(prs);
}

async function maxRequest(arr, n) {
  // 分组
  const num = Math.floor(arr.length / n);
  const groupArr = [];
  for (let i = 0; i < arr.length; i = i + num) {
    groupArr.push(arr.slice(i, i + num));
  }

  // 并行+串行
  const res = await workInParaller(groupArr.map((ga) => workInSerial(ga)));
  return res.flat(1);
}

```

- 思路是先单独实现串行、并行，再组合起来、做一点调整就可以了

<Br/>

### async/await

```javascript
// 串行
async function workInSerialEasy() {
  const res1 = await fetch(url1);
  const res2 = await fetch(url2);
  const res3 = await fetch(url3);
  return "when all done";
}

// 注意这里，在for..of循环里，单个执行等待await完成，所以可以作为串行
async function workInSerial(arrs) {
  for (const url of urls) {
    const response = await fetch(url);
    console.log(await response.text());
  }
}
```

```javascript
// 并行
async function workInParaller(urls) {
	
  // 并发读取 url: 而在arr#map的行为和foo循环行为不一致
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });
	
  // 按次序输出
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }	
}
```

```javascript
// 和Promise的处理是一致的

// 串行
async function workInSerial(arr) {
  function doSomethingAsync(item) {
    return Promise.resolve(item);
  }

  const res = [];
  for (const item of arr) {
    const data = await doSomethingAsync(item);
    res.push(data);
  }

  return res;
}

// 并行
async function workInParaller(arr) {
  const res = [];
  const textPromises = arr.map(async (pr) => {
    const data = await pr;
    return data;
  });
  for (const pr of textPromises) {
    const data = await pr;
    res.push(...data);
  }

  return res;
}

async function maxRequest(arr, n) {
  // 分组
  const num = Math.floor(arr.length / n);
  const groupArr = [];
  for (let i = 0; i < arr.length; i = i + num) {
    groupArr.push(arr.slice(i, i + num));
  }

  // 并行+串行
  const res = await workInParaller(groupArr.map((ga) => workInSerial(ga)));
  return res.flat(1);
}
```

<Br/>

### Rxjs

```typescript
// 并行
import { from } from "rxjs";

interface UserSummary {
  id: number;
  name: string;
}

interface UserDetails {
  id: number;
  name: string;
  avatarUri: string;
  // ...
}

function loadUsers(): Promise<UserSummary[]> {
  return fetch("/users").then((response) => response.json());
}

function loadUserDetails(userId: number): Promise<UserDetails> {
  return fetch(`/users/${userId}`).then((response) => response.json());
}

const users$: Observable<UserSummary[]> = from(loadUsers());

const userDetails$ = users$.pipe(
  switchMap((userSummaries) => {
    const userDetailObservables = userSummaries.map((s) =>
      from(loadUserDetails(s.id))
    );
		
    // combineLatest实现
    const userDetails$ = combineLatest(userDetailObservables);
    return userDetails$;
  })
);
```

```typescript
// 串行

// 其他同上...

import { concat } from 'rxjs';
import { toArray } from 'rxjs/operators';

const userDetails$ = users$.pipe(
  switchMap(userSummaries => {
    const userDetailObservables = userSummaries.map(s =>
      from(loadUserDetails(s.id))
    );

    // concat + toArray实现
    const userDetails$ = concat(...userDetailObservables).pipe(toArray());
    return userDetails$;
  })
);
```

```javascript
// 串行+并行：单次发起最大数目请求，这里的`4`就是最大并行量

// 同上...
const userDetails$ = users$.pipe(
  switchMap(userSummaries => {
    const userDetailObservables = userSummaries.map(s =>
      from(loadUserDetails(s.id))
    );

    const chunkSize = Math.ceil(userDetailObservables.length / 4);
    const chunkedUserDetailObservables = _.chunk(
      userDetailObservables,
      chunkSize
    );

    const userDetails$ = combineLatest(
      chunkedUserDetailObservables.map(chunk =>
        concat(...chunk).pipe(toArray())
      )
    ).pipe(map(chunkResults => chunkResults.flat(1)));

    return userDetails$;
  })
);
```

```javascript
// 串行+并行：内置API mergeMap，更加方便

// 同上...

import { mergeMap } from 'rxjs/operators'
const userDetails$ = users$.pipe(
  switchMap((userSummaries) =>
    from(userSummaries).pipe(
      mergeMap((summary) => from(loadUserDetails(summary.id)), 4),
      toArray()
    )
  )
);
```

- By setting the parameter to **1**, all requests will run in serial, while setting it to **Infinity** will result in parallel requests.

<Br/>

### 小结

针对简单的多HTTP请求场景本身，Promise本身的表达能力是足以胜任的，async/await也差不多。

Rxjs当然不输于Promise，但一定要说优势的话，还是落到Operators上。所以在已经使用Rxjs的前提下，用Rxjs去解多HTTP请求场景，是很方便的。但如果因为这个场景而专门引入Rxjs，是不必要的。

<Br/>

## 远程搜索选择框

基于 `switchMap`，再加上 `debounceTime` 做防抖， `distinctUntilChanged` 做去重，增加用户体验。

[DEMO](https://codesandbox.io/s/react-ts-rxjs-njyc7?file=/src/components/boss/SearchInput.tsx)

不使用Rxjs，像`switch`这样的策略如何实现？比如在闭包环境里定义一个时间戳，在定义一个全局变量，每次时间戳生成的时候，时间戳赋值给这个全局变量。最后异步行为的时候，闭包里面的时间戳和全局最新的时间戳比较来决定是否产生副作用。很麻烦吧

反而锦上添花的用户体验是可以做到的，比如 debounce 防抖逻辑是在一个闭包中注入时间差的概念、那在注入一个值的概念就可以做到去重了。这个逻辑相对来说是顺畅的。

显然Rxjs的组合技是更加方便的。

<Br/>

## 表单实时保存草稿

和远程搜索类似，只不过基于`concatMap`，前一次接口请求到位了才会去请求下一次。

这里考虑不使用Rxjs会怎么做，用一个全局变量记录第一次发起的请求，之后再过来的行为，通过`pr.then`形式注入？这个逻辑就比较别扭了。

<Br/>

## 异步按钮：防重复点击

基于`exhaustMap` 

[DEMO](https://codesandbox.io/s/react-ts-rxjs-njyc7?file=/src/components/boss/AsyncBtn.tsx)

现在开发中防重复点击是通过Loading、disabled，从UI层来防止。基于`exhaustMap`，是从js逻辑控制，而增加Loading或者disabled做视觉提示。

<Br/>

## 其他：Subject相关

摘自飞叔：[Rxjs入门指引和初步应用](https://zhuanlan.zhihu.com/p/25383159)

<Br/>

表达这样一个关系：利用`Subject`做一个占位符

```javascript
// 业务关系：
//            工资周期  ———>  工资
//                            ↓
// 房租周期  ———>  租金  ———>  收入  ———>  现金
//                ↑          ↓
//            房子数量 <——— 新购房
```

[DEMO](https://codesandbox.io/s/react-ts-rxjs-njyc7?file=/src/components/rxjs/MoneyHouse.ts:0-166)

<Br/>

对“我们来晚了的订阅者”，实现回放之前错过的一切：

[DEMO-黄蓉郭靖背九阴真经](https://stackblitz.com/edit/y1bxyx?file=index.ts)

<Br/>

## 总结

Rx使用场景的概述，看飞叔这段话：

> 蚂蚁的大部分业务系统前端不太适合用RxJS，大部分是中后台CRUD系统，因为两个原因：整体性、实时性的要求不高。 
>
> 什么是整体性？这是一种系统设计的理念，系统中的很多业务模块不是孤立的，比如说，从展示上，GUI与命令行的差异在于什么？在于数据的冗余展示。我们可以把同一份业务数据以不同形态展示在不同视图上，甚至在PC端，由于屏幕大，可以允许同一份数据以不同形态同时展现，这时候，为了整体协调，对此数据的更新就会要产生很多分发和联动关系。 
>
> 什么是实时性？这个其实有多个含义，一个比较重要的因素是服务端是否会主动向推送一些业务更新信息，如果用得比较多，也会产生不少的分发关系。 
>
> 在分发和联动关系多的时候，RxJS才能更加体现出它比Generator、Promise的优势。

关键字就是：实时性、整体性、分发和联动关系多。

<Br/>

这里挖掘的场景是实时性，当发生请求的行为是频繁的，通过不同的策略做调控。

如果不用Rx，用原生去应付这些场景，很可能要引入中间变量来记录状态值控制，有的逻辑尚可，有的却很别扭。而Rx操作符组合技，可以让你变身魔术师。 