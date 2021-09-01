## 工具搭建

MongoDB server有两个版本：

1. MongoDB Community：免费

2. MongoDB Enterprise： 企业版，高级



两个概念：

- mongod：数据库服务器

- mongo：数据库客户端，命令行工具连接服务器



[在macOS使用brew安装MongoDB Community](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)


这个命令看有没有MongoDB服务器在跑：

```shell
ps aux | grep -v grep | grep mongod
```

这个命令看有没有MongoDB实例在跑：

```shell
ps -e | grep 'mongod'
```



命令行工具mongo连服务器：

```shell
//连接localhost 27017端口MongoDB实例
mongo

//当前使用数据库
db

//查看所有数据库
show dbs

//切换数据库
use <database>
```



此外，更加便捷的连接方式：

[连接到MongoDB](https://docs.mongodb.com/guides/server/drivers/)：尝试了两种方式 Node.js && compass

- 使用Node.js得安装driver：`npm install mongodb --save`
- 因为对compass比较感兴趣，使用了下还挺方便，和Navicat Premium作用差不多



## MongoDB的数据模型

db > collection(documents，概念相当于关系数据库中的表) > document(one record，JSON)

[以MongoDB数据模型来考虑数据结构](https://docs.mongodb.com/guides/server/introduction/#structure-your-data-for-mongodb)



## 参考链接

[Guides-Getting Started](https://docs.mongodb.com/guides/)

这里文档写的很好，关于CRUD的具体操作也看下面这篇就可以了。