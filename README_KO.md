# Tranzy.js v1.0.8

[简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README.md) | [English](https://github.com/FtsCloud/Tranzy/blob/main/README_EN.md) | [Español](https://github.com/FtsCloud/Tranzy/blob/main/README_ES.md) | [日本語](https://github.com/FtsCloud/Tranzy/blob/main/README_JA.md) | 한국어 | [Русский](https://github.com/FtsCloud/Tranzy/blob/main/README_RU.md) | [Français](https://github.com/FtsCloud/Tranzy/blob/main/README_FR.md) | [Deutsch](https://github.com/FtsCloud/Tranzy/blob/main/README_DE.md)

Tranzy.js는 개발자가 웹사이트에 다국어 지원을 쉽게 추가할 수 있는 전문적인 웹 국제화 솔루션입니다. 자동 번역, 수동 번역 사전, DOM 변경 감시 등의 주요 기능을 제공하며 Microsoft Translator API를 선택적 번역 서비스로 통합합니다.

웹사이트: https://www.tranzy.top/

## 주요 장점

### 1. 개발자 친화적
- 🚀 즉시 사용 가능, 브라우저 설정에서 자동으로 대상 언어 감지
- 🛠️ 다양한 사용자 요구사항에 대응하는 유연한 설정 옵션 제공
- 🔌 사용자 정의 번역 기능 지원, 기본 번역 서비스를 쉽게 교체
- 📝 사용자 정의 처리를 위한 풍부한 훅 제공

### 2. 성능 최적화
- ⚡ IndexedDB를 사용한 번역 캐시, 중복 감소
- 📦 일괄 번역 지원, 효율성 향상
- 🔄 지능형 DOM 변경 감시, 새로운 콘텐츠만 번역
- 💾 번역 캐시 자동 관리, 메모리 사용 최적화

### 3. 강력한 기능
- 🌐 DOM 변경을 자동으로 감시하고 새로운 콘텐츠 번역
- 📚 수동 번역 사전과 용어 처리 지원
- 🎯 강제 번역과 특정 요소 무시 지원
- 🔍 언어 감지와 브라우저 언어 인식 지원

### 4. 유연한 사용
- 🎨 사용자 정의 번역 스타일과 마커 클래스 지원
- 🔄 DOM 감시를 언제든지 켜고 끌 수 있음
- 📱 동적으로 로드된 콘텐츠의 번역 지원
- 🌍 여러 언어와 BCP 47 언어 코드 지원

## 설치

npm으로 설치:

```bash
npm install tranzy
```

또는 pnpm으로 설치:

```bash
pnpm add tranzy
```

## 빠른 시작

### 1. ES Module 사용

```javascript
import Tranzy from 'tranzy';

// 단 3줄의 코드로 웹사이트를 브라우저의 현재 언어로 자동 번역
const tranzy = new Tranzy();
tranzy.translatePage();    // 페이지 전체 번역
tranzy.startObserver();    // DOM 변경 감시, 새로운 콘텐츠 자동 번역
```

### 2. UMD 버전 사용

```html
<!-- Tranzy의 UMD 버전 포함 -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // 단 3줄의 코드로 웹사이트를 브라우저의 현재 언어로 자동 번역
  const tranzy = new Tranzy.Translator();
  tranzy.translatePage();    // 페이지 전체 번역
  tranzy.startObserver();    // DOM 변경 감시, 새로운 콘텐츠 자동 번역
</script>
```

## 고급 설정

더 세밀한 제어가 필요한 경우, Tranzy는 풍부한 설정 옵션을 제공합니다:

```javascript
import Tranzy from 'tranzy';

// 고급 설정으로 Tranzy 인스턴스 생성
const tranzy = new Tranzy({
  toLang: 'ko',              // 대상 언어
  fromLang: 'en',            // 소스 언어 (선택사항)
  ignore: ['.no-translate'], // 무시할 선택자 목록
  force: ['.must-translate'], // 강제할 선택자 목록 (ignore보다 우선)
  manualDict: {              // 수동 번역 사전
    'ko': {
      'Tranzy': '트랜지'
    }
  },
  beforeTranslate: () => {   // 번역 시작 전 훅
    console.log('번역 시작');
  },
  afterTranslate: () => {    // 번역 완료 후 훅
    console.log('번역 완료');
  }
});

tranzy.translatePage();
tranzy.startObserver();
```

> **참고:** `fromLang`과 `toLang`이 같은 경우, `translatePage()`와 `startObserver()`는 자동으로 번역 프로세스를 건너뜁니다.

### 1. 기본적으로 무시되는 요소

Tranzy는 이미 다음 요소들을 기본적으로 무시하도록 설정되어 있습니다:

```javascript
// 이 요소들과 그 내용은 기본적으로 번역되지 않습니다
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // 스타일 태그
  'script',           // 스크립트 태그
  'noscript',         // noscript 태그
  'kbd',              // 키보드 입력 태그
  'code',             // 코드 태그
  'pre',              // 미리 포맷된 텍스트 태그
  'input',            // 입력 필드
  'textarea',         // 텍스트 영역
  '[contenteditable="true"]', // 편집 가능한 요소
  '.tranzy-ignore'    // 사용자 정의 무시 클래스
];
```

`ignore` 옵션으로 더 많은 선택자를 무시하도록 추가할 수 있지만, `force` 선택자는 무시 규칙을 덮어씁니다. **force는 ignore보다 우선**됩니다.

### 2. 번역 범위 제어

```javascript
// ES6 모드
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // 특정 요소 무시
  ignore: [
    '.no-translate',      // 특정 클래스 무시
    '#header',           // 특정 ID 무시
    '[data-no-trans]'    // 특정 속성 무시
  ],
  // 특정 요소 강제
  force: [
    '.must-translate',   // 특정 클래스 강제
    '#content'          // 특정 ID 강제
  ]
});
```

### 3. 수동 번역 사전 사용

```javascript
// ES6 모드
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'ko',
  manualDict: {
    // 모든 언어용 전역 사전
    'all': {
      // 번역하지 않아야 하는 브랜드명, 고유명사
      'tranzy': {           
        to: 'tranzy',       // 대소문자 유지
        standalone: false,  // 문장 내에서도 일치
      },
      'Tranzy': {
        to: 'Tranzy',       // 대문자 유지
        standalone: false,  // 문장 내에서도 일치
      },
      // 간단한 형식, 기본값: standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // 언어별 사전
    'ko': {
      // 완전한 형식
      'Hello World': {
        to: '안녕하세요, 세계',    
      },
      // 간단한 형식
      'JavaScript': 'JavaScript (프로그래밍 언어)',
      // 정규식 지원
      '\\d+ years old': {
        to: '세',
      },
      'tranzy': {
        to: '트랜지',         // 한국어 특별 처리: 변경을"트랜지"로
        standalone: false,    // 문장 내에서도 일치
        case: false          // 대소문자 무시
      }
    }
  }
});
```

> **참고:** 특정 언어(예: 'ko')의 사전 항목은 동일한 이름의 전역 사전('all') 항목보다 우선됩니다. 이 설계를 통해 전역 사전에서 일반적인 번역을 정의하면서 언어별 덮어쓰기를 제공할 수 있어 번역의 유연성과 정확성이 향상됩니다.

### 4. 훅 사용

```javascript
// ES6 모드
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // 번역 시작 전 훅
  beforeTranslate: () => {
    console.log('번역 시작');
  },
  // 번역 완료 후 훅
  afterTranslate: () => {
    console.log('번역 완료');
  }
});
```

### 5. 동적 콘텐츠 처리

```javascript
// 동적 콘텐츠 로드 후 수동으로 번역 트리거
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // 번역할 요소 지정 가능, 기본값은 body
};
```

## 고급 기능

### 1. 내장 번역 API

기본적인 다국어 기능 외에도, Tranzy는 Microsoft Translator API를 통합하여 다음과 같은 기능을 제공합니다:

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// 텍스트 번역
const result = await translateText(['Hello world'], 'ko', 'en');
console.log(result); // ['안녕하세요, 세계']

// 언어 감지
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0, isTranslationSupported: true, isTransliterationSupported: true }]

// 지원되는 언어 목록 가져오기
const langs = await getSupportedLangs('ko');
console.log(langs); // { en: { name: '영어', nativeName: 'English', dir: 'ltr' }, ... }

// 지원되는 언어에서 브라우저 언어 코드 가져오기
const browserLang = await getBrowserLang();
console.log(browserLang); // 'ko' 또는 'en' 등
```

### 2. 사용자 정의 번역 함수

```javascript
// ES6 모드
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'ko',
  // 사용자 정의 번역 함수 사용
  translateFn: async (texts, toLang, fromLang) => {
    // 사용자 정의 번역 로직 구현
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## 작성자

Fts Cloud <ftsuperb@vip.qq.com>

## 라이선스

MIT

## 저장소

https://github.com/FtsCloud/Tranzy

## 저작권

Copyright (c) 2025-present Fts Cloud 