# Tranzy.js v1.1.0

[简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README.md) | English | [Español](https://github.com/FtsCloud/Tranzy/blob/main/README_ES.md) | [日本語](https://github.com/FtsCloud/Tranzy/blob/main/README_JA.md) | [한국어](https://github.com/FtsCloud/Tranzy/blob/main/README_KO.md) | [Русский](https://github.com/FtsCloud/Tranzy/blob/main/README_RU.md) | [Français](https://github.com/FtsCloud/Tranzy/blob/main/README_FR.md) | [Deutsch](https://github.com/FtsCloud/Tranzy/blob/main/README_DE.md)

Tranzy.js is a professional web internationalization solution, allowing developers to easily add multi-language support to their websites. It provides core features such as automatic translation, manual translation dictionary, DOM mutation observation, and more, while also integrating Microsoft Translator API as an optional translation service.

Website: https://www.tranzy.top/

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

> **Note:** When `fromLang` and `toLang` are the same, `translatePage()` and `startObserver()` will automatically skip the translation process.

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

You can add more selectors to ignore through the `