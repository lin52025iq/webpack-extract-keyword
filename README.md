# webpack-extract-keyword

> A webpack plugin to extract keywords from source files, especially useful for extracting Chinese content during i18n processes and filtering out comments.

### install

```bash
$ npm install webpack-extract-keyword --save-dev
```

### Usage

In your `webpack.config.js` or `vue.config.js`, add the plugin:

```js
const ExtractKeyword = require('webpack-extract-keyword')

plugins: [
    new ExtractKeyword()
]
```

### Options
- disabled: (boolean) Whether the plugin is disabled. Defaults to `false`.
- outputFile: (string) The output file path. Defaults to `output.json`.
- include: (array of strings) The directories to include. Defaults to `['src']`.
- extractRegex: (RegExp) The regular expression to extract keywords. Defaults to `/[\u4e00-\u9fff]+/g`.

### Example
> `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>标题</title>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

> `/src/App.vue`
```html
<template>
    <div>
        <span>{{ Keyword }}</span>
        <span>{{ content }}</span>
        <span>模板内容</span>
        <!-- <span>注释不会提取</span> -->
    </div>
</template>

<script lang="ts" setup>
// 单行注释
import { Keyword } from './keyword'

/** 这是多行注释 */
const content = '内容'
</script>

<style lang="scss">
// 样式注释
.box {
    &::after {
        content: '伪元素';
    }
}
</style>
```

> `src/keyword.js`

```js
export const Keyword = '你好，世界！'
```

> `src/main.ts`

```ts
import Vue from 'vue'
import App from './App.vue'

const keyword = '你好'

new Vue({
    el: '#app',
    render: h => h(App)
})
```

> `vue.config.js`
```js
const ExtractKeyword = require('webpack-extract-keyword')

module.exports = {
    // ...
    configureWebpack: {
        plugins: [new ExtractKeyword({ include: ['src', 'public'] })]
    }
    // ...
}
```

> `output.json`
```json
{
  "public": {
    "index.html": [
      "标题"
    ]
  },
  "src": {
    "App.vue": {
      "vue&type=script&lang=ts&setup=true": [
        "内容"
      ],
      "vue&type=style&index=0&id=7ba5bd90&lang=scss": [
        "伪元素"
      ],
      "vue&type=template&id=7ba5bd90": [
        "模板内容"
      ]
    },
    "keyword.js": [
      "你好",
      "世界"
    ],
    "main.ts": [
      "你好"
    ]
  }
}
```
