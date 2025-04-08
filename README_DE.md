# Tranzy.js v1.0.8

[简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README.md) | [English](https://github.com/FtsCloud/Tranzy/blob/main/README_EN.md) | [Español](https://github.com/FtsCloud/Tranzy/blob/main/README_ES.md) | [日本語](https://github.com/FtsCloud/Tranzy/blob/main/README_JA.md) | [한국어](https://github.com/FtsCloud/Tranzy/blob/main/README_KO.md) | [Русский](https://github.com/FtsCloud/Tranzy/blob/main/README_RU.md) | [Français](https://github.com/FtsCloud/Tranzy/blob/main/README_FR.md) | Deutsch

Tranzy.js ist eine professionelle Web-Internationalisierungslösung, die es Entwicklern ermöglicht, mehrsprachige Unterstützung einfach zu Websites hinzuzufügen. Es bietet Kernfunktionen wie automatische Übersetzung, manuelles Übersetzungswörterbuch, DOM-Änderungsüberwachung und integriert die Microsoft Translator API als optionalen Übersetzungsservice.

Website: https://www.tranzy.top/

## Kernvorteile

### 1. Entwicklerorientiert
- 🚀 Sofort einsatzbereit, erkennt automatisch die Zielsprache aus den Browsereinstellungen
- 🛠️ Bietet flexible Konfigurationsoptionen für verschiedene Benutzeranforderungen
- 🔌 Unterstützt benutzerdefinierte Übersetzungsfunktionen, ersetzt einfach den Standard-Übersetzungsservice
- 📝 Bietet einen reichen Satz von Hooks für benutzerdefinierte Verarbeitung

### 2. Leistungsoptimierung
- ⚡ Übersetzungscache mit IndexedDB, reduziert Duplikate
- 📦 Unterstützt Batch-Übersetzung, verbessert die Effizienz
- 🔄 Intelligente DOM-Änderungsüberwachung, übersetzt nur neue Inhalte
- 💾 Automatische Cache-Verwaltung für Übersetzungen, optimiert den Speicherverbrauch

### 3. Leistungsstarke Funktionen
- 🌐 Überwacht automatisch DOM-Änderungen und übersetzt neue Inhalte
- 📚 Unterstützt manuelles Übersetzungswörterbuch und Begriffverarbeitung
- 🎯 Unterstützt erzwungene Übersetzung und Ignorieren bestimmter Elemente
- 🔍 Unterstützt Spracherkennung und Browser-Spracherkennung

### 4. Flexible Nutzung
- 🎨 Unterstützt benutzerdefinierte Übersetzungsstile und Marker-Klassen
- 🔄 Kann DOM-Überwachung jederzeit ein- und ausschalten
- 📱 Unterstützt Übersetzung dynamisch geladener Inhalte
- 🌍 Unterstützt viele Sprachen und BCP 47-Sprachcodes

## Installation

Installation über npm:

```bash
npm install tranzy
```

Oder Installation über pnpm:

```bash
pnpm add tranzy
```

## Schnellstart

### 1. Verwendung des ES-Moduls

```javascript
import Tranzy from 'tranzy';

// Nur 3 Codezeilen, um die Website automatisch in die aktuelle Browsersprache zu übersetzen
const tranzy = new Tranzy();
tranzy.translatePage();    // Übersetzt die gesamte Seite
tranzy.startObserver();    // Überwacht DOM-Änderungen, übersetzt automatisch neue Inhalte
```

### 2. Verwendung der UMD-Version

```html
<!-- UMD-Version von Tranzy einbinden -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // Nur 3 Codezeilen, um die Website automatisch in die aktuelle Browsersprache zu übersetzen
  const tranzy = new Tranzy.Translator();
  tranzy.translatePage();    // Übersetzt die gesamte Seite
  tranzy.startObserver();    // Überwacht DOM-Änderungen, übersetzt automatisch neue Inhalte
</script>
```

## Erweiterte Konfiguration

Für eine feinere Kontrolle bietet Tranzy einen reichen Satz von Konfigurationsoptionen:

```javascript
import Tranzy from 'tranzy';

// Erstellen einer Tranzy-Instanz mit erweiterter Konfiguration
const tranzy = new Tranzy({
  toLang: 'de',              // Zielsprache
  fromLang: 'en',            // Quellsprache (optional)
  ignore: ['.no-translate'], // Liste der zu ignorierenden Selektoren
  force: ['.must-translate'], // Liste der zu erzwingenden Selektoren (Vorrang vor ignore)
  manualDict: {              // Manuelles Übersetzungswörterbuch
    'de': {
      'Tranzy': 'Tranzy'
    }
  },
  beforeTranslate: () => {   // Hook vor Beginn der Übersetzung
    console.log('Übersetzung beginnt');
  },
  afterTranslate: () => {    // Hook nach Abschluss der Übersetzung
    console.log('Übersetzung abgeschlossen');
  }
});

tranzy.translatePage();
tranzy.startObserver();
```

> **Hinweis:** Wenn `fromLang` und `toLang` identisch sind, überspringen `translatePage()` und `startObserver()` automatisch den Übersetzungsprozess.

### 1. Standardmäßig ignorierte Elemente

Tranzy ist bereits standardmäßig so konfiguriert, dass es die folgenden Elemente ignoriert:

```javascript
// Diese Elemente und ihr Inhalt werden standardmäßig nicht übersetzt
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // Style-Tag
  'script',           // Script-Tag
  'noscript',         // Noscript-Tag
  'kbd',              // Tastatureingabe-Tag
  'code',             // Code-Tag
  'pre',              // Vorformatierter Text-Tag
  'input',            // Eingabefeld
  'textarea',         // Textbereich
  '[contenteditable="true"]', // Bearbeitbares Element
  '.tranzy-ignore'    // Benutzerdefinierte Ignorier-Klasse
];
```

Sie können über die Option `ignore` weitere Selektoren zum Ignorieren hinzufügen, aber die Selektoren `force` überschreiben die Ignorier-Regeln. **force hat Vorrang vor ignore**.

### 2. Kontrolle des Übersetzungsbereichs

```javascript
// ES6-Modus
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Bestimmte Elemente ignorieren
  ignore: [
    '.no-translate',      // Bestimmte Klasse ignorieren
    '#header',           // Bestimmte ID ignorieren
    '[data-no-trans]'    // Bestimmtes Attribut ignorieren
  ],
  // Bestimmte Elemente erzwingen
  force: [
    '.must-translate',   // Bestimmte Klasse erzwingen
    '#content'          // Bestimmte ID erzwingen
  ]
});
```

### 3. Verwendung des manuellen Übersetzungswörterbuchs

```javascript
// ES6-Modus
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'de',
  manualDict: {
    // Globales Wörterbuch für alle Sprachen
    'all': {
      // Marken, Eigennamen, die nicht übersetzt werden sollen
      'tranzy': {           
        to: 'tranzy',       // Behält Groß-/Kleinschreibung bei
        standalone: false,  // Übereinstimmt innerhalb des Satzes
      },
      'Tranzy': {
        to: 'Tranzy',       // Behält Großbuchstabe bei
        standalone: false,  // Übereinstimmt innerhalb des Satzes
      },
      // Einfache Form, Standard: standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // Sprachspezifisches Wörterbuch
    'de': {
      // Vollständige Form
      'Hello World': {
        to: 'Hallo Welt',    
      },
      // Einfache Form
      'JavaScript': 'JavaScript (Programmiersprache)',
      // Unterstützung für reguläre Ausdrücke
      '\\d+ years old': {
        to: 'Jahre alt',
      },
      'tranzy': {
        to: 'Tranzy',         // Spezielle Behandlung für Deutsch: ändert zu "Tranzy"
        standalone: false,    // Übereinstimmt innerhalb des Satzes
        case: false          // Ignoriert Groß-/Kleinschreibung
      }
    }
  }
});
```

> **Hinweis:** Wörterbucheinträge für eine bestimmte Sprache (z.B. 'de') haben Vorrang vor Einträgen mit dem gleichen Namen im globalen Wörterbuch ('all'). Dieses Design ermöglicht es, allgemeine Übersetzungen im globalen Wörterbuch zu definieren und gleichzeitig sprachspezifische Überschreibungen bereitzustellen, was die Flexibilität und Genauigkeit der Übersetzung verbessert.

### 4. Verwendung von Hooks

```javascript
// ES6-Modus
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Hook vor Beginn der Übersetzung
  beforeTranslate: () => {
    console.log('Übersetzung beginnt');
  },
  // Hook nach Abschluss der Übersetzung
  afterTranslate: () => {
    console.log('Übersetzung abgeschlossen');
  }
});
```

### 5. Behandlung dynamischer Inhalte

```javascript
// Manuelles Auslösen der Übersetzung nach dem Laden dynamischer Inhalte
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // Kann das zu übersetzende Element angeben, Standard ist body
};
```

## Erweiterte Funktionen

### 1. Integrierte Übersetzungs-API

Zusätzlich zu den grundlegenden Mehrsprachigkeitsfunktionen integriert Tranzy die Microsoft Translator API und bietet folgende Funktionen:

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// Textübersetzung
const result = await translateText(['Hello world'], 'de', 'en');
console.log(result); // ['Hallo Welt']

// Spracherkennung
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0, isTranslationSupported: true, isTransliterationSupported: true }]

// Liste der unterstützten Sprachen abrufen
const langs = await getSupportedLangs('de');
console.log(langs); // { en: { name: 'Englisch', nativeName: 'English', dir: 'ltr' }, ... }

// Browsersprachcode aus den unterstützten Sprachen abrufen
const browserLang = await getBrowserLang();
console.log(browserLang); // 'de' oder 'en' etc.
```

### 2. Benutzerdefinierte Übersetzungsfunktion

```javascript
// ES6-Modus
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'de',
  // Verwendung einer benutzerdefinierten Übersetzungsfunktion
  translateFn: async (texts, toLang, fromLang) => {
    // Implementierung der benutzerdefinierten Übersetzungslogik
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## Autor

Fts Cloud <ftsuperb@vip.qq.com>

## Lizenz

MIT

## Repository

https://github.com/FtsCloud/Tranzy

## Urheberrecht

Copyright (c) 2025-present Fts Cloud 