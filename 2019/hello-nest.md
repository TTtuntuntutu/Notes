## Hello Nest.js

Architecture: 架构

> Nest provides an out-of-the-box application architecture which allows  developers and teams to create highly testable, scalable, loosely  coupled, and easily maintainable applications.

<br />

### Controllers

> 请求地址过来，用什么逻辑处理

1. 写controllers，`@controller`开头
2. 绑定controllers与module：[getting-up-and-running](https://docs.nestjs.com/controllers#getting-up-and-running)

<br />

- routing: 建立Controllers与routing的映射关系

- request object: 拿到请求的内容，在接口请求时用到

- resources: 应对多个类型的请求，`@Put`、`@Get`等

- Route parameters: 获取接口中的params

- Request payloads: 比方说对应`@Body`即`@Post`的内容
  - 先定义the **DTO** (Data Transfer Object) schema => class

<br />

[full-resource-sample](https://docs.nestjs.com/controllers#full-resource-sample)：controllers完整的demo here～

<br />

### Providers

了解的仅仅是`service`，大概是注入赋能

> `controller`调用`service`去做逻辑处理



`services`文件夹：

- `xxx.service.ts`定义的服务，角色是Providers，带`@Injectable`，来给角色Controllers赋能

`interfaces`文件夹：

- `xxx.interface.ts` 定义的是 `service` 用到的数据结构

<br />

### Modules

#### feature modules

至少有一个module，即root module，nest根据它去构建application graph

子模块：

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from '../controllers/cats.controller';
import { CatsService } from '../services/cat.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule { }
```

父模块：

```typescript
import { Module } from '@nestjs/common';
import { CatsModule } from './modules/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule { }
```



#### Exception filters

**built-in exceptions layer** ：异常未被处理的，由它处理

Exception filters：想对 exceptions layer 完全控制，通过`ArgumentsHost`，拿到`request`、`response`做些覆盖操作等

```typescript

import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```



#### Interceptors

拦截器



#### `@nestjs/mongoose`使用
`AppModule`中导入`MongooseModule`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}
```



新建一个 **schemas** 文件夹，定义一个`schema`：

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```



在Feature Module中注册定义的`schema`：

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CatSchema } from './schemas/cat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Cat', schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```



使用这个`schema` => `model`：

```typescript
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat } from './interfaces/cat.interface';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(@InjectModel('Cat') private readonly catModel: Model<Cat>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
```

