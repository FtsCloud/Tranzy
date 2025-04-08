# Tranzy.js v1.0.8

简体中文 | [English](https://github.com/FtsCloud/Tranzy/blob/main/README_EN.md) | [Español](https://github.com/FtsCloud/Tranzy/blob/main/README_ES.md) | [日本語](https://github.com/FtsCloud/Tranzy/blob/main/README_JA.md) | [한국어](https://github.com/FtsCloud/Tranzy/blob/main/README_KO.md) | [Русский](https://github.com/FtsCloud/Tranzy/blob/main/README_RU.md) | [Français](https://github.com/FtsCloud/Tranzy/blob/main/README_FR.md) | [Deutsch](https://github.com/FtsCloud/Tranzy/blob/main/README_DE.md)

Tranzy.js 是一个专业的网页国际化解决方案，让开发者能够轻松地为网站添加多语言支持。它提供了自动翻译、手动翻译词典、DOM变化监听等核心功能，同时内置了微软翻译API作为可选的翻译服务。

官网：https://www.tranzy.top/

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

// 只需三行代码，即可自动将网站翻译为浏览器当前语言
const tranzy = new Tranzy();
tranzy.translatePage();    // 翻译整个页面
tranzy.startObserver();    // 监听DOM变化，自动翻译新内容
```

### 2. 使用 UMD 版本

```html
<!-- 引入UMD版本的Tranzy -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // 只需三行代码，即可自动将网站翻译为浏览器当前语言
  const tranzy = new Tranzy.Translator();
  tranzy.translatePage();    // 翻译整个页面
  tranzy.startObserver();    // 监听DOM变化，自动翻译新内容
</script>
```

## 高级配置

如果需要更精细的控制，Tranzy还提供了丰富的配置选项：

```javascript
import Tranzy from 'tranzy';

// 创建带有高级配置的Tranzy实例
const tranzy = new Tranzy({
  toLang: 'zh-Hans',           // 目标语言
  fromLang: 'en',             // 源语言（可选）
  ignore: ['.no-translate'],  // 忽略的选择器列表
  force: ['.must-translate'], // 强制翻译的选择器列表（优先级高于ignore）
  manualDict: {               // 手动翻译词典
    'zh-Hans': {
      'Tranzy': '全译'
    }
  },
  beforeTranslate: () => {    // 翻译开始前的钩子
    console.log('开始翻译');
  },
  afterTranslate: () => {     // 翻译结束后的钩子
    console.log('翻译完成');
  }
});

tranzy.translatePage();
tranzy.startObserver();
```

> **注意：** 当`fromLang`和`toLang`相同时，`translatePage()`和`startObserver()`会自动跳过翻译过程。

### 1. 默认忽略的元素

Tranzy默认已经配置了以下元素不进行翻译：

```javascript
// 这些元素及其内容默认不会被翻译
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // 样式标签
  'script',           // 脚本标签
  'noscript',         // 无脚本标签
  'kbd',              // 键盘输入标签
  'code',             // 代码标签
  'pre',              // 预格式化文本标签
  'input',            // 输入框
  'textarea',         // 文本域
  '[contenteditable="true"]', // 可编辑元素
  '.tranzy-ignore'    // 自定义忽略类
];
```

您可以通过配置`ignore`选项添加更多忽略选择器，但使用`force`选择器可以覆盖忽略规则，因为**force的优先级高于ignore**。

### 2. 控制翻译范围

```javascript
// ES6模式
import Tranzy from 'tranzy';
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

### 3. 使用手动翻译词典

```javascript
// ES6模式
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'zh-Hans',
  manualDict: {
    // 全局词典，适用于所有目标语言
    'all': {
      // 品牌名称、专有名词等不需要翻译的词汇
      'tranzy': {           
        to: 'tranzy',       // 保证首字母大小写保持不变
        standalone: false,  // 在句子中也进行匹配
      },
      'Tranzy': {
        to: 'Tranzy',       // 大写形式也保持不变
        standalone: false,  // 在句子中也进行匹配
      },
      // 简化形式，默认 standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // 特定语言的词典
    'zh-Hans': {
      // 完整形式
      'Hello World': {
        to: '你好，世界',    
      },
      // 简化形式
      'JavaScript': 'JavaScript (JS脚本语言)',
      // 支持正则表达式形式的匹配
      '\\d+ years old': {
        to: '岁',
      },
      'tranzy': {
        to: '全译',         // 中文特别处理为"全译"
        standalone: false,  // 在句子中也进行匹配
        case: false         // 忽略大小写
      }
    }
  }
});
```

> **注意：** 特定语言的词典条目（如'zh-Hans'）优先级高于全局词典('all')中的同名条目。这种设计使得您可以在全局词典中定义通用翻译，同时在特定语言中进行个性化覆盖，增强了翻译的灵活性和精确性。

### 4. 使用钩子函数

```javascript
// ES6模式
import Tranzy from 'tranzy';
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

### 5. 动态内容处理

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
// ES6模式
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'zh-Hans',
  // 使用自定义翻译函数
  translateFn: async (texts, toLang, fromLang) => {
    // 实现自定义翻译逻辑
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## 作者

Fts Cloud <ftsuperb@vip.qq.com>

## 许可证

MIT

## 仓库

https://github.com/FtsCloud/Tranzy

## 版权

Copyright (c) 2025-present Fts Cloud