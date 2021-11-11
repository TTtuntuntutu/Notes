不知不觉typescript的学习快两个月了，适当做一下整理。

<!--写于2020年-->



## 开始

在刚开始学习typescript时候，挥斥方遒地敲了好多字！给自己罗列了几个研究目标：

1. 类型系统
   1. typescript带来的类型系统包含哪些内容，哪些是在原有基础做的加法，哪些是新增的概念，哪些，比如 interface、enum、unions等；
   2. 这些类型系统有哪些实践，是如何帮助我们提高代码的健壮性和可预计性（类型系统的作用） 

2. 工具

   1. typescript和编辑器的集成（比如vscode），带给了我们编程体验上的提升，比如更好的文档说明、提示、自动纠正等，这些工具的体验是怎么样的，如何更好地使用这些工具
   2. playground、DefinitelyTyped是什么

3. 在ts官网首页有这样一句话：

   > When new features have reached stage 3, then they are ready for inclusion in TypeScript.

   ts致力于和标准一块发展，提供对新特性更好的支持，比如 Optional Chaining、Nullish coalescing Operator等ES2020特性，探索挖掘有哪些特性是那么不为人知，又却是可以给开发带来帮助的

4. 社区

   1. typescript和eslint的合作，lint typescript代码是用eslint还是tslint
   2. typescript和babel的合作，babel是一个compiler，typescript也有这方面的职能，双方有冲突。typescript有寻求babel合作，把compiler的职责专门交给babel，现在落地如何？
   3. typescript有哪些社区，stackoverflow、discord等

5. 日常体验

   1. 在日常开发中，next+react+ts下的ts体验如何，踩过什么坑
   2. 体验的一般流程如何，用到的比较多的是什么
   3. tsconfig等配置

6. 更多

   1. vue3.0对typescript的支持到什么程度了
   2. typescript背后AST转换等等
   3. typescript和几个竞争对手flow、purescript等对比



怀揣着这张意气风发的Map，开始了！



## 学习

### 类型系统

说白了，typescript就是提供了一层类型系统，始发站自然而然地选择了这里。



