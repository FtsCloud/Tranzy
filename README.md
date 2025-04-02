# Tranzy

[English](https://github.com/FtsCloud/Tranzy/blob/main/README_EN.md) | 简体中文

Tranzy 是一个强大的网页多语言解决方案，让开发者能够轻松地为网站添加多语言支持。它提供了自动翻译、手动翻译词典、DOM变化监听等核心功能，同时内置了微软翻译API作为可选的翻译服务。

## 核心优势

### 1. 开发友好
- 🚀 零配置即可使用，自动从浏览器语言设置获取目标语言
- 🛠️ 提供灵活的配置选项，满足各种定制需求
- 🔌 支持自定义翻译函数，可轻松替换默认翻译服务
- 📝 提供丰富的钩子函数，方便进行自定义处理

### 2. 性能优化
- ⚡ 使用 IndexedDB 进行翻译缓存，减少重复翻译
- 📦 支持批量翻译，提高翻译效率
- 🔄 智能的DOM变化监听，只翻译新增内容
- 💾 自动管理翻译缓存，优化内存使用

### 3. 功能强大
- 🌐 自动检测DOM变化并翻译新增内容
- 📚 支持手动翻译词典和术语处理
- 🎯 支持强制翻译和忽略特定元素
- 🔍 支持语言检测和浏览器语言识别

### 4. 使用灵活
- 🎨 支持自定义翻译样式和标记类
- 🔄 可随时开启/关闭DOM监听
- 📱 支持动态加载的内容翻译
- 🌍 支持多种语言和BCP 47语言代码

## 安装

使用 npm 安装：

```bash
npm install tranzy
```

或者使用 pnpm 安装：

```bash
pnpm add tranzy
```

## 快速开始

### 1. 使用 ES Module

```javascript
import Tranzy from 'tranzy';

// 创建Tranzy实例
const tranzy = new Tranzy({
  toLang: 'zh-Hans',           // 目标语言
  fromLang: 'en',             // 源语言（可选）
  ignore: ['.no-translate'],  // 忽略的选择器列表
  force: ['.must-translate'], // 强制翻译的选择器列表
  doneClass: 'tranzy-done',   // 已翻译元素的标记类
  pendingClass: 'tranzy-pending', // 正在翻译中的元素标记类
  batch: 100,                 // 批量翻译的批次大小
  manualDict: {               // 手动翻译词典
    'zh-Hans': {
      'Hello': {
        to: '你好',
        standalone: true,     // 是否独立匹配
        case: true           // 是否区分大小写
      }
    }
  },
  beforeTranslate: () => {    // 翻译开始前的钩子
    console.log('开始翻译');
  },
  afterTranslate: () => {     // 翻译结束后的钩子
    console.log('翻译完成');
  }
});

// 先翻译整个页面
tranzy.translatePage(); // 默认翻译body，可以传入css选择器限制翻译区域

// 然后开始观察DOM变化并自动翻译
tranzy.startObserver(); // 默认观察body，可以传入css选择器限制观察区域

// 停止观察
tranzy.stopObserver();

// 销毁实例
tranzy.destroy();
```

### 2. 使用 UMD 版本

```html
<!-- 引入UMD版本的Tranzy -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // 创建Tranzy实例
  const tranzy = new Tranzy.default({
    toLang: 'zh-Hans',
    beforeTranslate: () => {
      console.log('开始翻译');
    },
    afterTranslate: () => {
      console.log('翻译完成');
    }
  });

  // 使用其他方法
  Tranzy.getBrowserLang().then(lang => {
    console.log('浏览器语言:', lang);
  });

  // 翻译页面
  tranzy.translatePage();
  tranzy.startObserver();
</script>
```

### 3. 使用手动翻译词典

```javascript
const tranzy = new Tranzy({
  toLang: 'zh-Hans',
  manualDict: {
    // 全局词典，适用于所有目标语言
    'all': {
      // 品牌名称、专有名词等不需要翻译的词汇
      'tranzy': {         // 注意：case: false 时关键词必须小写
        to: 'Tranzy',        // 保持原样或指定固定翻译
        standalone: false,   // false表示在句子中也匹配
        case: false          // false表示忽略大小写
      },
      // 简化形式，默认 standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // 特定语言的词典
    'zh-Hans': {
      // 完整形式
      'Hello World': {
        to: '你好，世界',    
        standalone: true,    // true表示只有当文本完全等于"Hello World"时才替换
        case: true           // true表示区分大小写，必须完全匹配
      },
      // 简化形式（默认 standalone: true, case: true）
      'JavaScript': 'JavaScript (JS脚本语言)',
      // 支持正则表达式形式的匹配
      '\\d+ years old': {
        to: '岁',
        standalone: true     // 仅匹配独立的文本
      }
    }
  }
});
```

#### 手动词典详细说明

1. **全局词典配置 `all`**
   - 目的：保持品牌名称、专有名词等在所有语言中的一致性
   - 优先级：`all` 配置的优先级高于语言特定配置
   - 适用场景：
     - 品牌名称保持不变（如 "Tranzy"）
     - 通用术语保持固定翻译（如 "API", "HTML", "CSS" 等）
     - 产品名称在所有语言中统一显示

2. **独立匹配 `standalone`**
   - `true`（默认值）：仅当文本完全等于词典中的关键词时才进行替换
     - 例：词典中有 "book"，只有文本完全等于 "book" 时才会被替换，"notebook" 中的 "book" 不会被替换
   - `false`：在文本中出现词典关键词时也进行替换
     - 例：词典中有 "book"，"notebook" 中的 "book" 也会被替换
     - 适用于需要保持特定术语一致性的场景

3. **大小写敏感 `case`**
   - `true`（默认值）：区分大小写匹配
     - 例：词典中有 "JavaScript"，只有大小写完全匹配时才会被替换
   - `false`：忽略大小写匹配
     - 例：词典中有 "javascript"（必须小写），可以匹配 "JavaScript"、"JAVASCRIPT" 等
     - **重要**：当 `case: false` 时，词典中的关键词必须全部小写

4. **使用场景示例**

   a. 保护品牌名称（全局配置）：
   ```javascript
   'all': {
     'tranzy': {        // 注意：case: false 时关键词必须小写
       to: 'Tranzy',
       standalone: false, // 在句子中也保护
       case: false      // 忽略大小写
     }
   }
   ```

   b. 专业术语统一翻译（语言特定）：
   ```javascript
   'zh-Hans': {
     'neural network': {
       to: '神经网络',
       standalone: false, // 在句子中也替换
       case: false      // 忽略大小写
     }
   }
   ```

   c. 完整句子或段落替换：
   ```javascript
   'zh-Hans': {
     'Terms and Conditions': {
       to: '条款和条件',
       standalone: true,  // 仅替换完整匹配
       case: true        // 区分大小写
     }
   }
   ```

   d. 数字格式处理：
   ```javascript
   'zh-Hans': {
     '\\d+ pieces': {
       to: '个',
       standalone: false  // 在句子中替换
     }
   }
   ```

### 4. 控制翻译范围

```javascript
const tranzy = new Tranzy({
  // 忽略特定元素
  ignore: [
    '.no-translate',      // 忽略特定类
    '#header',           // 忽略特定ID
    '[data-no-trans]'    // 忽略特定属性
  ],
  // 强制翻译特定元素
  force: [
    '.must-translate',   // 强制翻译特定类
    '#content'          // 强制翻译特定ID
  ]
});
```

### 4. 使用钩子函数

```javascript
const tranzy = new Tranzy({
  // 翻译开始前的钩子
  beforeTranslate: () => {
    console.log('开始翻译');
  },
  // 翻译结束后的钩子
  afterTranslate: () => {
    console.log('翻译完成');
  }
});
```

### 2. 动态内容处理
```javascript
// 在动态加载内容后手动触发翻译
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // 可以指定要翻译的元素，不传则默认翻译body
};
```

## 高级功能

### 1. 内置翻译API

除了核心的多语言功能外，Tranzy 还内置了微软翻译API，提供以下功能：

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// 翻译文本
const result = await translateText(['Hello world'], 'zh-Hans', 'en');
console.log(result); // ['你好世界']

// 检测语言
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0, isTranslationSupported: true, isTransliterationSupported: true }]

