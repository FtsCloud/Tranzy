# Tranzy.js v1.0.8

[简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README.md) | [English](https://github.com/FtsCloud/Tranzy/blob/main/README_EN.md) | [Español](https://github.com/FtsCloud/Tranzy/blob/main/README_ES.md) | [日本語](https://github.com/FtsCloud/Tranzy/blob/main/README_JA.md) | [한국어](https://github.com/FtsCloud/Tranzy/blob/main/README_KO.md) | [Русский](https://github.com/FtsCloud/Tranzy/blob/main/README_RU.md) | Français | [Deutsch](https://github.com/FtsCloud/Tranzy/blob/main/README_DE.md)

Tranzy.js est une solution professionnelle d'internationalisation web qui permet aux développeurs d'ajouter facilement le support multilingue aux sites web. Il fournit des fonctionnalités principales telles que la traduction automatique, le dictionnaire de traduction manuel, la surveillance des changements DOM, et intègre l'API Microsoft Translator comme service de traduction optionnel.

Site web : https://www.tranzy.top/

## Avantages principaux

### 1. Orienté développeur
- 🚀 Prêt à l'emploi, détecte automatiquement la langue cible depuis les paramètres du navigateur
- 🛠️ Fournit des options de configuration flexibles pour répondre aux différents besoins des utilisateurs
- 🔌 Prend en charge les fonctions de traduction personnalisées, remplace facilement le service de traduction par défaut
- 📝 Fournit un riche ensemble de hooks pour le traitement personnalisé

### 2. Optimisation des performances
- ⚡ Mise en cache des traductions avec IndexedDB, réduit la duplication
- 📦 Prend en charge la traduction par lots, améliore l'efficacité
- 🔄 Surveillance intelligente des changements DOM, traduit uniquement le nouveau contenu
- 💾 Gestion automatique du cache des traductions, optimise l'utilisation de la mémoire

### 3. Fonctionnalités puissantes
- 🌐 Surveille automatiquement les changements DOM et traduit le nouveau contenu
- 📚 Prend en charge le dictionnaire de traduction manuel et le traitement des termes
- 🎯 Prend en charge la traduction forcée et l'ignorance d'éléments spécifiques
- 🔍 Prend en charge la détection de la langue et la reconnaissance de la langue du navigateur

### 4. Utilisation flexible
- 🎨 Prend en charge les styles de traduction personnalisés et les classes de marqueurs
- 🔄 Peut activer/désactiver la surveillance DOM à tout moment
- 📱 Prend en charge la traduction du contenu chargé dynamiquement
- 🌍 Prend en charge de nombreuses langues et les codes de langue BCP 47

## Installation

Installation via npm :

```bash
npm install tranzy
```

Ou installation via pnpm :

```bash
pnpm add tranzy
```

## Démarrage rapide

### 1. Utilisation du module ES

```javascript
import Tranzy from 'tranzy';

// Seulement 3 lignes de code pour traduire automatiquement le site dans la langue actuelle du navigateur
const tranzy = new Tranzy();
tranzy.translatePage();    // Traduit toute la page
tranzy.startObserver();    // Surveille les changements DOM, traduit automatiquement le nouveau contenu
```

### 2. Utilisation de la version UMD

```html
<!-- Inclure la version UMD de Tranzy -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // Seulement 3 lignes de code pour traduire automatiquement le site dans la langue actuelle du navigateur
  const tranzy = new Tranzy.Translator();
  tranzy.translatePage();    // Traduit toute la page
  tranzy.startObserver();    // Surveille les changements DOM, traduit automatiquement le nouveau contenu
</script>
```

## Configuration avancée

Pour un contrôle plus fin, Tranzy fournit un riche ensemble d'options de configuration :

```javascript
import Tranzy from 'tranzy';

// Création d'une instance Tranzy avec configuration avancée
const tranzy = new Tranzy({
  toLang: 'fr',              // Langue cible
  fromLang: 'en',            // Langue source (optionnel)
  ignore: ['.no-translate'], // Liste des sélecteurs à ignorer
  force: ['.must-translate'], // Liste des sélecteurs à forcer (priorité sur ignore)
  manualDict: {              // Dictionnaire de traduction manuel
    'fr': {
      'Tranzy': 'Tranzy'
    }
  },
  beforeTranslate: () => {   // Hook avant le début de la traduction
    console.log('Début de la traduction');
  },
  afterTranslate: () => {    // Hook après la fin de la traduction
    console.log('Fin de la traduction');
  }
});

tranzy.translatePage();
tranzy.startObserver();
```

> **Note :** Si `fromLang` et `toLang` sont identiques, `translatePage()` et `startObserver()` sautent automatiquement le processus de traduction.

### 1. Éléments ignorés par défaut

Tranzy est déjà configuré pour ignorer par défaut les éléments suivants :

```javascript
// Ces éléments et leur contenu ne sont pas traduits par défaut
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // Balise de style
  'script',           // Balise de script
  'noscript',         // Balise noscript
  'kbd',              // Balise de saisie clavier
  'code',             // Balise de code
  'pre',              // Balise de texte préformaté
  'input',            // Champ de saisie
  'textarea',         // Zone de texte
  '[contenteditable="true"]', // Élément éditable
  '.tranzy-ignore'    // Classe d'ignorance personnalisée
];
```

Vous pouvez ajouter plus de sélecteurs à ignorer via l'option `ignore`, mais les sélecteurs `force` écrasent les règles d'ignorance. **force a la priorité sur ignore**.

### 2. Contrôle de la portée de la traduction

```javascript
// Mode ES6
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Ignorer certains éléments
  ignore: [
    '.no-translate',      // Ignorer une classe spécifique
    '#header',           // Ignorer un ID spécifique
    '[data-no-trans]'    // Ignorer un attribut spécifique
  ],
  // Forcer la traduction de certains éléments
  force: [
    '.must-translate',   // Forcer une classe spécifique
    '#content'          // Forcer un ID spécifique
  ]
});
```

### 3. Utilisation du dictionnaire de traduction manuel

```javascript
// Mode ES6
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'fr',
  manualDict: {
    // Dictionnaire global pour toutes les langues
    'all': {
      // Marques, noms propres qui ne doivent pas être traduits
      'tranzy': {           
        to: 'tranzy',       // Conserve la casse
        standalone: false,  // Correspond dans la phrase
      },
      'Tranzy': {
        to: 'Tranzy',       // Conserve la majuscule
        standalone: false,  // Correspond dans la phrase
      },
      // Forme simple, par défaut : standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // Dictionnaire spécifique à la langue
    'fr': {
      // Forme complète
      'Hello World': {
        to: 'Bonjour le monde',    
      },
      // Forme simple
      'JavaScript': 'JavaScript (langage de programmation)',
      // Support des expressions régulières
      '\\d+ years old': {
        to: 'ans',
      },
      'tranzy': {
        to: 'Tranzy',         // Traitement spécial pour le français : change en "Tranzy"
        standalone: false,    // Correspond dans la phrase
        case: false          // Ignore la casse
      }
    }
  }
});
```

> **Note :** Les entrées du dictionnaire pour une langue spécifique (par exemple, 'fr') ont la priorité sur les entrées du même nom dans le dictionnaire global ('all'). Cette conception permet de définir des traductions générales dans le dictionnaire global tout en fournissant des remplacements spécifiques à la langue, ce qui améliore la flexibilité et la précision de la traduction.

### 4. Utilisation des hooks

```javascript
// Mode ES6
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Hook avant le début de la traduction
  beforeTranslate: () => {
    console.log('Début de la traduction');
  },
  // Hook après la fin de la traduction
  afterTranslate: () => {
    console.log('Fin de la traduction');
  }
});
```

### 5. Traitement du contenu dynamique

```javascript
// Déclenchement manuel de la traduction après le chargement du contenu dynamique
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // Peut spécifier l'élément à traduire, par défaut body
};
```

## Fonctionnalités avancées

### 1. API de traduction intégrée

En plus des fonctionnalités multilingues de base, Tranzy intègre l'API Microsoft Translator, fournissant les fonctionnalités suivantes :

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// Traduction de texte
const result = await translateText(['Hello world'], 'fr', 'en');
console.log(result); // ['Bonjour le monde']

// Détection de la langue
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0, isTranslationSupported: true, isTransliterationSupported: true }]

// Obtention de la liste des langues supportées
const langs = await getSupportedLangs('fr');
console.log(langs); // { en: { name: 'Anglais', nativeName: 'English', dir: 'ltr' }, ... }

// Obtention du code de langue du navigateur depuis les langues supportées
const browserLang = await getBrowserLang();
console.log(browserLang); // 'fr' ou 'en' etc.
```

### 2. Fonction de traduction personnalisée

```javascript
// Mode ES6
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'fr',
  // Utilisation d'une fonction de traduction personnalisée
  translateFn: async (texts, toLang, fromLang) => {
    // Implémentation de la logique de traduction personnalisée
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## Auteur

Fts Cloud <ftsuperb@vip.qq.com>

## Licence

MIT

## Dépôt

https://github.com/FtsCloud/Tranzy

## Droits d'auteur

Copyright (c) 2025-present Fts Cloud 