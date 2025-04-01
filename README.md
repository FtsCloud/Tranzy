# Tranzy - 网页自动翻译插件

Tranzy 是一个轻量级的 JavaScript 插件，为网页提供自动翻译功能，支持多种语言，并且能自动检测 DOM 变化翻译新增元素。

## 特性

- 自动翻译网页内容，支持多语言
- 实时监听 DOM 变化，自动翻译新增内容（可手动开启/关闭）
- 使用 Microsoft Translator API 提供高质量翻译
- 可配置的翻译选择器和忽略规则
- 支持自定义词汇和术语翻译
- 使用 IndexedDB 缓存翻译结果，提高性能
- 提供加载动画和丰富的事件钩子

## 安装

### 直接下载

从 GitHub 仓库下载 `tranzy.js` 文件，并在 HTML 中引入：

```html
<script src="path/to/tranzy.js"></script>
```

### NPM 安装

```bash
npm install tranzy
```

## 使用方法

### 浏览器直接使用

在 HTML 文件中引入 Tranzy 后，创建实例并初始化：

```html
<script>
  const tranzy = new Tranzy({
    toLang: 'zh-CN',
    auto: true,  // 是否自动监听DOM变化
    // 其他配置选项...
  });
  
  tranzy.translate(); // 初始化并开始翻译
</script>
```

### 通过 ES 模块导入

```javascript
import Tranzy from 'tranzy';

const tranzy = new Tranzy({
  toLang: 'ja',
  auto: false, // 默认不开启DOM监听
  // 其他配置选项...
});

tranzy.translate();

// 手动控制DOM监听
tranzy.startObserver(); // 开始监听DOM变化
// ... 一些需要监听DOM变化的操作 ...
tranzy.stopObserver();  // 停止监听DOM变化
```

## 配置选项

Tranzy 提供以下配置选项：

```javascript
{
  toLang: navigator.language || '',      // 目标语言代码，默认使用浏览器语言
  fromLang: '',                          // 源语言代码，如:'en'（可选）
  root: 'body',                          // 要翻译的根元素选择器
  ignore: [],                            // 忽略的元素选择器数组
  force: [],                             // 强制翻译的元素选择器数组
  doneClass: 'tranzy-done',              // 已翻译元素的class
  pendingClass: 'tranzy-pending',        // 正在翻译元素的class
  auto: false,                           // 是否自动监听DOM变化
  batch: 100,                            // 批处理大小
  translator: null,                      // 自定义翻译器实例
  manualDict: {},                        // 手动翻译词典 {目标语言: {原文: {to: 翻译, standalone: true, case: true}}}
  hooks: {                               // 事件钩子
    before: null,                        // 翻译前
    after: null,                         // 翻译后
    beforeElement: null,                 // 元素翻译前
    afterElement: null,                  // 元素翻译后
  }
}
```

### 默认忽略选择器

默认情况下，以下元素不会被翻译：

```javascript
const DEFAULT_IGNORE_SELECTORS = [
  'style',                     // 样式标签
  'script',                    // 脚本标签
  'noscript',                  // 无脚本标签
  'code',                      // 代码标签
  'pre',                       // 预格式化文本标签
  'input',                     // 输入框
  'textarea',                  // 文本域
  '[contenteditable="true"]',  // 可编辑元素
  '.tranzy-ignore'             // 自定义忽略类
];
```

## API 方法

Tranzy 实例提供以下方法：

- `translate()` - 初始化翻译器并翻译页面，根据配置开始监听 DOM 变化
- `translatePage()` - 手动触发页面翻译
- `startObserver()` - 开始监听DOM变化
- `stopObserver()` - 停止监听DOM变化
- `destroy()` - 销毁实例，释放资源

## DOM 监听控制

Tranzy 允许您精确控制DOM变化监听：

```javascript
// 创建实例时关闭自动监听
const tranzy = new Tranzy({ auto: false });
tranzy.translate();

// 需要时手动开启监听
tranzy.startObserver();

// 不需要时手动关闭监听
tranzy.stopObserver();
```

这种控制方式在以下场景特别有用：
- 在SPA应用中特定路由才需要翻译
- 只在用户主动请求时才监听DOM变化
- 在大量DOM变化操作期间临时关闭监听以提高性能

## 自定义翻译特定术语

您可以为特定术语或短语提供自定义翻译：

```javascript
const tranzy = new Tranzy({
  manualDict: {
    'zh-CN': {
      'Hello World': {
        to: '你好，世界',
        standalone: true,  // 是否仅当独立出现时才翻译
        case: true         // 是否区分大小写
      },
      'JavaScript': {
        to: 'JavaScript (JS脚本语言)',
        standalone: true,
        case: true
      }
    }
  }
});
```

您也可以使用简化形式：

```javascript
const tranzy = new Tranzy({
  manualDict: {
    'zh-CN': {
      'Hello World': '你好，世界',     // 会自动转换为完整形式
      'JavaScript': 'JavaScript (JS脚本语言)'
    }
  }
});
```

## 排除特定内容不被翻译

有两种方式可以排除特定内容不被翻译：

1. 通过`ignore`配置指定选择器数组
2. 为元素添加特定类名，如 `.tranzy-ignore`

```html
<!-- 通过类名排除翻译 -->
<div class="tranzy-ignore">这段内容不会被翻译</div>

<!-- 然后在配置中添加自定义忽略选择器 -->
const tranzy = new Tranzy({
  ignore: ['.no-translate', '.custom-ignore']
});
```

忽略选择器会自动与默认忽略选择器合并，避免重复。

## 强制翻译特定元素

通过 `force` 配置可以指定强制翻译的元素，即使它们匹配了 `ignore` 选择器：

```javascript
const tranzy = new Tranzy({
  force: ['.must-translate', '.important-content']
});
```

这使得您可以：
1. 先设置一个广泛的忽略规则
2. 然后精确指定需要翻译的特定元素

## 浏览器兼容性

Tranzy 依赖于这些现代浏览器功能：

- Fetch API
- MutationObserver
- IndexedDB
- Promises 和 async/await

适用于所有现代浏览器，如 Chrome、Firefox、Safari、Edge等。

## 许可证

MIT