【HTTP请求场景】

假设有这样一个场景，需要发送100个请求，如何在保证发起请求成功同时，尽可能快的发送请求？



串行、中间地段（越快越好）、并行



Promise：

```javascript
// 并行，没有顺序性
function workMyCollection(arr) {
    return Promise.all(arr.map(function(item) {
        return doSomethingAsync(item);
    }));
}
```

```javascript
// 串行
function workQueueCollection(arr) {
    return arr.reduce(function(promise, item) {
        return promise.then(function(result) {
            return doSomethingAsyncWithResult(item, result);
        });
    }, Promise.resolve());
}
```



Rxjs：

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