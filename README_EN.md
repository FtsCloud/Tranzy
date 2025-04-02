# Tranzy

English | [简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README.md)

Tranzy is a powerful web multilingual solution that enables developers to easily add multilingual support to websites. It provides core features such as automatic translation, manual translation dictionaries, DOM change monitoring, and includes Microsoft Translator API as an optional translation service.

## Core Advantages

### 1. Developer-Friendly
- 🚀 Zero configuration required, automatically detects target language from browser settings
- 🛠️ Provides flexible configuration options to meet various customization needs
- 🔌 Supports custom translation functions, easily replaceable with default translation service
- 📝 Offers rich hook functions for custom processing

### 2. Performance Optimization
- ⚡ Uses IndexedDB for translation caching, reducing duplicate translations
- 📦 Supports batch translation for improved efficiency
- 🔄 Intelligent DOM change monitoring, only translating new content
- 💾 Automatic translation cache management, optimizing memory usage

### 3. Powerful Features
- 🌐 Automatically detects DOM changes and translates new content
- 📚 Supports manual translation dictionaries and term processing
- 🎯 Supports forced translation and element-specific ignoring
- 🔍 Supports language detection and browser language identification

### 4. Flexible Usage
- 🎨 Supports custom translation styles and marker classes
- 🔄 Can enable/disable DOM monitoring at any time
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

// Create Tranzy instance
const tranzy = new Tranzy({
  toLang: 'zh-Hans',           // Target language
  fromLang: 'en',             // Source language (optional)
  ignore: ['.no-translate'],  // List of selectors to ignore
  force: ['.must-translate'], // List of selectors to force translation
  doneClass: 'tranzy-done',   // Marker class for translated elements
  pendingClass: 'tranzy-pending', // Marker class for elements being translated
  batch: 100,                 // Batch size for translation
  manualDict: {               // Manual translation dictionary
    'zh-Hans': {
      'Hello': {
        to: '你好',
        standalone: true,     // Whether to match independently
        case: true           // Whether to be case-sensitive
      }
    }
  },
  beforeTranslate: () => {    // Hook before translation starts
    console.log('Translation started');
  },
  afterTranslate: () => {     // Hook after translation completes
    console.log('Translation completed');
  }
});

// First translate the entire page
tranzy.translatePage(); // Defaults to translating body, can pass a CSS selector to limit the translation area

// Then start observing DOM changes and automatically translate
tranzy.startObserver(); // Defaults to observing body, can pass a CSS selector to limit the observation area

// Stop observing
tranzy.stopObserver();

// Destroy instance
tranzy.destroy();
```

### 2. Using UMD Version

```html
<!-- Include UMD version of Tranzy -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // Create Tranzy instance
  const tranzy = new Tranzy.default({
    toLang: 'zh-Hans',
    beforeTranslate: () => {
      console.log('Translation started');
    },
    afterTranslate: () => {
      console.log('Translation completed');
    }
  });

  // Use other methods
  Tranzy.getBrowserLang().then(lang => {
    console.log('Browser language:', lang);
  });

  // Translate page
  tranzy.translatePage();
  tranzy.startObserver();
</script>
```

### 3. Using Manual Translation Dictionary

```javascript
const tranzy = new Tranzy({
  toLang: 'zh-Hans',
  manualDict: {
    'zh-Hans': {
      // Full form
      'Hello World': {
        to: '你好，世界',
        standalone: true,  // Only translate when appearing independently
        case: true        // Case sensitive
      },
      // Simplified form
      'JavaScript': 'JavaScript (JS scripting language)',
      // Supports regular expressions
      '\\d+ years old': {
        to: '岁',
        standalone: true
      }
    }
  }
});
```

### 4. Controlling Translation Scope

```javascript
const tranzy = new Tranzy({
  // Ignore specific elements
  ignore: [
    '.no-translate',      // Ignore specific class
    '#header',           // Ignore specific ID
    '[data-no-trans]'    // Ignore specific attribute
  ],
  // Force translation of specific elements
  force: [
    '.must-translate',   // Force translation of specific class
    '#content'          // Force translation of specific ID
  ]
});
```

### 5. Using Hook Functions

```javascript
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

### 6. Dynamic Content Handling
```javascript
// Manually trigger translation after loading dynamic content
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // Can specify element to translate, defaults to body if not specified
};
```

## Advanced Features

### 1. Built-in Translation API

In addition to core multilingual features, Tranzy also includes Microsoft Translator API, providing the following functions:

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// Translate text
const result = await translateText(['Hello world'], 'zh-Hans', 'en');
console.log(result); // ['你好世界']

// Detect language
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0, isTranslationSupported: true, isTransliterationSupported: true }]

// Get list of supported languages
const langs = await getSupportedLangs('zh-Hans');
console.log(langs); // { en: { name: 'English', nativeName: 'English', dir: 'ltr' }, ... }

// Get supported language code corresponding to browser language
const browserLang = await getBrowserLang();
console.log(browserLang); // 'zh-Hans' or 'en' etc.
```

### 2. Custom Translation Function

```javascript
const tranzy = new Tranzy({
  toLang: 'zh-Hans',
  // Use custom translation function
  translatorFn: async (texts, toLang, fromLang) => {
    // Implement custom translation logic
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## API Documentation

### Standalone Functions

#### translateText(texts, toLang, fromLang)
- `texts`: Array of texts to translate
- `toLang`: Target language code (required)
- `fromLang`: Source language code (optional, defaults to empty string)

#### detectLang(texts)
- `texts`: Text or array of texts to detect language (required)

#### getSupportedLangs(displayLang)
- `displayLang`: BCP 47 language code for displaying language names (optional, defaults to empty string)

#### getBrowserLang()
- No parameters

### Tranzy Class

#### Constructor
```javascript
const tranzy = new Tranzy({
  toLang: 'zh-CN',           // Target language code (optional, defaults to browser language)
  fromLang: '',              // Source language code (optional, defaults to empty string)
  ignore: [],                // Custom ignore selectors (optional, defaults to empty array)
  force: [],                 // Force translation selectors (optional, defaults to empty array)
  doneClass: 'tranzy-done',  // Marker class for translated elements (optional, defaults to 'tranzy-done')
  pendingClass: 'tranzy-pending', // Marker class for elements being translated (optional, defaults to 'tranzy-pending')
  batch: 100,                // Batch size for translation (optional, defaults to 100)
  translatorFn: translateText, // Custom translation function (optional, defaults to translateText)
  manualDict: {},            // Manual translation dictionary (optional, defaults to empty object)
  beforeTranslate: null,     // Hook before translation (optional, defaults to null)
  afterTranslate: null       // Hook after translation (optional, defaults to null)
});
```

#### Methods

##### translatePage(root)
- `root`: Root element selector for translation (optional, defaults to 'body')

##### startObserver(root)
- `root`: Root element selector for observation (optional, defaults to 'body')

##### stopObserver()
- No parameters

##### destroy()
- No parameters

## Author

Fts Cloud <ftsuperb@vip.qq.com>

## License

MIT

## Repository

https://github.com/FtsCloud/Tranzy

## Copyright

Copyright (c) 2023-present Fts Cloud 