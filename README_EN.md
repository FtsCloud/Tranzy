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

// Only three lines of code to automatically translate your website to the browser's language
const tranzy = new Tranzy();
tranzy.translatePage();    // Translate the entire page
tranzy.startObserver();    // Watch DOM changes, automatically translate new content
```

### 2. Using UMD Version

```html
<!-- Include UMD version of Tranzy -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // Only three lines of code to automatically translate your website to the browser's language
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
      'Hello': '你好'
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

### Default Ignored Elements

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

### 3. Using Manual Dictionary

```javascript
// ES6 mode
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'en',
  manualDict: {
    // Global dictionary for all languages
    'all': {
      // Brand names, proper nouns that should not be translated
      'tranzy': {         // Note: keyword must be lowercase when case: false
        to: 'Tranzy',        // Keep original or specify fixed translation
        standalone: false,   // false means match within sentences too
        case: false          // false means ignore case
      },
      // Simplified form, defaults to standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // Language-specific dictionary
    'zh-Hans': {
      // Complete form
      'Hello World': {
        to: '你好，世界',    
        standalone: true,    // true means only replace when text exactly equals "Hello World"
        case: true           // true means case-sensitive, must match exactly
      },
      // Simplified form (defaults to standalone: true, case: true)
      'JavaScript': 'JavaScript (JS脚本语言)',
      // Support for regex-like matching
      '\\d+ years old': {
        to: '岁',
        standalone: true     // Only match standalone text
      }
    }
  }
});
```

#### Manual Dictionary Details

1. **Global Dictionary Configuration `all`**
   - Purpose: Maintain consistency of brand names and proper nouns across all languages
   - Priority: `all` configuration has higher priority than language-specific configurations
   - Use cases:
     - Keep brand names unchanged (e.g., "Tranzy")
     - Maintain fixed translations for common terms (e.g., "API", "HTML", "CSS", etc.)
     - Display product names consistently in all languages

2. **Standalone Matching `standalone`**
   - `true` (default): Only replace when text exactly equals the keyword in the dictionary
     - Example: If dictionary has "book", only text that exactly equals "book" will be replaced, "book" in "notebook" won't be replaced
   - `false`: Replace keyword occurrences within text
     - Example: If dictionary has "book", "book" in "notebook" will also be replaced
     - Useful for maintaining consistent terminology throughout text

3. **Case Sensitivity `case`**
   - `true` (default): Case-sensitive matching
     - Example: If dictionary has "JavaScript", only exact case match will be replaced
   - `false`: Case-insensitive matching
     - Example: If dictionary has "javascript" (must be lowercase), it can match "JavaScript", "JAVASCRIPT", etc.
     - **Important**: When `case: false`, the keyword in the dictionary must be all lowercase

4. **Usage Scenarios**

   a. Protecting brand names (global configuration):
   ```javascript
   'all': {
     'tranzy': {        // Note: when case: false, keyword must be lowercase
       to: 'Tranzy',
       standalone: false, // Protect within sentences too
       case: false      // Ignore case
     }
   }
   ```

   b. Standardizing technical terms (language-specific):
   ```javascript
   'zh-Hans': {
     'neural network': {
       to: '神经网络',
       standalone: false, // Replace within sentences too
       case: false      // Ignore case
     }
   }
   ```

   c. Replacing complete sentences or paragraphs:
   ```javascript
   'zh-Hans': {
     'Terms and Conditions': {
       to: '条款和条件',
       standalone: true,  // Only replace exact matches
       case: true        // Case-sensitive
     }
   }
   ```

   d. Handling number formats:
   ```javascript
   'zh-Hans': {
     '\\d+ pieces': {
       to: '个',
       standalone: false  // Replace within sentences
     }
   }
   ```

### 4. Controlling Translation Scope

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
  translateFn: async (texts, toLang, fromLang) => {
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
  translateFn: translateText, // Custom translation function (optional, defaults to translateText)
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
- Destroys the instance, stops the observer, clears pending elements, and closes database connections
- Returns the current instance, supporting chain calls

## Author

Fts Cloud <ftsuperb@vip.qq.com>

## License

MIT

## Repository

https://github.com/FtsCloud/Tranzy

## Copyright

Copyright (c) 2023-present Fts Cloud 