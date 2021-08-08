## 写在前面

代码规范化的重要性不在这里展开了。

这一篇讲了Vue项目下如何做代码规范化的事情，主要涉及了eslint、prettier、husky+lint-staged、onchange、editorConfig这几个角色。

另外，虽然配置限于Vue项目，但整个思路也可以作为其他项目代码规范的借鉴！

---

希望你是vscoder~，因为接下来的配置实践都是在vscode中。

如果你来自其他编辑器，也提供了`onchange`的方法作为备用。

---

你需要提前准备：

- vscode插件：ESLint、Vetur、EditorConfig for VS Code
- node.js v8.10.0及以上

## 方法论

开始这个话题深入之前，有设定了几个期许目标：

1. 已有成熟规范作为主体
2. 支持自定义，自定义优先级大于规范主体（每个团队有自己的特别癖好）
3. 配置放在项目级别（不要求统一团队成员的编辑器配置）

---
后来在看了[why precise commits](https://github.com/nrwl/precise-commits#why-precise-commits)后，对具体的“发生形式”增加两个考虑维度。

formate/lint + auto fix 发生形式：

1. 在保存时（ctrl+s）
2. hook（比如 Pre-commit hook）

formate/lint + auto fix 作用对象/粒度：

1. 当前编辑文件
2. Staged files(git add 之后)的整个文件



## 实践

项目都由 [Vue CLI](https://cli.vuejs.org/zh/guide/) 脚手架生成，当前版本：4.1.2

### 方法一

#### 生成项目

按下面步骤走你。

选择Manually select features：
![选择Manually select features](https://user-gold-cdn.xitu.io/2020/1/26/16fe0af4041de72c?w=1208&h=308&f=jpeg&s=41068)

选择相关的Babel和Linter / Formatter：

![选择相关的Babel和Linter / Formatter](https://user-gold-cdn.xitu.io/2020/1/26/16fe0afe9c436ba0?w=808&h=406&f=jpeg&s=51332)


选择 ESLint + Prettier：

![选择 ESLint + Prettier](https://user-gold-cdn.xitu.io/2020/1/26/16fe0b02a59b10d3?w=852&h=278&f=jpeg&s=53339)

选择上 Lint on save 和 Lint and fix on commit：

![选择上 Lint on save 和 Lint and fix on commit](https://user-gold-cdn.xitu.io/2020/1/26/16fe0b056dd30310?w=1764&h=520&f=jpeg&s=99506)



最后一个选择配置文件是单独出来，还是放在package.json，选择 In dedicated config files。

#### 补补改改

在工作空间添加插件配置：

- how？根目录新建`vscode`文件夹，里面新建`settings.json`文件，以下是`settings.json`内容；`.gitignore`中 把 `.vscode` 给去掉！
- why？满足插件配置放在项目级别的期许目标

```json
  {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "vetur.validation.template": false
  }
```

---

修改`.eslintrc.js`配置：

- how？`extends`字段内容由`"plugin:vue/essential"`改为`"plugin:vue/recommended"`
- why？看[eslint-plugin-vue available rules](https://eslint.vuejs.org/rules/) ，`"plugin:vue/essential"` 仅包含Base Rules和Priority A:Essential，`"plugin:vue/recommended"` 包含Base Rules、Priority A:Essential、Priority B: Strongly Recommended、Priority C: Recommended。想要有vue/attributes-order和 vue/order-in-components，so...

```javascript
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/recommended", "@vue/prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
```



增加`.eslintignore`忽略文件配置：

```
build/*.js
node_modules/*
```

---

增加 `.prettierrc.js` prettier配置文件：

```javascript
module.exports = {
  "semi": false,
  "arrowParens": "always",
  "singleQuote": true
}
```

---

关闭生成项目内置的eslint-loader

- how? 通过 `vue.config.js` 关闭 [vue-cli lintOnSave](https://cli.vuejs.org/zh/config/#lintonsave)
- why? eslint-loader做 formate/lint + auto fix 的前提是把项目跑起来，和使用eslint插件或者`onchange` npm包两种形式相比，不具有优势，且会增加编译的时间

```javascript
module.exports = {
  lintOnSave: false
}
```



### 方法二

#### 生成项目

按下面步骤走你～



依然是选择Manually select features！


![依然是选择Manually select features](https://user-gold-cdn.xitu.io/2020/1/26/16fe0b16a9ac14be?w=1208&h=308&f=jpeg&s=41068)

这次不再选择Linter / Formatter：

![这次不再选择Linter / Formatter](https://user-gold-cdn.xitu.io/2020/1/26/16fe0b1976cc0b5c?w=1760&h=820&f=jpeg&s=111820)

依然选择 In dedicated config files！



#### 补补

**prettier in eslint**

- 需要npm包：babel-eslint、eslint、eslint-plugin-vue、prettier、eslint-config-prettier、eslint-plugin-prettier、vue-eslint-parser



eslint配置文件`.eslintrc.js`：

```javascript
module.exports = {
    env: {
        "browser": true,
				"node": true,
        "es6": true
    },
    extends: [
        "eslint:recommended",
        'plugin:vue/recommended',
        "plugin:prettier/recommended",
        "prettier/vue"
    ],
    parser: "vue-eslint-parser",
    parserOptions: {
        "parser": "babel-eslint"
    },
    rules: {
	    "no-console": process.env.NODE_ENV === "production" ? 2 : 0,
        "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0
    }
};
```



忽略文件`.eslintignore`：

```
build/*.js
node_modules/*
```



prettier配置文件`.prettierrc.js`：

```javascript
module.exports = {
  "semi": false,
  "arrowParens": "always",
  "singleQuote": true
}
```



编辑器配置文件`.vscode/settings.json`：

```json
	{
		"editor.codeActionsOnSave": {
			"source.fixAll.eslint": true
		},
		"vetur.validation.template": false
	}
```



把`.vscode`从`.gitignore`中去除！

---

**hook**

- 需要npm包：husky、lint-staged

- 一个命令完事：`npx mrm lint-staged`

- 修改下`package.json`中`lint-staged`的内容

  ```json
  "husky": {
      "hooks": {
        "pre-commit": "lint-staged"
      }
    },
    "lint-staged": {
      "*.{js,vue}": [
        "eslint --fix",
        "git add"
      ]
    }
  ```

  

## 其他

增加 `onchange` 候选方案，需要提前跑一下添加`eslint-watch`的命令：

- how？`yarn add onchange -D` 安装 `onchange`包，其次在`package.json`添加脚本命令：`    "eslint-watch": "onchange 'src/**/*.{js,vue}' -- eslint --fix {{changed}}"`
- why？实践章加入的formate/lint + auto fix的发生形式需借助vscode ESLint插件，考虑到成员使用webstorm等编辑器，本方案不给出其他编辑器配置，仅提供`onchange`方案，保证在其他编辑器中也有丝滑体验！

---

增加`.editorConfig`编辑器配置文件，注意 vscode下需要 EditorConfig for VS Code插件：

- how? 拷贝了 [Vue项目的配置](https://github.com/vuejs/vue/blob/master/.editorconfig)

```
# EditorConfig helps developers define and maintain consistent
# coding styles between different editors and IDEs
# editorconfig.org


root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
insert_final_newline = false
trim_trailing_whitespace = false
```



## 小结

这一套机制集成了这些功能：

- [x] formate/lint on save + auto fix：eslint插件代理
- [x] formate/lint on save + auto fix：onchange，备胎
- [x] hook：husky+lint-staged
- [x] 编辑器配置：.editorConfig

---

回过头来看一下最初设定的几个期许目标：

1. 已有成熟规范作为主体：eslint-plugin-vue + prettier
2. 支持自定义，自定义优先级大于规范主体：在.eslintrc.js中自定义eslint配置，在.prettierrc.js中自定义prettier配置
3. 配置放在项目级别：配置基本都在根目录下，vscode插件配置也放在了工作空间，即.vscode文件夹下

---

Done！



有错误/补充还请指正！

### 参考链接

- [ESLint doc](https://eslint.org/docs/user-guide/getting-started)
- [vscode eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier doc](https://prettier.io/docs/en/install.html)
- [lint-staged readme](https://github.com/okonet/lint-staged)
- [EditorConfig](https://editorconfig.org/)
- [知乎-使用husky避免糟糕的git commit](https://zhuanlan.zhihu.com/p/35913229)


