Babel是一个JS编译器

- Transform syntax
- Polyfill features that are missing in your target environment (through [@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill))
- Babel is built out of plugins：using existing plugins or write your own



## 开始

babel有两种方式跑起来：命令行、配置文件

### 核心包

`@babel/core`：The core functionality of Babel  => 核心干活的

`@babel/cli`：允许使用命令行跑babel

```shell
npm install --save-dev @babel/core @babel/cli

./node_modules/.bin/babel src --out-dir lib
```

### 核心概念

plugins： plugins形式的js代码，以指导Babel对code做Transformations

presets：预先确定的plugins集合

- 其中典型的`@babel/preset-env`

  > this preset will include all plugins to support modern JavaScript (ES2015, ES2016, etc.).

配置：建立`babel.config.json` 配置文件

polyfill：安装`@babel/polyfill`

### 典型配置

```javascript
const presets = [
  [
    "@babel/env",
    {
      targets: {
        edge: "17",
        firefox: "60",
        chrome: "67",
        safari: "11.1",
      },
      "useBuiltIns": "usage"
    },
  ],
];

module.exports = { presets };
```

其中`env` preset的`useBuiltIns`设置为`"usage"`，会导入要的polyfill



## 角色/概念

### Plugins

赤裸的babel：`const babel = code => code;`

带plugins的babel：`source code => output code`

parsing、transforming、printing 三个阶段



plugins/presets指定的顺序很重要：

- Plugins run before Presets. 
- Plugin ordering is first to last. 
- Preset ordering is reversed (last to first).



plugins/presets的配置，是在一个数组内的对象：

```json
{
  "plugins": ["pluginA", ["pluginA"], ["pluginA", {}]],
  "presets": [
    [
      "env",
      {
        "loose": true,
        "modules": false
      }
    ]
  ]
}
```

### Presets

官方维护的几个presets：

- [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env) 
- [@babel/preset-flow](https://babeljs.io/docs/en/babel-preset-flow) 
- [@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react)
-  [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)



还有几个Stage-X(Experimental Presets):Stage-0、Stage-1等



建立一个Preset，往简单了说，只需要指定一下plugins/presets的顺序：

```javascript
module.exports = function() {
  return {
    plugins: [
      "pluginA",
      "pluginB",
      "pluginC",
    ]
  };
}
```

```javascript
module.exports = () => ({
  presets: [
    require("@babel/preset-env"),
  ],
  plugins: [
    [require("@babel/plugin-proposal-class-properties"), { loose: true }],
    require("@babel/plugin-proposal-object-rest-spread"),
  ],
});
```

