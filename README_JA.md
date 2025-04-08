# Tranzy.js v1.0.8

[简体中文](https://github.com/FtsCloud/Tranzy/blob/main/README.md) | [English](https://github.com/FtsCloud/Tranzy/blob/main/README_EN.md) | [Español](https://github.com/FtsCloud/Tranzy/blob/main/README_ES.md) | 日本語 | [한국어](https://github.com/FtsCloud/Tranzy/blob/main/README_KO.md) | [Русский](https://github.com/FtsCloud/Tranzy/blob/main/README_RU.md) | [Français](https://github.com/FtsCloud/Tranzy/blob/main/README_FR.md) | [Deutsch](https://github.com/FtsCloud/Tranzy/blob/main/README_DE.md)

Tranzy.jsは、開発者がウェブサイトに多言語サポートを簡単に追加できるプロフェッショナルなウェブ国際化ソリューションです。自動翻訳、手動翻訳辞書、DOM変更の監視などの主要機能を提供し、Microsoft Translator APIをオプションの翻訳サービスとして統合します。

ウェブサイト：https://www.tranzy.top/

## 主な利点

### 1. 開発者向け
- 🚀 すぐに使用可能、ブラウザの設定から自動的にターゲット言語を検出
- 🛠️ 様々なユーザー要件に対応する柔軟な設定オプションを提供
- 🔌 カスタム翻訳機能をサポート、デフォルトの翻訳サービスを簡単に置き換え
- 📝 カスタム処理のための豊富なフックを提供

### 2. パフォーマンス最適化
- ⚡ IndexedDBを使用した翻訳のキャッシュ、重複を削減
- 📦 バッチ翻訳をサポート、効率を向上
- 🔄 インテリジェントなDOM変更監視、新しいコンテンツのみを翻訳
- 💾 翻訳キャッシュの自動管理、メモリ使用を最適化

### 3. 強力な機能
- 🌐 DOM変更を自動的に監視し、新しいコンテンツを翻訳
- 📚 手動翻訳辞書と用語処理をサポート
- 🎯 強制翻訳と特定の要素の無視をサポート
- 🔍 言語検出とブラウザ言語認識をサポート

### 4. 柔軟な使用
- 🎨 カスタム翻訳スタイルとマーカークラスをサポート
- 🔄 DOM監視のオン/オフをいつでも切り替え可能
- 📱 動的にロードされたコンテンツの翻訳をサポート
- 🌍 複数の言語とBCP 47言語コードをサポート

## インストール

npmでのインストール：

```bash
npm install tranzy
```

またはpnpmでのインストール：

```bash
pnpm add tranzy
```

## クイックスタート

### 1. ES Moduleの使用

```javascript
import Tranzy from 'tranzy';

// たった3行のコードでウェブサイトをブラウザの現在の言語に自動翻訳
const tranzy = new Tranzy();
tranzy.translatePage();    // ページ全体を翻訳
tranzy.startObserver();    // DOM変更を監視、新しいコンテンツを自動翻訳
```

### 2. UMDバージョンの使用

```html
<!-- TranzyのUMDバージョンを含める -->
<script src="path/to/tranzy.umd.js"></script>
<script>
  // たった3行のコードでウェブサイトをブラウザの現在の言語に自動翻訳
  const tranzy = new Tranzy.Translator();
  tranzy.translatePage();    // ページ全体を翻訳
  tranzy.startObserver();    // DOM変更を監視、新しいコンテンツを自動翻訳
</script>
```

## 高度な設定

より細かい制御が必要な場合、Tranzyは豊富な設定オプションを提供します：

```javascript
import Tranzy from 'tranzy';

// 高度な設定でTranzyインスタンスを作成
const tranzy = new Tranzy({
  toLang: 'ja',              // ターゲット言語
  fromLang: 'en',            // ソース言語（オプション）
  ignore: ['.no-translate'], // 無視するセレクターのリスト
  force: ['.must-translate'], // 強制するセレクターのリスト（ignoreより優先）
  manualDict: {              // 手動翻訳辞書
    'ja': {
      'Tranzy': 'トランジー'
    }
  },
  beforeTranslate: () => {   // 翻訳開始前のフック
    console.log('翻訳開始');
  },
  afterTranslate: () => {    // 翻訳完了後のフック
    console.log('翻訳完了');
  }
});

tranzy.translatePage();
tranzy.startObserver();
```

> **注意：** `fromLang`と`toLang`が同じ場合、`translatePage()`と`startObserver()`は自動的に翻訳プロセスをスキップします。

### 1. デフォルトで無視される要素

Tranzyは既に以下の要素をデフォルトで無視するように設定されています：

```javascript
// これらの要素とその内容はデフォルトで翻訳されません
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // スタイルタグ
  'script',           // スクリプトタグ
  'noscript',         // noscriptタグ
  'kbd',              // キーボード入力タグ
  'code',             // コードタグ
  'pre',              // プリフォーマットテキストタグ
  'input',            // 入力フィールド
  'textarea',         // テキストエリア
  '[contenteditable="true"]', // 編集可能な要素
  '.tranzy-ignore'    // カスタム無視クラス
];
```

`ignore`オプションでより多くのセレクターを無視するように追加できますが、`force`セレクターは無視ルールを上書きします。**forceはignoreより優先**されます。

### 2. 翻訳スコープの制御

```javascript
// ES6モード
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // 特定の要素を無視
  ignore: [
    '.no-translate',      // 特定のクラスを無視
    '#header',           // 特定のIDを無視
    '[data-no-trans]'    // 特定の属性を無視
  ],
  // 特定の要素を強制
  force: [
    '.must-translate',   // 特定のクラスを強制
    '#content'          // 特定のIDを強制
  ]
});
```

### 3. 手動翻訳辞書の使用

```javascript
// ES6モード
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'ja',
  manualDict: {
    // すべての言語用のグローバル辞書
    'all': {
      // 翻訳すべきでないブランド名、固有名詞
      'tranzy': {           
        to: 'tranzy',       // 大文字小文字を保持
        standalone: false,  // 文内でも一致
      },
      'Tranzy': {
        to: 'Tranzy',       // 大文字を保持
        standalone: false,  // 文内でも一致
      },
      // シンプルな形式、デフォルト：standalone: true, case: true
      'Copyright': 'Copyright'
    },
    // 言語固有の辞書
    'ja': {
      // 完全な形式
      'Hello World': {
        to: 'こんにちは、世界',    
      },
      // シンプルな形式
      'JavaScript': 'JavaScript (プログラミング言語)',
      // 正規表現のサポート
      '\\d+ years old': {
        to: '歳',
      },
      'tranzy': {
        to: 'トランジー',         // 日本語用の特別処理：変更を"トランジー"に
        standalone: false,    // 文内でも一致
        case: false          // 大文字小文字を無視
      }
    }
  }
});
```

> **注意：** 特定の言語（例：'ja'）の辞書エントリは、同じ名前のグローバル辞書（'all'）のエントリより優先されます。この設計により、グローバル辞書で一般的な翻訳を定義しながら、言語固有の上書きを提供でき、翻訳の柔軟性と精度が向上します。

### 4. フックの使用

```javascript
// ES6モード
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  // 翻訳開始前のフック
  beforeTranslate: () => {
    console.log('翻訳開始');
  },
  // 翻訳完了後のフック
  afterTranslate: () => {
    console.log('翻訳完了');
  }
});
```

### 5. 動的コンテンツの処理

```javascript
// 動的コンテンツのロード後に手動で翻訳をトリガー
const loadContent = () => {
  loadDynamicContent();
  tranzy.translatePage('.dynamic-content'); // 翻訳する要素を指定可能、デフォルトはbody
};
```

## 高度な機能

### 1. 組み込み翻訳API

基本的な多言語機能に加えて、TranzyはMicrosoft Translator APIを統合し、以下の機能を提供します：

```javascript
import { translateText, detectLang, getSupportedLangs, getBrowserLang } from 'tranzy';

// テキストの翻訳
const result = await translateText(['Hello world'], 'ja', 'en');
console.log(result); // ['こんにちは、世界']

// 言語の検出
const langResult = await detectLang('Hello world');
console.log(langResult); // [{ language: 'en', score: 1.0, isTranslationSupported: true, isTransliterationSupported: true }]

// サポートされている言語のリストを取得
const langs = await getSupportedLangs('ja');
console.log(langs); // { en: { name: '英語', nativeName: 'English', dir: 'ltr' }, ... }

// サポートされている言語からブラウザの言語コードを取得
const browserLang = await getBrowserLang();
console.log(browserLang); // 'ja'または'en'など
```

### 2. カスタム翻訳関数

```javascript
// ES6モード
import Tranzy from 'tranzy';
const tranzy = new Tranzy({
  toLang: 'ja',
  // カスタム翻訳関数の使用
  translateFn: async (texts, toLang, fromLang) => {
    // カスタム翻訳ロジックの実装
    return texts.map(text => `[${toLang}] ${text}`);
  }
});
```

## 作者

Fts Cloud <ftsuperb@vip.qq.com>

## ライセンス

MIT

## リポジトリ

https://github.com/FtsCloud/Tranzy

## 著作権

Copyright (c) 2025-present Fts Cloud 