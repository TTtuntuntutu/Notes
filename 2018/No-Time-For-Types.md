[链接这里](https://www.youtube.com/watch?v=qGK541P2xII&t=872s/) （看了Youtube的一个技术演讲视频，发言人Niki自称是一个 Dynamic Language Enthusiast）



以下是内容小结！

## 起初

Niki讲到起初 JavaScript 是一个胶水语言(glue language)，面向网页设计师和兼职的程序猿，将 Java等 “component language”输出的组件集合并且添加交互。

> We aimed to provide a "glue language" for the Web designers and part time programmers who were building Web content from components such as images, plugins, and Java applets. We saw Java as the "component language" used by higher-priced programmers, where the glue programmers — the Web page designers — would assemble components and automate their interactions using JS.           - brendan eich



为什么会不将JS作为一门真正的语言？因为起初的时候没有test，没有architect的概念，只是想在哪里用了就放在哪里。

顺便提到了spaghetti code，写的时候很爽，test或者debug就很遭殃了。

## 发展与挑战

如果App和网页相关，就会和JS相关，容易上手使用很广这是JS起步的两大优势。JS开始了它爆炸式的发展。



### 挑战

JS在设计之初所承担的工作，和现在它真实所承担的工作是截然不同的，现在所承担的角色太重要了。



在这个过程中，JS项目的特性发生了这样的变化：

* 规模: code量大
* 项目存活时间更长：开发人员来了走了
* 复杂：不需要一个人去了解整个复杂的项目，团队合作



这些特性暴露了JS在代码增长以及需求发生变化时候的风险，它需要什么：

* 封装
* 复用
* 模块化
* 错误检测
* 代码风格（code style）
* 注释（annotaion）



所以出现了有很多语言想要去取代JS：

* GWT
* flex
* flash
* coffeeScript
* Dart



顺便提到了WebAssembly，引述了官网的话：

> - Not trying to be replacement for JS
> - Perform computationally-intensive tasks at nearly native speed
> - We'll see JS and WASM used together



### 发展

在面对挑战，JavaScript生态圈也开始了它的发展。



既然语言本身不具有某些特性，有一些 frameworks帮忙做这样的事;

ES5、ES2015+:

* npm：封装、复用、模块化
* eslint：错误检测
* babel
* testing：测试保障
* code style：语言本身语法提供更加可读；prettier config



TypeScript！

* c#的作者
* fully embracing JavaScript and then extending it with types

TypeScript的优势是结合了动态语言的灵活性、便利性，同时因为加入了types、有一个compile step，提高了错误检测和软件质量。

* You don't have to switch to TS to reap some benefits
* TS and JS can coexist（一个项目里可以有js也可以有ts文件）
* The Types System can be subverted

> It provides a better developer ergonomics story for project.
>
> Should you use TypeScripts? Probably, yes! But, decide the level at which to adopt it and how.

## 结论

Niki作为Dynamic Language Enthusiast，反对想完全取代JavaScript的语言，支持在JavaScript基础上做加法来修正已有缺陷的新技术，比如 TypeScript、WebAssembly。

