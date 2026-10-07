# Tranzy.js v1.1.0

[简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README.md) | [English](https://github.com/FtsCloud/Tranzy/blob/main/README_EN.md) | [Español](https://github.com/FtsCloud/Tranzy/blob/main/README_ES.md) | [日本語](https://github.com/FtsCloud/Tranzy/blob/main/README_JA.md) | [한국어](https://github.com/FtsCloud/Tranzy/blob/main/README_KO.md) | Русский | [Français](https://github.com/FtsCloud/Tranzy/blob/main/README_FR.md) | [Deutsch](https://github.com/FtsCloud/Tranzy/blob/main/README_DE.md)

Tranzy.js - это профессиональное решение для веб-интернационализации, которое позволяет разработчикам легко добавлять поддержку нескольких языков на веб-сайты. Оно предоставляет основные функции, такие как автоматический перевод, ручной словарь переводов, мониторинг изменений DOM, и интегрирует Microsoft Translator API как опциональный сервис перевода.

Веб-сайт: https://www.tranzy.top/

## Основные преимущества

### 1. Ориентированность на разработчика
- 🚀 Готов к использованию сразу, автоматически определяет целевой язык из настроек браузера
- 🛠️ Предоставляет гибкие настройки для различных пользовательских требований
- 🔌 Поддерживает пользовательские функции перевода, легко заменяет стандартный сервис перевода
- 📝 Предоставляет богатый набор хуков для пользовательской обработки

### 2. Оптимизация производительности
- ⚡ Кэширование переводов с использованием IndexedDB, уменьшает дублирование
- 📦 Поддерживает пакетный перевод, повышает эффективность
- 🔄 Интеллектуальный мониторинг изменений DOM, переводит только новый контент
- 💾 Автоматическое управление кэшем переводов, оптимизирует использование памяти

### 3. Мощные функции
- 🌐 Автоматически отслеживает изменения DOM и переводит новый контент
- 📚 Поддерживает ручной словарь переводов и обработку терминов
- 🎯 Поддерживает принудительный перевод и игнорирование определенных элементов
- 🔍 Поддерживает определение языка и распознавание языка браузера

### 4. Гибкое использование
- 🎨 Поддерживает пользовательские стили перевода и маркерные классы
- 🔄 Можно включать и выключать мониторинг DOM в любое время
- 📱 Поддерживает перевод динамически загружаемого контента
- 🌍 Поддерживает множество языков и коды языков BCP 47

## Установка

Установка через npm:

```bash
npm install tranzy
```

Или установка через pnpm:

```bash
pnpm add tranzy
```

## Быстрый старт

### 1. Использование ES Module

```javascript
import Tranzy from 'tranzy';

// Всего 3 строки кода для автоматического перевода сайта на текущий язык браузера
const tranzy = new Tranzy();
tranzy.translatePage();    // Переводит всю страницу
tranzy.startObserver();    // Отслеживает изменения DOM, автоматически переводит новый контент
```

### 2. Использование UMD версии

```html
<!-- Включить UMD версию Tranzy -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // Всего 3 строки кода для автоматического перевода сайта на текущий язык браузера
  const tranzy = new Tranzy.Translator();
  tranzy.translatePage();    // Переводит всю страницу
  tranzy.startObserver();    // Отслеживает изменения DOM, автоматически переводит новый контент
</script>
```

## Расширенные настройки

Для более тонкого контроля Tranzy предоставляет богатый набор настроек:

```javascript
import Tranzy from 'tranzy';

// Создание экземпляра Tranzy с расширенными настройками
const tranzy = new Tranzy({
  toLang: 'ru',              // Целевой язык
  fromLang: 'en',            // Исходный язык (опционально)
  ignore: ['.no-translate'], // Список селекторов для игнорирования
  force: ['.must-translate'], // Список селекторов для принудительного перевода (имеет приоритет над ignore)
  manualDict: {              // Ручной словарь переводов
    'ru': {
      'Tranzy': 'Транзи'
    }
  },
  beforeTranslate: () => {   // Хук перед началом перевода
    console.log('Начало перевода');
  },
  afterTranslate: () => {    // Хук после завершения перевода
    console.log('Перевод завершен');
  }
});

tranzy.translatePage();
tranzy.startObserver();
```

> **Примечание:** Если `fromLang` и `toLang` совпадают, `translatePage()` и `startObserver()` автоматически пропускают процесс перевода.

### 1. Элементы, игнорируемые по умолчанию

Tranzy уже настроен на игнорирование следующих элементов по умолчанию:

```javascript
// Эти элементы и их содержимое по умолчанию не переводится
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // Тег стилей
  'script',           // Тег скрипта
  'noscript',         // Тег noscript
  'kbd',              // Тег ввода с клавиатуры
  'code',             // Тег кода
  'pre',              // Тег предварительно отформатированного текста
  'input',            // Поле ввода
  'textarea',         // Текстовая область
  '[contenteditable="true"]', // Редактируемый элемент
  '.tranzy-ignore'    // Пользовательский класс игнорирования
];
```

Можно добавить больше селекторов для игнорирования через опцию `ignore`, но селекторы `force` перезаписывают правила игнорирования. **force имеет приоритет над ignore**.

### 2. Контроль области перевода

```javascript
// ES6 режим
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Игнорирование определенных элементов
  ignore: [
    '.no-translate',      // Игнорировать определенный класс
    '#header',           // Игнорировать определенный ID
    '[data-no-trans]'    // Игнорировать определенный атрибут
  ],
  // Принудительный перевод определенных элементов
  force: [
    '.must-translate',   // Принудительно переводить определенный класс
    '#content'          // Принудительно переводить определенный ID
  ]
});
```

### 3. Использование ручного словаря переводов

```javascript
// ES6 режим
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'ru',
  manualDict: {
    // Глобальный словарь для всех языков
    'all': {
      // Бренды, имена собственные, которые не должны переводиться
      'tranzy': {           
        to: 'tranzy',       // Сохраняет регистр
        standalone: false,  // Совпадает внутри предложения
      },
      'Tranzy': {
        to: 'Tranzy',       // Сохраняет заглавную букву
        standalone: false,  // Совпадает внутри предложения
      },
      // Простая форма, по умолчанию: standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // Словарь для конкретного языка
    'ru': {
      // Полная форма
      'Hello World': {
        to: 'Привет, мир',    
      },
      // Простая форма
      'JavaScript': 'JavaScript (язык программирования)',
      // Поддержка регулярных выражений
      '\\d+ years old': {
        to: 'лет',
      },
      'tranzy': {
        to: 'Транзи',         // Специальная обработка для русского: изменяет на "Транзи"
        standalone: false,    // Совпадает внутри предложения
        case: false          // Игнорирует регистр
      }
    }
  }
});
```

> **Примечание:** Записи словаря для конкретного языка (например, 'ru') имеют приоритет над записями с тем же именем в глобальном словаре ('all'). Этот дизайн позволяет определять общие переводы в глобальном словаре, предоставляя при этом переопределения для конкретных языков, что повышает гибкость и точность перевода.

### 4. Использование хуков

```javascript
// ES6 режим
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Хук перед началом перевода
  beforeTranslate: () => {
    console.log('Начало перевода');
  },
  // Хук после завершения перевода
  afterTranslate: () => {
    console.log('Перевод завершен');
  }
});
```

### 5. Обработка динамического контента

```javascript
// Ручной запуск перевода после загрузки динамического контента
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // Можно указать элемент для перевода, по умолчанию body
};
```

## Расширенные функции

### 1. Встроенный API перевода

Помимо основных функций многоязычности, Tranzy интегрирует Microsoft Translator API, предоставляя следующие возможности:

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// Перевод текста
const result = await translateText(['Hello world'], 'ru', 'en');
console.log(result); // ['Привет, мир']

// Определение языка
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0 }]

// Получение списка поддерживаемых языков
const langs = await getSupportedLangs('ru');
console.log(langs); // { en: { name: 'Английский', nativeName: 'English', dir: 'ltr' }, ... }

// Получение кода языка браузера из поддерживаемых языков
const browserLang = await getBrowserLang();
console.log(browserLang); // 'ru' или 'en' и т.д.
```

### 2. Пользовательская функция перевода

```javascript
// ES6 режим
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'ru',
  // Использование пользовательской функции перевода
  translateFn: async (texts, toLang, fromLang) => {
    // Реализация пользовательской логики перевода
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## Автор

Fts Cloud <ftsuperb@vip.qq.com>

## Лицензия

MIT

## Репозиторий

https://github.com/FtsCloud/Tranzy

## Авторские права

Copyright (c) 2025-present Fts Cloud 