自诩英语很好的我刚开始嚼起了[官方英文文档](https://www.typescriptlang.org/docs/handbook/basic-types.html) ，嚼得我头皮发麻，一个是内容过于详细，没有项目实践很快就忘记了，另一个是文档缺乏组织性，还有一些晦涩的章节对新手不太友好，比如 [namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) 、[Namespaces and Modules](https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html) 。（现在改版后的[The TypeScript Handbook](https://www.staging-typescript.org/docs/handbook/intro.html)比老版要好很多）

于是临时改变了策略，从 [playground-exmaple](https://www.staging-typescript.org/play?target=1&q=462#example/hello-world) 打起，有基本认识后，有需要再去详细文档查看！



整个类型系统可以分为两部分：提升JavaScript体验（ improves working with JavaScript）、扩展JavaScript安全性和工具（extends JavaScript to add more safety and tooling）。做了简单的梳理：



![](https://user-gold-cdn.xitu.io/2020/6/29/172fec68ba1f3dfd?w=4070&h=3112&f=png&s=434606)



这里碰到了的一些概念，在一开始不太好接受。

比如 TypeScript 的类型系统被称为结构类型系统，也就是官方文档的这段描述：

> One of TypeScript’s core principles is that type checking focuses on the *shape* that values have. This is sometimes called “duck typing” or “structural subtyping”.

看下面的demo：`champion` 函数需要的参数类型是`Team`，而传入的是`DetailedTeam`，这是允许的，因为ts的结构类型系统仅比较`DetailedTeam`是否包含`Team`的结构

```typescript
interface Team {
  name: string
  city: string
}

interface DetailedTeam {
  name: string
  city: string
  mascot: string
}

function champion(team: Team) {
  const { name, city } = team

  console.log(`The ${name} from ${city} won the NBA 2020 championship!`)
}

let teamA: DetailedTeam = {
  name: 'Rockets',
  city: 'Houston',
  mascot: 'bear'
}

champion(teamA)
```

有一个例外是当赋值操作的是函数，看下面的demo：是允许入参少的 `createBall`函数复制给 `createSphere` 函数

```typescript
let createBall = (diameter: number) => ({ diameter });
let createSphere = (diameter: number, useInches: boolean) => {
  return { diameter: useInches ? diameter * 0.39 : diameter };
};

createSphere = createBall;  //👌
createBall = createSphere;  //Type '(diameter: number, useInches: boolean) => { diameter: number; }' is not assignable to type '(diameter: number) => { diameter: number; }'
```



再比如比较有热度的话题： interface 和 type alias(类型别名)的区别。

在typescript中，interface和type都可以来表达对象结构、函数。它们也都支持扩展，interface可以继承interface，也可以继承type，反过来type也一样。当然写法不一样：

[Typescript doc example: Types vs Interfaces](https://www.typescriptlang.org/play/?e=32#example/types-vs-interfaces)

那差别在哪里：

1. type alias除了表达对象、函数外，还支持表达其他类型，比如 unions、tuples、primitives，这个能力interface不具备

   ```typescript
   // primitive
   type Name = string;
   
   // object
   type PartialPointX = { x: number; };
   type PartialPointY = { y: number; };
   
   // union
   type PartialPoint = PartialPointX | PartialPointY;
   
   // tuple
   type Data = [number, string];
   ```

2. interface允许定义多次，结果取交集，而type alias这样做会报错 

   ```typescript
   // These two declarations become:
   // interface Point { x: number; y: number; }
   interface Point { x: number; }
   interface Point { y: number; }
   
   const point: Point = { x: 1, y: 2 };
   ```

3. type alias内支持  `in`  操作，而 interface 不支持

   ```typescript
   //demo1
   type Partial<T> = {
       [P in keyof T]?: T[P];
   };
   
   //demo2
   type Keys = "firstname" | "surname"
   
   type DudeType = {
     [key in Keys]: string
   }
   
   interface DudeInterface {
     [key in Keys]: string
   }
   
   const test: DudeType = {
     firstname: "Pawel",
     surname: "Grzybek"
   }
   ```

   

其他再比如 `unknown` 和 `any` 的区别（这篇文章讲的很好：[mariusschulz: the-unknown-type-in-typescript](https://mariusschulz.com/blog/the-unknown-type-in-typescript) ）、Type Widening 和 Narrowing的各个招数等等，这里不细节展开了。



以后忘记了，策略可以是：个人整理资料 => Playground Example => 官方文档



### ES2020

typescript是使用JavaScript新特性很好的土壤，于是调研了一下ES2020。

这在另一篇文章中有详细说明，移步：[Hello ES2020 & ES2019!](https://zhuanlan.zhihu.com/p/141729732)。

用到比较多的是可选链（Optional chaining）、空值合并运算符（Nullish coalescing operator）。



### 工具

#### vscode对TypeScript支持

毕竟是微软一家人，支持力度是相当可以的，详细说明在这里：[TypeScript in Visual Studio Code](https://code.visualstudio.com/docs/languages/typescript)。

耳熟能详的有 智能感知（IntelliSense）、悬浮可查看详细说明（Hover information），再提两个日常开发常用的：

-  **code navigation**：
   
   -  `F12` : 在新页面，查看选中内容的源码定义
   -  `Alt/Opt + F12`：在当前页内嵌窗口，查看选中内容的源码定义
   -  `shift + F12` ：在当前页内嵌窗口，查看选中内容的引用
   - `win/command+F12` ：查看interface应用/实例
   
-  organize imports: 整理import语句顺序、移除没有使用的

   -  快捷键：`shift+Opt/Alt+o`

   -  如果需要保存时起作用，配置:

      ```json
      {
        "editor.codeActionsOnSave": {
          "source.organizeImports": true
        }
      }
      ```



这里额外提一下插件：[JavaScript and TypeScript Nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) ，使用 `typescript@next` 作为vscode 内置ts版本，享用最新最丝滑的ts编程体验。



#### playground

playground就不说了，之前看Youtube上一个演讲视频 [Anders Hejlsberg](https://en.wikipedia.org/wiki/Anders_Hejlsberg) 提到他们团队专门有一人来做playground这个项目。



### 社区

#### Definitely Typed

刚开始的时候把DT放在了工具，了解过后更觉得应该放在社区。



我们知道虽然 TypeScript 势头很猛，但很多第三方主流的库还是JavaScript编写的，这样怎么使它也享用vscode的体验提升呢（或者说，在typescript项目中使用）？答案是写声明文件，就是经常看到的`.d.ts`后缀。



声明文件有了之后，如何让它们起作用，即如何发布呢，有两种方式：

1. 和npm包捆绑在一起(内置类型定义文件)，比如[Vue](https://github.com/vuejs/vue)的types文件夹
2. 提交到DefinitelyTyped，由它发布到[@types organization](https://tasaid.com/link?url=https%3A%2F%2Fwww.npmjs.com%2F~types)，通过 npm i @types/xxxx 安装，这样其他人也可以对JavaScript库做贡献



所以 DefinitelyTyped 就是这样一个社区，把常用模块声明文件提交，它会发布到[@types organization](https://tasaid.com/link?url=https%3A%2F%2Fwww.npmjs.com%2F~types)，它就成了这样的一个集合。



#### TypeScript与ESLint

TSLint已经退出Lint TypeScript舞台：

> :warning: **TSLint [has been deprecated](https://medium.com/palantir/tslint-in-2019-1a144c2317a9) as of 2019**. Please see this issue for more details: [Roadmap: TSLint → ESLint](https://github.com/palantir/tslint/issues/4534). [typescript-eslint](https://typescript-eslint.io/) is now your best option for linting TypeScript.



这篇文章很清晰地介绍了在TypeScript+React项目中使用ESLint和Prettier标准化代码要做的所有事情：[Using ESLint and Prettier in a TypeScript Project](https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project)。



如果使用到了hooks，需要增加hooks的lint规则：[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)



## 复盘

回到最初设定的目标（简单调整了一下），做一下复盘:

- [x] 类型系统
- [x] 工具
  - [x] vscode支持
  - [x] playground
- [x] javascript语言新特性
- [ ] 社区
  - [x] typescript与ESLint
  - [ ] typescript与babel
  - [x] Definitely Typed
  - [ ] stackoverflow、discord等论坛
- [ ] 更多
  - [ ] vue3.0对typescript的支持、体验
  - [ ] typescript背后AST转换等等
  - [ ] typescript和几个竞争对手flow、purescript等对比



## NEXT

接下来关于typescript的研究/学习话题还有很多，罗列一下第二张Map。

- 更落地
  - [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/docs/basic/setup) ：React场景，有些关于class components的可以忽略；
- 更深入
  - [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/): 在很多地方有推荐，粗略看过一下，包罗万象
  - [Learn how to contribute to the TypeScript compiler on GitHub through a real-world example](https://dev.to/remojansen/learn-how-to-contribute-to-the-typescript-compiler-on-github-through-a-real-world-example-4df0) ：typescript编译器、AST相关
- 更广度
  - typescript背后AST转换等等
  - typescript和几个竞争对手flow、purescript等对比
- 其他
  - typescript与babel
  - stackoverflow、discord等论坛，关注typescript新动态



## 小结

在学习之初，这篇文章 [TypeScript-一种思维方式](https://juejin.im/post/6844903841951924232) 清晰明确的观点给了我很多启发 ，在后面的学习过程也更加感同身受。

主要有3点：

1. > 学习一项新的技能，清楚其边界很重要，相关的细节知识则可以在后续的使用过程中逐步的了解。我们都知道，TS 是 JS 的超集，所以学习 TS 的第一件事情就是要找到「超」的边界在哪里

   从语言本身而言，TS的边界在引入了一套类型系统。TS相关工具的助力，使得编程体验更加丝滑；

2. 思维方式改变-明确的模块抽象过程：在开始一个模块码代码之前，会自然而然考虑输入值和返回值，做抽象和拓展；

3. 思维方式改变-更自信的写前端代码：TS会捕捉容易被忽略的情况，也许这就是一个bug



另外推荐两个链接：

- [Marius Schulz-typescript evolution](https://mariusschulz.com/blog/series/typescript-evolution) ：这位博主文章详细且易懂
- [Typescript-FAQ](https://github.com/Microsoft/TypeScript/wiki/FAQ#type-system-behavior)：github wiki 整理的常见问题解答



## 链接

- [浅谈TypeScript类型系统](https://zhuanlan.zhihu.com/p/64446259)
- [stackoverflow-typescript interfaces vs types](https://stackoverflow.com/questions/37233735/typescript-interfaces-vs-types/52682220#52682220)
- [pawelgrzybek-blog-typescript interface vs types](https://pawelgrzybek.com/typescript-interface-vs-type/)
- [JavaScript 和 TypeScript 交叉口—— 类型定义文件(*.d.ts)](https://tasaid.com/blog/20171102225101.html?sgs=juejin)