// 获取支持的语言列表
const langs = await getSupportedLangs('zh-Hans');
console.log(langs); // { en: { name: '英语', nativeName: 'English', dir: 'ltr' }, ... }

// 获取浏览器语言对应的支持语言代码
const browserLang = await getBrowserLang();
console.log(browserLang); // 'zh-Hans' 或 'en' 等
```

### 2. 自定义翻译函数

```javascript
const tranzy = new Tranzy({
  toLang: 'zh-Hans',
  // 使用自定义翻译函数
  translatorFn: async (texts, toLang, fromLang) => {
    // 实现自定义翻译逻辑
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## API 文档

### 独立函数

#### translateText(texts, toLang, fromLang)
- `texts`: 需要翻译的文本数组
- `toLang`: 目标语言代码（必填）
- `fromLang`: 源语言代码（可选，默认为空字符串）

#### detectLang(texts)
- `texts`: 需要检测语言的文本或文本数组（必填）

#### getSupportedLangs(displayLang)
- `displayLang`: 用于显示语言名称的BCP 47语言代码（可选，默认为空字符串）

#### getBrowserLang()
- 无参数

### Tranzy 类

#### 构造函数
```javascript
const tranzy = new Tranzy({
  toLang: 'zh-CN',           // 目标语言代码（可选，默认从浏览器语言设置获取）
  fromLang: '',              // 源语言代码（可选，默认为空字符串）
  ignore: [],                // 自定义忽略选择器列表（可选，默认为空数组）
  force: [],                 // 强制翻译选择器列表（可选，默认为空数组）
  doneClass: 'tranzy-done',  // 已翻译元素的标记类（可选，默认为'tranzy-done'）
  pendingClass: 'tranzy-pending', // 正在翻译中的元素标记类（可选，默认为'tranzy-pending'）
  batch: 100,                // 批量翻译的批次大小（可选，默认为100）
  translatorFn: translateText, // 自定义翻译函数（可选，默认为translateText）
  manualDict: {},            // 手动翻译词典（可选，默认为空对象）
  beforeTranslate: null,     // 翻译开始前的钩子函数（可选，默认为null）
  afterTranslate: null       // 翻译结束后的钩子函数（可选，默认为null）
});
```

#### 方法

##### translatePage(root)
- `root`: 翻译的根元素选择器（可选，默认为'body'）

##### startObserver(root)
- `root`: 观察的根元素选择器（可选，默认为'body'）

##### stopObserver()
- 无参数

##### destroy()
- 无参数
- 销毁实例，停止观察器，清空待处理元素，关闭数据库连接
- 返回当前实例，支持链式调用

## 作者

Fts Cloud <ftsuperb@vip.qq.com>

## 许可证

MIT

## 仓库

https://github.com/FtsCloud/Tranzy

## 版权

Copyright (c) 2023-present Fts Cloud