## ROADMAP

JavaScript语言的三大支柱：

1. scope/closures;
2. prototypes/objects;
   1. Prototypes, the prototype chain ⇒ Object delegation, Classes are just one pattern you can build on top of such power;  (作者认为Object delegation和Classes一样建立在原型链上，但是Object Delegation更加贴近这个机制)；
3. types/coercion;

<br/>

background housekeeping details:

- 【标准与实现】JavaScript是ECMA标准的实现，由TC39协会指导推进：
  - TC39协会成员在50～100个，大多来自网络投资公司（web-invested companies），比如各大厂商（Mozilla, Google, Apple）、设备制造商（Samsung等）；
  - 提案会经历4个阶段，从stage0~stage4，一个提案完整地走过5个阶段从几个月到几年不等。stage0 是被TC39协会成员认可的有价值的点子；
- 【宿主环境】JavaScript运行在JS环境中，比如浏览器、Node.js等：
  - JS环境会增加环境特定的api，比如浏览器环境的 `alert(..)`, `console.log(...)`, `fetch(..)`，Node.js环境的 `fs.write(..)`等；
  - 浏览器的“统治”地位；
- 【编译 OR 解释】JavaScript是一门编译型语言
- 【语言范式】JavaScript是一门多范式语言，支持 procedural, object-oriented (OO/classes), and functional (FP)
  - 范式本身无关对错，它们指导和塑造程序员如何处理问题和解决方案，如何构建和维护代码的方向；
- JavaScript是一门向后兼容的语言，意味着旧的JavaScript可以运行在新的浏览器引擎上；与之相反的是HTML和CSS，它们是向前兼容的，新的语法可以运行在旧的浏览器引擎上；
  - 为了兼容性，Transpilation（转换为另一种形式）、polyfilling（填补）是当下前端工具做的很常见的事情
- 严格模式
  - 因为JavaScript语言向后兼容的特性，导致JavaScript语言存在着一些瑕疵。严格模式的存在，不是为了限制什么事情不能干，而是指导，使JS引擎有最好的机会优化和高效运行代码；
  - 有的是在编译阶段找出错误抛出，有的是在运行时的行为控制；
  - （作者观点）未来可能也不会将严格模式作为默认模式，但是一个是前端工具会转化为严格模式下的代码、另一个是ES Module是严格模式，也就是说严格模式是润物细无声地起着作用；
- WASM
  - 做了什么？将非JS程序转换为可以在JS引擎中运行的形式，因为解析和编译提前发生了（AOT），所以它的性能会比传统JS代码要高；
  - 除了性能，它还带来了什么？对于Web平台，给了更多非JS语言机会，同时JS语言的发展也会更加纯粹，没有必要去受到其他语言的特性影响。WASM 正在发展成为一种跨平台的虚拟机 (VM)，其中程序可以编译一次并在各种不同的系统环境中运行。