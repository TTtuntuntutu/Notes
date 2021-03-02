## 完美的合作关系

前端框架（React、Vue...）：数据和UI的同步，当数据发生变化的时候，UI自动刷新

```
UI = f(data)
```



响应式编程（Rxjs）：流的源头 => 流数据的处理等 => 数据的订阅、数据的消费

```
data = g(source)
```



所以在前端框架中使用响应式编程并不冲突，甚至在某些场景是完美的合作关系：

```
UI = f(g(source))
```

## 先从React开始：rxjs-hooks

在React中（仅考虑函数式组件）仅有两种形式可直接表达“非一次性赋值”：

- `useMemo`

  ```react
  const greeting = React.useMemo(() => `${greet}, ${name}!`, [greet, name]);
  ```

- `useState`+`useEffect`

  ```react
  const [greeting, setGreeting] = useState(() => `${greet}, ${name}!`);
  
  useEffect(() => {
      setGreeting(() => `${greet}, ${name}!`);
  }, [greet, name]);
  ```



注意：`useMemo`计算数据在render之前，而`useState`+`useEffect`的数据计算逻辑在`useEffect`，在render之后。

想要接入Rxjs，整个管道的搭建，包括Observable的准备、数据处理、数据订阅，甚至是产生一些副作用（tap），而这些超出了`useMemo`的承载力。反观`useEffect`却很适合，所以考虑以`useState`+`useEffect`去扩展。



那首先来一个基础版本：

```react
import * as React from 'react';
import { combineLatest, from, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

const GreetSomeone = ({ greet = 'Hello' }) => {
    const [greeting, setGreeting] = React.useState('');

    React.useEffect(() => {
        const greet$ = of(greet);
      	// fetchSomeName: 远程搜索数据
        const name$ = from(fetchSomeName()).pipe(
            startWith('World'),
            catchError(() => of('Mololongo')),
        );

        const greeting$ = combineLatest(greet$, name$).pipe(
            map(([greet, name]) => `${greet}, ${name}!`)
        );

        const subscription = greeting$.subscribe(value => {
            setGreeting(value);
        });

        return () => {
            subscription.unsubscribe();
        }
    }, []);

    return <p>{greeting}</p>;
};
```

有点模样了，在`useEffect`中搭建了Rxjs流，数据订阅后，把数据记录在组件内用作数据渲染，同时当组件销毁时，取消订阅。



但这里的问题是，prop `greet`是会发生变化的，而`greet$`的数据不会发生更新。怎么解决呢？比如这样：

```react
React.useEffect(() => {
        const greet$ = of(greet);
				
				/**
				 * 同上，流构建逻辑
				**/
    }, [greet]);
```

这样的问题是，每次Rxjs流会因为prop `greet`更新而重新生成，继而接口`fetchSomeName`会再次调用。成本有点大。



怎么解决呢？再引入一个`useEffect`，用Rxjs的`Subject.next`主动去推数据，而保证构建Rxjs流仅执行一次，贴上完整代码：

```react
import * as React from 'react';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

const GreetSomeone = ({ greet = 'Hello' }) => {
  	// 使用React.useRef在组件生命周期保持不变
    const greet$ = React.useRef(new BehaviorSubject(greet));

  	// Subject.next 推数据，使得Rxjs数据更新
    React.useEffect(() => {
        greet$.current.next(greet);
    }, [greet]);

    const [greeting, setGreeting] = React.useState('');
		
  	// 逻辑不变，仅执行一次
    React.useEffect(() => {
        const name$ = from(fetchSomeName()).pipe(
            startWith('World'),
            catchError(() => of('Mololongo')),
        );

        const greeting$ = combineLatest(greet$.current, name$).pipe(
            map(([greet, name]) => `${greet}, ${name}!`)
        );

        const subscription = greeting$.subscribe(value => {
            setGreeting(value);
        });

        return () => {
            subscription.unsubscribe();
        }
    }, [greet$]);

    return <p>{greeting}</p>;
};

```



基于这样的基本认识，来认识一下 [Rxjs-hooks](https://github.com/LeetCode-OpenSource/rxjs-hooks)，自我介绍非常简单：

> React hooks for RxJS 

Rxjs-hooks设计了两个hook，一个是`useObservable`，一个是`useEventCallback`。



看一下`useObservable`：摘除TS类型后，是不是和上面提到的结构是一致的

```react
export function useObservable(
  inputFactory,
  initialState,
  inputs,
){
  const [state, setState] = useState(typeof initialState !== 'undefined' ? initialState : null)
	
  const state$ = useConstant(() => new BehaviorSubject(initialState))
  const inputs$ = useConstant(() => new BehaviorSubject(inputs))

  useEffect(() => {
    inputs$.next(inputs)
  }, inputs || [])

  useEffect(() => {
    let output$
    if (inputs) {
      output$ = inputFactory(state$, inputs$)
    } else {
      output$ = inputFactory(state$) 
    }
    const subscription = output$.subscribe((value) => {
      state$.next(value)
      setState(value)
    })
    return () => {
      subscription.unsubscribe()
      inputs$.complete()
      state$.complete()
    }
  }, []) // immutable forever

  return state
}
```

使用举例：

```react
import React from 'react'
import ReactDOM from 'react-dom'
import { useObservable } from 'rxjs-hooks'
import { of } from 'rxjs'
import { map } from 'rxjs/operators'

function App(props: { foo: number }) {
  const value = useObservable((_, inputs$) => inputs$.pipe(
    map(([val]) => val + 1),
  ), 200, [props.foo])
  return (
    // render three times
    // 200 and 1001 and 2001
    <h1>{value}</h1>
  )
}
```

可见`useObservable`针对props、state去构建Observable，最后返回被订阅的数据。所以入参就是：`inputFactory`、`initialState`、`inputs`。

`useEventCallback`类似，除了hook返回了被订阅的数据外，还返回了`callback`，它处理事件响应的情况：

```react
const event$ = useConstant(() => new Subject<EventValue>())

function eventCallback(e: EventValue) {
  return event$.next(e)
}

return [returnedCallback as VoidableEventCallback<EventValue>, state]
```



## 思考：rxjs落地环境需要的条件

回顾了Rxjs在React中的落地，要解决的问题有3个：

1. UI渲染的数据在哪里定义？
2. Rxjs流在哪里构建？
3. Rxjs流如何使得Observable继续冒出值而流动？



## 动动手：Vue + Rxjs

### 对比开源库的实现