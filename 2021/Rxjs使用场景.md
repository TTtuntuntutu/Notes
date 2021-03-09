## 多HTTP请求场景

假设有这样一个场景，需要发送100个请求，如何在保证发起请求成功同时，尽可能快的发送请求？

如何表达：串行、中间地段（越快越好）、并行？

这里使用了Promise、async/await、Rxjs三种表达方式！



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



### async/await

```javascript
// 串行
async function workInSerialEasy() {
  const res1 = await fetch(url1);
  const res2 = await fetch(url2);
  const res3 = await fetch(url3);
  return "when all done";
}

// 注意这里，在foo循环里，单个执行等待await完成，所以可以作为串行
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

### 个人小结

针对简单的多HTTP请求场景本身，Promise本身的表达能力是足以胜任的，async/await也差不多。

Rxjs当然不输于Promise，但一定要说优势的话，还是落到Operators上。所以在已经使用Rxjs的前提下，用Rxjs去解多HTTP请求场景，是很方便的。但如果因为这个场景而专门引入Rxjs，是不必要的。



## 远程搜索选择框

基于 `switchMap`，再加上 `debounceTime` 做防抖， `distinctUntilChanged` 做去重，增加用户体验。

[DEMO](https://codesandbox.io/s/react-ts-rxjs-njyc7?file=/src/components/boss/SearchInput.tsx)

不使用Rxjs，像`switch`这样的策略如何实现？比如在闭包环境里定义一个时间戳，在定义一个全局变量，每次时间戳生成的时候，时间戳赋值给这个全局变量。最后异步行为的时候，闭包里面的时间戳和全局最新的时间戳比较来决定是否产生副作用。很麻烦吧

反而锦上添花的用户体验是可以做到的，比如 debounce 防抖逻辑是在一个闭包中注入时间差的概念、那在注入一个值的概念就可以做到去重了。这个逻辑相对来说是顺畅的。

显然Rxjs的组合技是更加方便的。



## 表单实时保存草稿

和远程搜索类似，只不过基于`concatMap`，前一次接口请求到位了才会去请求下一次。

这里考虑不使用Rxjs会怎么做，用一个全局变量记录第一次发起的请求，之后再过来的行为，通过`pr.then`形式注入？这个逻辑就比较别扭了。



## 异步按钮：防重复点击

基于`exhaustMap` 

[DEMO](https://codesandbox.io/s/react-ts-rxjs-njyc7?file=/src/components/boss/AsyncBtn.tsx)

现在开发中防重复点击是通过Loading、disabled，从UI层来防止。基于`exhaustMap`，是从js逻辑控制，而增加Loading或者disabled做视觉提示。