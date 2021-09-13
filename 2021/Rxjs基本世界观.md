# Rxjs世界模型

提到Rxjs，会有哪些印象呢？

响应式编程（Reactive Programming），还是官方的介绍：Think of RxJS as Lodash for events.

我印象深刻的是飞叔把Rxjs编程，比作是管道组装：

- Observable：只出不进；
- Observer：只进不出；
- Subject：可出可进；

管道组装后，就可以流动了。

简单来下个定义，Rxjs是用引入的类型组装了一个管道，并且有丰富的操作符支持在管道中对数据流处理，这样的模型表达了一个数据、数据处理、关联行为的绑定关系，而这样的关系是响应式的。

<Br/>

本篇是Rxjs系列的第一篇，旨在搭建对Rxjs的基本认识，介绍了：

- Observable --> Observer --> Subscription：Rxjs中最主要的逻辑线；
- Subject 是什么？
- Scheduler 是什么？

<Br/>

让我们开始吧！

<Br/>

## Observable --> Observer --> Subscription

首先认识一下Rxjs的核心类型：Observable！

想象Observable的管道模型！它是Rxjs流的源头！

<Br/>

创建Observable的时候，会包含数据推送的逻辑，比如通过构造函数创建，逻辑就在起描述作用的回调函数内：

```javascript
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  try {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  } catch (err) {
    subscriber.error(err); // delivers an error if it caught one
  }
});
```

通过Creation Operators(API)创建，那逻辑就在API入参内，比如：

```javascript
import { from } from 'rxjs';

const array = [10, 20, 30];
const result = from(array);

result.subscribe(x => console.log(x));
```

<Br/>

很显然，Observable是一个数据生产者（Data Producer）。描述数据生产者和 数据消费者（Data Consumber）之间的交流有两种策略：Pull 或者 Push。

- Pull策略：由消费者决定什么时候从生产者 处拉取数据，而生产者是不知道这个时间点的（e.g. 每个JavaScript函数是一个Pull系统，函数是数据生产者，由调用函数，即数据消费者，决定什么时候取出这个数据）；
- Push策略：生产者向消费者推送数据，消费者做好数据响应（e.g. Promise，作为生产者，把数据resolve给注册的回调，也就是消费者）；

<Br/>

Observable被这样描述：

>  Observables are **lazy Push** collections of multiple values.

Rxjs的数据交流是一种Push策略，由Observable推送数据。那什么是 lazy 呢？

<Br/>

这就要介绍Rxjs引入的第一种卫星类型：Observer！

想象一下Observer的管道模型！它是Rxjs流的终点了！

<Br/>

Observer仅仅是有着三个回调函数的对象，来监听Observable数据推送，做好响应准备。当Observer用于订阅Observable后，数据推送就开始了：

```javascript
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  try {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  } catch (err) {
    subscriber.error(err); // delivers an error if it caught one
  }
});

const observer1 = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};

observable.subscribe(observer1)
```

<Br/>

回到最开始的问题：什么是 lazy 呢？

它指的就是 Observable 被订阅后，才可以生产数据。

<Br/>

那如果要取消这种订阅呢？

Rxjs引入了另一种卫星类型：Subscription。只要调用*`unsubscribe()`* 方法：

```javascript
import { interval } from 'rxjs';

const observable = interval(1000);
const subscription = observable.subscribe(x => console.log(x));
subscription.unsubscribe();
```

<Br/>

## Subject

Subject是Rxjs引入的另外一种卫星类型。

想象一下Subject的管道模型！因为它既可以作为Observable，也可以作为Observer！

<Br/>

一般的Observable和Observer，是一对一的单播关系，每个Observer享有独立的Observable执行上下文：

```javascript
import { timer } from 'rxjs';

const numbers$ = timer(1000,1000);
numbers$.subscribe(x => console.log(x));

setTimeout(()=>numbers$.subscribe(x => console.log(`延迟触发：${x}`)),1000);

// 输出
// 0
// 1
// 延迟触发：0
// 2
// 延迟触发：1
// ...
```

<Br/>

而当Subject作为Observable，它和Observers之间是一对多的广播关系，每个Observer共享Subject执行上下文：

```javascript
import { Subject } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});

subject.next(1);

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

subject.next(2);

// 输出
// observerA: 1
// observerA: 2
// observerB: 2
```

<Br/>

当Subject作为Observer的时候，它的作用就是把 Observable --> Observer 一对一的单播关系，转为 Observable --> (Subject) --> Observers 一对多的广播关系：

```javascript
import { Subject, from } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`)
});
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

const observable = from([1, 2, 3]);

observable.subscribe(subject); 

// 输出：
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

<Br/>

除了Subject，Rxjs还引入了一些变体：BehaviorSubject、ReplaySubject、AsyncSubject。这些变体在共享执行上下文的基础，还增加了各自独特的行为，这里不做展开说明了。

贴一个 [徐飞-RxJS 入门指引和初步应用](https://zhuanlan.zhihu.com/p/25383159) 飞叔文章里 ReplaySubject 有意思的DEMO：[黄蓉郭靖背九阴真经](https://stackblitz.com/edit/y1bxyx?file=index.ts)。

<Br/>

但是我没有找到在实际开发中Subject的使用场景～

欢迎评论区留言～

<Br/>

## Scheduler

Scheduler是Rxjs引入的另一种卫星类型。它使用的比Subject更少了。

简单的理解，Scheduler定义了Observable的信息数据，什么时候传递。Rxjs的操作符有各自默认的Scheduler，它支持更改。

比如：

```javascript
import { Observable, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

const observable = new Observable((observer) => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
}).pipe(
  observeOn(asyncScheduler)
);

console.log('just before subscribe');
observable.subscribe({
  next(x) {
    console.log('got value ' + x)
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
     console.log('done');
  }
});
console.log('just after subscribe');

// 输出
// just before subscribe
// just after subscribe
// got value 1
// got value 2
// got value 3
// done
```

<Br/>

## 结束

 Observable --> Observer --> Subscription 是Rxjs世界模型的主线，理解了这条线的逻辑关系，就可以打开Rxjs世界的门了。

文章对Subject、Scheduler的介绍比较简单，也是因为在实际开发中用到的会比较少，有好的使用场景，感谢大家告诉一下。

<Br/>

下一篇讲讲 丰富的 Rxjs Operators（操作符）。

<Br/>

