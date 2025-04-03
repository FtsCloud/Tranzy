# Tranzy v1.0.4

English | [简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README_ZH.md)

Tranzy is a powerful multi-language solution for web pages, allowing developers to easily add multi-language support to their websites. It provides core features such as automatic translation, manual translation dictionary, DOM mutation observation, and more, while also integrating Microsoft Translator API as an optional translation service.

## Core Advantages

### 1. Developer-Friendly
- 🚀 Zero configuration required, automatically gets target language from browser language settings
- 🛠️ Provides flexible configuration options to meet various customization needs
- 🔌 Supports custom translation functions, easily replace default translation service
- 📝 Provides rich hook functions for custom processing

### 2. Performance Optimization
- ⚡ Uses IndexedDB for translation caching, reducing repeated translations
- 📦 Supports batch translation for improved efficiency
- 🔄 Intelligent DOM mutation observation, only translates new content
- 💾 Automatically manages translation cache, optimizing memory usage

### 3. Powerful Features
- 🌐 Automatically detects DOM changes and translates new content
- 📚 Supports manual translation dictionary and terminology handling
- 🎯 Supports forced translation and ignoring specific elements
- 🔍 Supports language detection and browser language recognition

### 4. Flexible Usage
- 🎨 Supports custom translation styles and marker classes
- 🔄 Can enable/disable DOM observation at any time
- 📱 Supports translation of dynamically loaded content
- 🌍 Supports multiple languages and BCP 47 language codes

## Installation

Install with npm:

```bash
npm install tranzy
```

Or install with pnpm:

```bash
pnpm add tranzy
```

## Quick Start

### 1. Using ES Module

```javascript
import Tranzy from 'tranzy';

// Just three lines of code to automatically translate your website to the browser's current language
const tranzy = new Tranzy();
tranzy.translatePage();    // Translate the entire page
tranzy.startObserver();    // Watch DOM changes, automatically translate new content
```

### 2. Using UMD Version

```html
<!-- Include UMD version of Tranzy -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // Just three lines of code to automatically translate your website to the browser's current language
  const tranzy = new Tranzy.Translator();
  tranzy.translatePage();    // Translate the entire page
  tranzy.startObserver();    // Watch DOM changes, automatically translate new content
</script>
```

## Advanced Configuration

If you need more fine-grained control, Tranzy provides rich configuration options:

```javascript
import Tranzy from 'tranzy';

// Create a Tranzy instance with advanced configuration
const tranzy = new Tranzy({
  toLang: 'zh-Hans',           // Target language
  fromLang: 'en',              // Source language (optional)
  ignore: ['.no-translate'],   // Selectors to ignore
  force: ['.must-translate'],  // Selectors to force translate (priority over ignore)
  manualDict: {                // Manual translation dictionary
    'zh-Hans': {
      'Tranzy': '全译'
    }
  },
  beforeTranslate: () => {     // Hook before translation starts
    console.log('Translation started');
  },
  afterTranslate: () => {      // Hook after translation completes
    console.log('Translation completed');
  }
});

tranzy.translatePage();
tranzy.startObserver();
```

### 1. Default Ignored Elements

Tranzy already has the following elements configured to be ignored by default:

```javascript
// These elements and their content will not be translated by default
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // Style tags
  'script',           // Script tags
  'noscript',         // No-script tags
  'kbd',              // Keyboard input tags
  'code',             // Code tags
  'pre',              // Preformatted text tags
  'input',            // Input fields
  'textarea',         // Text areas
  '[contenteditable="true"]', // Editable elements
  '.tranzy-ignore'    // Custom ignore class
];
```

You can add more selectors to ignore through the `ignore` option, but using `force` selectors can override ignore rules because **force has priority over ignore**.

### 2. Controlling Translation Scope

```javascript
// ES6 mode
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Ignore specific elements
  ignore: [
    '.no-translate',      // Ignore specific class
    '#header',           // Ignore specific ID
    '[data-no-trans]'    // Ignore specific attribute
  ],
  // Force translate specific elements
  force: [
    '.must-translate',   // Force translate specific class
    '#content'          // Force translate specific ID
  ]
});
```

### 3. Using Manual Dictionary

```javascript
// ES6 mode
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'zh-Hans',
  manualDict: {
    // Global dictionary for all languages
    'all': {
      // Brand names, proper nouns that should not be translated
      'tranzy': {           
        to: 'tranzy',       // Ensure capitalization remains unchanged
        standalone: false,  // Match within sentences too
      },
      'Tranzy': {
        to: 'Tranzy',       // Uppercase form also remains unchanged
        standalone: false,  // Match within sentences too
      },
      // Simplified form, defaults to standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // Language-specific dictionary
    'zh-Hans': {
      // Complete form
      'Hello World': {
        to: '你好，世界',    
      },
      // Simplified form
      'JavaScript': 'JavaScript (JS脚本语言)',
      // Support for regex-like matching
      '\\d+ years old': {
        to: '岁',
      },
      'tranzy': {
        to: '全译',         // Special handling for Chinese: change to "全译"
        standalone: false,  // Match within sentences too
        case: false         // Ignore case
      }
    }
  }
});
```

### 4. Using Hook Functions

```javascript
// ES6 mode
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Hook before translation starts
  beforeTranslate: () => {
    console.log('Translation started');
  },
  // Hook after translation completes
  afterTranslate: () => {
    console.log('Translation completed');
  }
});
```

### 5. Dynamic Content Handling

```javascript
// Manually trigger translation after loading dynamic content
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // Can specify elements to translate, defaults to body if not provided
};
```

## Advanced Features

### 1. Built-in Translation API

Besides the core multi-language features, Tranzy also integrates Microsoft Translator API, providing the following functions:

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// Translate text
const result = await translateText(['Hello world'], 'zh-Hans', 'en');
console.log(result); // ['你好世界']

// Detect language
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0, isTranslationSupported: true, isTransliterationSupported: true }]

// Get supported languages list
const langs = await getSupportedLangs('zh-Hans');
console.log(langs); // { en: { name: '英语', nativeName: 'English', dir: 'ltr' }, ... }

// Get browser language code from supported languages
const browserLang = await getBrowserLang();
console.log(browserLang); // 'zh-Hans' or 'en' etc.
```

### 2. Custom Translation Function

```javascript
// ES6 mode
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'zh-Hans',
  // Use custom translation function
  translateFn: async (texts, toLang, fromLang) => {
    // Implement custom translation logic
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## Author

Fts Cloud <ftsuperb@vip.qq.com>

## License

MIT

## Repository

https://github.com/FtsCloud/Tranzy

## Copyright

Copyright (c) 2023-present Fts Cloud
