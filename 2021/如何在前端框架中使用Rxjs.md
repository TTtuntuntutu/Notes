## 完美的合作关系

前端框架（React、Vue...）：数据和UI的同步，当数据发生变化的时候，UI自动刷新；

```
UI = f(data)
```



响应式编程（Rxjs）：关注的点在数据，从流的源头，到流数据的处理等，再到数据的订阅、数据的消费；

```
data = g(source)
```



所以在前端框架中使用响应式编程并不冲突，甚至在某些场景是完美的合作关系：

```
UI = f(g(source))
```

是不是和MV定义很像：
> MVVM happens to be a good fit for Rx*. 
> Quoting Wikipedia:
>
> >The view model of MVVM is a value converter meaning that the view model is responsible for exposing the data objects from the model in such a way that those objects are easily managed and consumed. In this respect, the view model is more model than view, and handles most if not all of the view’s display logic.

## 先从React开始：rxjs-hooks

在React中（仅考虑函数式组件）仅有两种形式可直接表达“非一次性赋值”：

- `useMemo`

  ```javascript
  const greeting = React.useMemo(() => `${greet}, ${name}!`, [greet, name]);
  ```

- `useState`+`useEffect`

  ```javascript
  const [greeting, setGreeting] = useState(() => `${greet}, ${name}!`);
  
  useEffect(() => {
      setGreeting(() => `${greet}, ${name}!`);
  }, [greet, name]);
  ```



注意：`useMemo`计算数据在render之前，而`useState`+`useEffect`的数据计算逻辑在`useEffect`，在render之后。

想要接入Rxjs，整个管道的搭建，包括Observable的准备、数据处理、数据订阅，甚至是产生一些副作用（tap），而这些超出了`useMemo`的承载力。反观`useEffect`却很适合，所以考虑以`useState`+`useEffect`去扩展。



那首先来一个基础版本：

```javascript
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

```javascript
React.useEffect(() => {
        const greet$ = of(greet);
				
				/**
				 * 同上，流构建逻辑
				**/
    }, [greet]);
```

这样的问题是，每次Rxjs流会因为prop `greet`更新而重新生成，继而接口`fetchSomeName`会再次调用。成本有点大。



怎么解决呢？再引入一个`useEffect`，用Rxjs的`Subject.next`主动去推数据，而保证构建Rxjs流仅执行一次，贴上完整代码：

```javascript
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

```javascript
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

```javascript
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

基于同样的想法，在Vue中实现一下Rxjs的使用：

```vue
<template>
  <div>{{ greeting }}</div>
</template>

<script>
import { from, combineLatest, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

let subscription = null,
  greet$ = null;

export default {
  name: "TryRxInVue",
  props: {
    greet: {
      type: String,
      default: "hello",
    },
  },
  data() {
    return {
      greeting: "",
    };
  },
  // 监听依赖，使得流动
  watch: {
    greet(value) {
      this.greet$.next(value);
    },
  },
  // 不同生命周期钩子
  mounted() {
    this.initStream();
  },
  beforeDestroy() {
    subscription = null;
    greet$ = null;
  },
  methods: {
    // 初始化流
    initStream() {
      greet$ = new BehaviorSubject(this.greet);
      const name$ = from(Promise.resolve("world"));

      const greeting$ = combineLatest(greet$, name$).pipe(
        map(([greet, name]) => `${greet},${name}!`)
      );

      subscription = greeting$.subscribe((value) => {
        this.greeting = value;
      });
    },
  },
};
</script>
```

会发现缺点在于逻辑非常分散，那么有没有什么好的封装形式呢？



Vue提供的插件机制！

将流的构建写在约定的配置位置，通过插件翻译配置，塞入相应的生命周期。

### 对比开源库的实现

