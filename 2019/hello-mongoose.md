mongoose：mongodb object modeling for node.js

至于为什么要使用mongoose，官网这段文字解释得很清楚：

> Let's face it, **writing MongoDB validation, casting and business logic boilerplate is a drag**. That's why we wrote Mongoose.
>
> Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more, out of the box.



连接：连接本地`test`数据库

```javascript
//连接
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});

//测试连接
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});
```



schema => model => document

- schema对数据类型做了限制；

- model的名字+`s`，就是集合的名字；

```javascript
//schema
var kittySchema = new mongoose.Schema({
  name: String
});

kittySchema.methods.speak = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}

//model
var Kitten = mongoose.model('Kitten', kittySchema);


//document
var fluffy = new Kitten({ name: 'fluffy' });

//与数据库交互
//insert
fluffy.save(function (err, fluffy) {
    if (err) return console.error(err);
    fluffy.speak();
  });

//find
Kitten.find(function (err, kittens) {
  if (err) return console.error(err);
  console.log(kittens);
})

//filter find
Kitten.find({ name: /^fluff/ }, callback);
```