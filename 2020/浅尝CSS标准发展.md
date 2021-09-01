## CSS标准演进

W3C设定平台规则，监督标准的整个进程，但是技术规范基本是由CSS工作组（Working Group）的成员完成的。CSS工作组成员由大多数W3C会员公司（浏览器厂商、主流网站、研究机构、常规技术公司等）、少部分特邀专家、少部分W3C工作人员组成。制定标准不是闭门造车，浏览器厂商比W3C的发言权更大。

&emsp;

在成为一个真正的标准之前需要经历这么几个阶段：

1. 编辑草案（ED）：想法大杂烩
2. 首个公开工作草案（FPED）：准备接受工作组反馈；
3. 工作草案（WD）：WD吸收工作组、社区的反馈，一版接着一版的改进，浏览器早期实现从这里开始，这个时候规范是不稳定的，常常也是不完整的；；
4. 候选推荐规范（CR）：规范完成，解决了所有已知问题，等待实际测试，寻求厂商实现；
5. 提名推荐规范（PR）：有完整的测试套件和实现报告，W3C成员来审查标准；
6. 正式推荐规范（REC）：标准；

![标准阶段](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/5a7dfd21-ee68-4818-8d30-5fdeb71835ea/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210901%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210901T022319Z&X-Amz-Expires=86400&X-Amz-Signature=d4b5baf69b1421db9383811c9bb5934ddc8064a84f392abc04569bdfb3176e7c&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)

有的会经历WD=>CR=>WD=>CR，在进入CR后又被打回到WD。

&emsp;

在CSS2.1之前css通过大版本的形式发布， 但是这样的节凑非常慢（一想规范要推荐到最终阶段，每项特性要具备两个独立的实现和全面的测试）。现在进入到分模块各自迭代发展的时代。

&emsp;

关注下面这俩：

- [The latest CSS Snapshot](https://www.w3.org/TR/CSS/) : 稳定的快照，基本是在PR+；

- [CSS Current work](https://www.w3.org/Style/CSS/current-work) ：当前的一个全貌； 


&emsp;

## 阅读W3C规范

[How to Read W3C Specs](https://alistapart.com/article/readspec/)

[Understanding the CSS Specifications](https://www.w3.org/Style/CSS/read)

&emsp;

规范的目标读者确实不是使用者，而是给实现者的，生硬就对了。

如果最新的内容没有资源介绍，规范就是一手资料。



简单做个Tips收集：

- 注意章节第一节，一般介绍这节规范组织和如何阅读；
- 专业词汇列表；
- 有节奏地放缓：插图、例子等该放慢速度啦；NAMESPACES略去吧；
- BNF也要留意：有点像正则，把复杂的语言简化表达；
- DTD?
- 注意有没有勘误表；