[vue-rx](https://github.com/vuejs/vue-rx)是Vue官方提供的Rxjs V6的Vue.js集成。正如 vue-router、vuex...一样，它也是一个Vue插件。



看了源码后，思路基本和自己考虑的是一致的。有以下几个重要的点坐下记录。



最最核心的 `subscriptions` 配置，它这样使用：

```vue
<template>
  <div>
    <p>{{ num }}</p>
  </div>
</template>

<script>
import { interval } from "rxjs";

export default {
  name: "Demo",
  subscriptions() {
    return {
      num: interval(1000).pipe(take(10))
    };
  },
};
</script>
```

它背后做了哪些事呢？

- 通过Mixin，在生命周期 `created` 时候：
  - 同名key，定义响应式数据，挂在vm实例上，即这里的`num`会挂在`vm.num`;
  - 对每个ob，挂在`vm.$observables`上，即`vm.$observables.num`可以获取到这个ob，但貌似没啥用...；
  - 执行ob，数据订阅，赋值同名`vm[key]`，即`vm.num`和这个ob绑定了（注：这里一个vm，用了一个Subscription对象，做统一订阅、取消订阅ob）；
- 通过Mixin，在生命周期`beforeDestroy`时候：取消订阅；

简单看下源码：

```javascript
import { defineReactive } from './util'
import { Subject, Subscription } from 'rxjs'

export default {
  created () {
    const vm = this

    // subscriptions来来
    let obs = vm.$options.subscriptions
    
    if (obs) {
      vm.$observables = {}
      vm._subscription = new Subscription()
      Object.keys(obs).forEach(key => {

        // 定义了响应式数据，key挂在vm实例上
        defineReactive(vm, key, undefined)
        // obs也挂在了vm.$observables上
        const ob = vm.$observables[key] = obs[key]

        // 执行ob，数据订阅，最后赋值给准备好的obs[key]坑位
        vm._subscription.add(obs[key].subscribe(value => {
          vm[key] = value
        }, (error) => { throw error }))
      })
    }
  },

  beforeDestroy () {
    // 取消订阅
    if (this._subscription) {
      this._subscription.unsubscribe()
    }
  }
}
```

`subscriptions`搭起来后，核心问题就解决了，剩下的是如何实现依赖驱动和行为驱动；



如何实现依赖驱动呢？

vue-rx暴露了一个`$watchAsObservable`方法，它可以这样用：

```javascript
import { pluck, map } from 'rxjs/operators'

const vm = new Vue({
  data: {
    a: 1
  },
  subscriptions () {
    // declaratively map to another property with Rx operators
    return {
      aPlusOne: this.$watchAsObservable('a').pipe(
        pluck('newValue'),
        map(a => a + 1)
      )
    }
  }
})
```

`$watchAsObservable`参数为一个表达式，返回一个ob，当表达式值发生变化时，ob冒出值。它的源码实现侵入了`New Observable({...})`：

```javascript
import { Observable, Subscription } from 'rxjs'

export default function watchAsObservable (expOrFn, options) {
  const vm = this
  const obs$ = new Observable(observer => {
    let _unwatch
    const watch = () => {
      _unwatch = vm.$watch(expOrFn, (newValue, oldValue) => {
        observer.next({ oldValue: oldValue, newValue: newValue })
      }, options)
    }
    
		// 这里简单了一下
    watch()

    // 返回取消订阅
    return new Subscription(() => {
      _unwatch && _unwatch()
    })
  })

  return obs$
}
```

这样的方式在vue-rx中很常见。会发现，逻辑和自己写的简单Demo也是一致的，只不过ob的声明、观察值的变化冒出值的逻辑给封装进插件了。



如何实现行为驱动呢？自己写的简单Demo没有包括，但无非是定义个Subject，这个Subject参与流的构建，在事件响应的时候由它冒出值。

嗨，别说，这确实是vue-rx提供行为驱动方法之一背后做的事情，通过自定义指令`v-stream`+配置`domStreams`，这里不做展开了。

另外一种方式是vue-rx暴露的实例`observableMethods`，它的实现还挺精妙，简单讲讲。比如使用是这样的：

```javascript
new Vue({
  observableMethods: {
    submitHandler: 'submitHandler$'
    // or with Array shothand: ['submitHandler']
  }
})
```

它会在Mixin `created` 生命周期时，挂载两个属性，`vm.submitHandler$`是一个ob，`vm.submitHandler`是这个ob的数据生产者，即参数就是ob冒出的值。这样的机制，即包含了ob的声明，又包含了推动ob.next方法的暴露。缺点就是，哪个是驱动的方法，哪个是ob不够直观，依赖的是约定和认知，不够清晰明确。

### Vue Composition API

> Vue’s new Composition API, which is inspired by React Hooks

正如React hooks，Vue Composition API也旨在解决逻辑碎片化的问题。



基于Vue Composition API，如何集成Rxjs有了新的讨论，优点在于对于使用方，逻辑更加聚合。

具体讨论看看这里：[Vue Composition API and vue-rx](https://github.com/vuejs/vue-rx/issues/120)。



## 总结

首先，明确了Rxjs和React/Vue等前端框架的关系，这两个者在职责上是个合作关系。

其次，通过 rxjs-hooks、vue-rx 了解如何在前端框架中集成 Rxjs。这是一个在给定框架内，找寻最合适的机制的问题，React当仁不让的hooks、Vue相对繁琐的插件。但本质上，集成Rxjs要解决的问题是一致的：

1. 在哪里做最后消费数据的定义，准备好一个坑位；
2. 与流相关：流的构建，流是什么 => 流执行 => 数据订阅，数据赋值；
3. 更好的场景覆盖：如何实现依赖驱动、行为驱动；



最后，希望Rxjs能在你的框架你的日常开发中发挥它的魔力！