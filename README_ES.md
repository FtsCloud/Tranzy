# Tranzy.js v1.0.8

[简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README.md) | [English](https://github.com/FtsCloud/Tranzy/blob/main/README_EN.md) | Español | [日本語](https://github.com/FtsCloud/Tranzy/blob/main/README_JA.md) | [한국어](https://github.com/FtsCloud/Tranzy/blob/main/README_KO.md) | [Русский](https://github.com/FtsCloud/Tranzy/blob/main/README_RU.md) | [Français](https://github.com/FtsCloud/Tranzy/blob/main/README_FR.md) | [Deutsch](https://github.com/FtsCloud/Tranzy/blob/main/README_DE.md)

Tranzy.js es una solución profesional de internacionalización web que permite a los desarrolladores agregar fácilmente soporte multilingüe a sitios web. Proporciona funciones principales como traducción automática, diccionario de traducción manual y monitoreo de cambios DOM, mientras integra la API de Microsoft Translator como servicio de traducción opcional.

Sitio web: https://www.tranzy.top/

## Ventajas principales

### 1. Orientado al desarrollador
- 🚀 Funciona inmediatamente, detecta automáticamente el idioma objetivo desde la configuración del navegador
- 🛠️ Proporciona opciones de configuración flexibles para satisfacer diversas necesidades de usuario
- 🔌 Admite funciones de traducción personalizadas, reemplaza fácilmente el servicio de traducción predeterminado
- 📝 Proporciona un rico conjunto de hooks para el procesamiento personalizado

### 2. Optimización de rendimiento
- ⚡ Utiliza IndexedDB para el almacenamiento en caché de traducciones, reduciendo la duplicación
- 📦 Admite traducción por lotes para mejorar la eficiencia
- 🔄 Monitoreo inteligente de cambios DOM para traducir solo contenido nuevo
- 💾 Gestión automática del caché de traducciones para optimizar el uso de memoria

### 3. Funciones potentes
- 🌐 Monitorea automáticamente los cambios DOM y traduce nuevo contenido
- 📚 Admite diccionario de traducción manual y procesamiento de términos
- 🎯 Admite traducción forzada e ignorar elementos específicos
- 🔍 Admite detección de idioma y reconocimiento del idioma del navegador

### 4. Uso flexible
- 🎨 Admite estilos de traducción personalizados y clases de marcadores
- 🔄 Permite activar/desactivar el monitoreo DOM en cualquier momento
- 📱 Admite traducción de contenido cargado dinámicamente
- 🌍 Admite múltiples idiomas y códigos de idioma BCP 47

## Instalación

Instalación mediante npm:

```bash
npm install tranzy
```

O instalación mediante pnpm:

```bash
pnpm add tranzy
```

## Inicio rápido

### 1. Uso de ES Module

```javascript
import Tranzy from 'tranzy';

// Solo 3 líneas de código para traducir automáticamente el sitio web al idioma actual del navegador
const tranzy = new Tranzy();
tranzy.translatePage();    // Traduce toda la página
tranzy.startObserver();    // Monitorea cambios DOM, traduce automáticamente nuevo contenido
```

### 2. Uso de la versión UMD

```html
<!-- Inclusión de la versión UMD de Tranzy -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // Solo 3 líneas de código para traducir automáticamente el sitio web al idioma actual del navegador
  const tranzy = new Tranzy.Translator();
  tranzy.translatePage();    // Traduce toda la página
  tranzy.startObserver();    // Monitorea cambios DOM, traduce automáticamente nuevo contenido
</script>
```

## Configuración avanzada

Para un control más fino, Tranzy proporciona un rico conjunto de opciones de configuración:

```javascript
import Tranzy from 'tranzy';

// Creación de una instancia de Tranzy con configuraciones avanzadas
const tranzy = new Tranzy({
  toLang: 'es',              // Idioma objetivo
  fromLang: 'en',            // Idioma de origen (opcional)
  ignore: ['.no-translate'], // Lista de selectores a ignorar
  force: ['.must-translate'], // Lista de selectores a forzar (prioridad sobre ignore)
  manualDict: {              // Diccionario de traducción manual
    'es': {
      'Tranzy': 'Tranzy'
    }
  },
  beforeTranslate: () => {   // Hook antes de comenzar la traducción
    console.log('Inicio de traducción');
  },
  afterTranslate: () => {    // Hook después de completar la traducción
    console.log('Fin de traducción');
  }
});

tranzy.translatePage();
tranzy.startObserver();
```

> **Nota:** Si `fromLang` y `toLang` son idénticos, `translatePage()` y `startObserver()` saltan automáticamente el proceso de traducción.

### 1. Elementos ignorados por defecto

Tranzy ya está configurado para ignorar los siguientes elementos por defecto:

```javascript
// Estos elementos y su contenido no se traducen por defecto
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // Etiqueta de estilo
  'script',           // Etiqueta de script
  'noscript',         // Etiqueta noscript
  'kbd',              // Etiqueta de entrada de teclado
  'code',             // Etiqueta de código
  'pre',              // Etiqueta de texto preformateado
  'input',            // Campo de entrada
  'textarea',         // Área de texto
  '[contenteditable="true"]', // Elemento editable
  '.tranzy-ignore'    // Clase de ignorar personalizada
];
```

Puede agregar más selectores para ignorar a través de la opción `ignore`, pero los selectores `force` reemplazan las reglas de ignorar. **force tiene prioridad sobre ignore**.

### 2. Control del alcance de traducción

```javascript
// Modo ES6
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Ignorar elementos específicos
  ignore: [
    '.no-translate',      // Ignorar clase específica
    '#header',           // Ignorar ID específico
    '[data-no-trans]'    // Ignorar atributo específico
  ],
  // Forzar elementos específicos
  force: [
    '.must-translate',   // Forzar clase específica
    '#content'          // Forzar ID específico
  ]
});
```

### 3. Uso del diccionario de traducción manual

```javascript
// Modo ES6
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'es',
  manualDict: {
    // Diccionario global para todos los idiomas
    'all': {
      // Marcas, nombres propios que no deben traducirse
      'tranzy': {           
        to: 'tranzy',       // Mantiene mayúsculas/minúsculas
        standalone: false,  // Coincide dentro de la oración
      },
      'Tranzy': {
        to: 'Tranzy',       // Mantiene mayúscula
        standalone: false,  // Coincide dentro de la oración
      },
      // Forma simple, predeterminado: standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // Diccionario de idioma
    'es': {
      // Forma completa
      'Hello World': {
        to: 'Hola Mundo',    
      },
      // Forma simple
      'JavaScript': 'JavaScript (lenguaje de programación)',
      // Soporte de expresión regular
      '\\d+ years old': {
        to: 'años',
      },
      'tranzy': {
        to: 'Tranzy',         // Tratamiento especial para español: cambiado a "Tranzy"
        standalone: false,    // Coincide dentro de la oración
        case: false          // Ignora mayúsculas/minúsculas
      }
    }
  }
});
```

> **Nota:** Las entradas del diccionario para un idioma específico (por ejemplo, 'es') tienen prioridad sobre las entradas con el mismo nombre en el diccionario global ('all'). Este diseño permite definir traducciones comunes en el diccionario global mientras proporciona reemplazos específicos del idioma, mejorando así la flexibilidad y precisión de la traducción.

### 4. Uso de hooks

```javascript
// Modo ES6
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // Hook antes de comenzar la traducción
  beforeTranslate: () => {
    console.log('Inicio de traducción');
  },
  // Hook después de completar la traducción
  afterTranslate: () => {
    console.log('Fin de traducción');
  }
});
```

### 5. Procesamiento de contenido dinámico

```javascript
// Activación manual de la traducción después de cargar contenido dinámico
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // Puede especificar elemento a traducir, predeterminado es body
};
```

## Funciones avanzadas

### 1. API de traducción integrada

Además de las funciones básicas multilingües, Tranzy integra la API de Microsoft Translator, proporcionando las siguientes funciones:

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// Traducción de texto
const result = await translateText(['Hello world'], 'es', 'en');
console.log(result); // ['Hola mundo']

// Detección de idioma
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0, isTranslationSupported: true, isTransliterationSupported: true }]

// Obtención de lista de idiomas soportados
const langs = await getSupportedLangs('es');
console.log(langs); // { en: { name: 'Inglés', nativeName: 'English', dir: 'ltr' }, ... }

// Obtención de código de idioma del navegador de idiomas soportados
const browserLang = await getBrowserLang();
console.log(browserLang); // 'es' o 'en' etc.
```

### 2. Función de traducción personalizada

```javascript
// Modo ES6
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'es',
  // Uso de función de traducción personalizada
  translateFn: async (texts, toLang, fromLang) => {
    // Implementación de lógica de traducción personalizada
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## Autor

Fts Cloud <ftsuperb@vip.qq.com>

## Licencia

MIT

## Repositorio

https://github.com/FtsCloud/Tranzy

## Derechos de autor

Copyright (c) 2025-present Fts Cloud 