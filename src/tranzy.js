/**
 * Tranzy - 网页自动翻译插件
 *
 * 主要功能：
 * 1. 自动检测DOM变化并翻译新增内容
 * 2. 支持批量翻译和缓存机制
 * 3. 提供灵活的配置选项和钩子函数
 * 4. 支持手动翻译词典和术语处理
 * 5. 内置微软翻译API实现
 *
 * 使用方式：
 * 1. 直接使用翻译功能：
 *    import { translateText } from 'tranzy';
 *    const result = await translateText(['Hello'], 'zh', 'en');
 *
 * 2. 使用页面翻译功能：
 *    import Tranzy from 'tranzy';
 *    const tranzy = new Tranzy({
 *      toLang: 'zh',
 *      fromLang: 'en'
 *    });
 *    await tranzy.translatePage();
 *
 * @author Fts Cloud <ftsuperb@vip.qq.com>
 * @license MIT
 * @repository https://github.com/FtsCloud/Tranzy
 * @copyright Copyright (c) 2023-present Fts Cloud
 */

// 默认忽略的选择器列表，这些元素及其内容不会被翻译
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // 样式标签
  'script',           // 脚本标签
  'noscript',         // 无脚本标签
  'kbd',              // 键盘输入标签
  'code',             // 代码标签
  'pre',              // 预格式化文本标签
  'input',            // 输入框
  'textarea',         // 文本域
  '[contenteditable="true"]', // 可编辑元素
  '.tranzy-ignore'    // 自定义忽略类
];

// 默认配置选项
const DEFAULT_CONFIG = {
  toLang: navigator.language || '',    // 目标语言，默认从浏览器语言设置获取
  fromLang: '',                        // 源语言，如：'en'
  ignore: [],                          // 自定义忽略选择器列表
  force: [],                           // 强制翻译选择器列表
  doneClass: 'tranzy-done',            // 已翻译元素的标记类
  pendingClass: 'tranzy-pending',      // 正在翻译中的元素标记类
  translateFn: translateText,          // 默认使用translateText函数
  manualDict: {},                      // 手动翻译词典
  beforeTranslate: null,               // 翻译开始前的钩子
  afterTranslate: null,                // 翻译结束后的钩子
};

/**
 * 翻译缓存管理器
 * 使用IndexedDB存储翻译结果，提高性能并减少API调用
 */
class TranslationCache {
  /**
   * 创建TranslationCache实例
   * @param {string} toLang - 目标语言代码
   * @param {string} [fromLang=''] - 源语言代码
   */
  constructor(toLang, fromLang = '') {
    this.dbName = `tranzy-${toLang}${fromLang ? '-'+fromLang : ''}`; // 基于语言对的数据库名称
    this.storeName = 'translations';    // 存储对象名称
    this.db = null;                     // 数据库实例
    this.initPromise = this._initDatabase(); // 初始化Promise
  }

  /**
   * 生成字符串哈希值
   * 使用FNV-1a哈希算法，生成base36编码的短哈希值
   * @param {string} str - 需要哈希的字符串
   * @returns {string} - base36编码的哈希值
   */
  _generateHash(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash *= 16777619;
    }
    return hash.toString(36);
  }

  /**
   * 初始化IndexedDB数据库
   * 创建数据库和存储对象，处理版本升级
   * @returns {Promise} - 初始化完成的Promise
   */
  async _initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {keyPath: 'id'});
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        console.error(`Tranzy: Failed to initialize cache database / 初始化缓存数据库失败: ${this.dbName}`, event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * 获取缓存的翻译结果
   * @param {string} text - 原文
   * @returns {Promise<string|null>} - 缓存的翻译结果或null
   */
  async get(text) {
    await this.initPromise;
    // 只对文本本身进行哈希
    const id = this._generateHash(text);

    return new Promise((resolve) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = (event) => {
        resolve(event.target.result?.value || null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * 设置翻译结果到缓存
   * @param {string} text - 原文
   * @param {string} translation - 翻译结果
   * @returns {Promise<void>}
   */
  async set(text, translation) {
    await this.initPromise;
    // 只对文本本身进行哈希
    const id = this._generateHash(text);

    return new Promise((resolve) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({
        id,
        value: translation
      });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        resolve();
      };
    });
  }

  /**
   * 批量设置翻译结果到缓存
   * @param {string[]} texts - 原文数组
   * @param {string[]} translations - 翻译结果数组
   * @returns {Promise<void>}
   */
  async setBatch(texts, translations) {
    await this.initPromise;
    await Promise.all(texts.map((text, index) => {
      return this.set(text, translations[index]);
    }));
  }

  /**
   * 销毁实例，关闭数据库连接
   */
  destroy() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * 从sessionStorage加载认证token
 * @returns {{token: string|null, timestamp: number}} - token和获取时间戳
 */
function loadTokenFromSession() {
  try {
    const tokenData = sessionStorage.getItem('tranzy_auth_token');
    if (tokenData) {
      const {
        token,
        timestamp
      } = JSON.parse(tokenData);
      const now = Date.now();
      // 如果token未过期，则使用缓存的token
      if (token && (now - timestamp) < 10 * 60 * 1000) {
        return {
          token,
          timestamp
        };
      }
      // token已过期，清除缓存
      clearTokenFromSession();
    }
  } catch (error) {
    console.error('Tranzy: Failed to load token from session / 从session加载token失败', error);
    clearTokenFromSession();
  }
  return {
    token: null,
    timestamp: 0
  };
}

/**
 * 保存认证token到sessionStorage
 * @param {string} token - 认证token
 * @param {number} timestamp - 获取时间戳
 */
function saveTokenToSession(token, timestamp) {
  try {
    sessionStorage.setItem('tranzy_auth_token', JSON.stringify({
      token,
      timestamp
    }));
  } catch (error) {
    console.error('Tranzy: Failed to save token to session / 保存token到session失败', error);
  }
}

/**
 * 清除sessionStorage中的认证token
 */
function clearTokenFromSession() {
  try {
    sessionStorage.removeItem('tranzy_auth_token');
  } catch (error) {
    console.error('Tranzy: Failed to clear token from session / 清除session中的token失败', error);
  }
}

/**
 * 获取微软翻译API的认证token
 * 优先使用缓存的token，如果过期则重新获取
 * @returns {Promise<string>} - 认证token
 */
async function getAuthToken() {
  const now = Date.now();
  const {
    token,
    timestamp
  } = loadTokenFromSession();

  // 如果token获取时间小于10分钟，则直接返回
  if (token && (now - timestamp) < 10 * 60 * 1000) {
    return token;
  }

  try {
    const response = await fetch('https://edge.microsoft.com/translate/auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Tranzy: Failed to get Microsoft Translator authorization / 获取微软翻译授权失败: ${response.status} ${response.statusText}`);
      return null;
    }

    const newToken = await response.text();
    saveTokenToSession(newToken, now);

    return newToken;
  } catch (error) {
    console.error('Tranzy: Failed to get Microsoft Translator authorization / 获取微软翻译授权失败', error);
    clearTokenFromSession();
    throw error;
  }
}

/**
 * 调用微软翻译API进行翻译
 * @param {string[]} texts - 需要翻译的文本数组
 * @param {string} toLang - 目标语言代码
 * @param {string} [fromLang=''] - 源语言代码
 * @returns {Promise<string[]>} - 翻译结果数组
 */
export async function translateText(texts, toLang = navigator.language, fromLang = '') {
  try {
    // 过滤掉空文本和null值
    const filteredTexts = texts.filter(text => text?.trim());

    // 如果没有有效文本需要翻译，直接返回空数组
    if (filteredTexts.length === 0) {
      return [];
    }

    // 获取认证令牌
    const token = await getAuthToken();

    // 构建URL，只在设置了fromLang时添加from参数
    const url = `https://api.cognitive.microsofttranslator.com/translate?${fromLang ? `from=${fromLang}&` : ''}to=${toLang}&api-version=3.0`

    // 构建请求数据
    const data = filteredTexts.map(text => ({Text: text}));

    // 发送请求
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error(`Tranzy: Translation request failed / 翻译请求失败: ${response.status} ${response.statusText}`);
      return texts; // 返回原文
    }

    // 处理响应
    const result = await response.json();
    return result.map(item => item.translations[0].text);
  } catch (error) {
    console.error('Tranzy: Translation request failed / 翻译请求失败', error);
    throw error;
  }
}

/**
 * 检测文本的语言
 * @param {string|string[]} texts - 需要检测语言的文本或文本数组
 * @returns {Promise<Array<{language: string, score: number, isTranslationSupported: boolean, isTransliterationSupported: boolean}>>} - 语言检测结果数组
 */
export async function detectLang(texts) {
  try {
    // 确保texts是数组
    const textArray = Array.isArray(texts) ? texts : [texts];

    // 过滤掉空文本和null值
    const filteredTexts = textArray.filter(text => text?.trim());

    // 如果没有有效文本需要检测，直接返回空数组
    if (filteredTexts.length === 0) {
      return [];
    }

    // 获取认证令牌
    const token = await getAuthToken();

    // 构建请求数据
    const data = filteredTexts.map(text => ({Text: text}));

    // 发送请求
    const response = await fetch('https://api.cognitive.microsofttranslator.com/detect?api-version=3.0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error(`Tranzy: Language detection request failed / 语言检测请求失败: ${response.status} ${response.statusText}`);
      return []; // 返回空数组
    }

    // 处理响应
    return await response.json();
  } catch (error) {
    console.error('Tranzy: Language detection failed / 语言检测失败', error);
    throw error;
  }
}

/**
 * 获取支持的语种列表
 * @param {string} [displayLang=''] - 用于显示语言名称的BCP 47语言代码，例如：'zh-CN'表示用简体中文显示语言名称
 * @returns {Promise<Object>} - 支持的语种列表，格式为 { languageCode: { name: string, nativeName: string, dir: string } }
 * 注意：所有语言代码均遵循BCP 47规范，例如：'zh-CN'、'en'、'ja'等
 */
export async function getSupportedLangs(displayLang = '') {
  try {
    // 构建请求头
    const headers = {
      'Content-Type': 'application/json'
    };

    // 如果指定了显示语言，添加到请求头
    if (displayLang) {
      headers['Accept-Language'] = displayLang;
    }

    // 发送请求
    const response = await fetch('https://api.cognitive.microsofttranslator.com/languages?api-version=3.0', {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      console.error(`Tranzy: Failed to get supported languages / 获取支持语种列表失败: ${response.status} ${response.statusText}`);
      return {}; // 返回空对象
    }

    // 处理响应，只返回translation部分
    const result = await response.json();
    return result.translation;
  } catch (error) {
    console.error('Tranzy: Failed to get supported languages / 获取支持语种列表失败', error);
    throw error;
  }
}

/**
 * 获取浏览器语言对应的支持语言代码
 * @returns {Promise<string>} - 支持的语言代码，例如：'zh-Hans'、'en'等
 * 注意：返回的语言代码遵循BCP 47规范
 */
export async function getBrowserLang() {
  try {
    // 获取浏览器语言
    const browserLang = navigator.language;

    // 获取认证令牌
    const token = await getAuthToken();

    // 发送请求，翻译空字符串
    const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?to=${browserLang}&api-version=3.0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify([{Text: ''}])
    });

    if (!response.ok) {
      console.error(`Tranzy: Failed to get browser language / 获取浏览器语言失败: ${response.status} ${response.statusText}`);
      return navigator.language || 'en'; // 返回浏览器语言或默认英语
    }

    // 处理响应，获取支持的语言代码
    const result = await response.json();
    return result[0].translations[0].to;
  } catch (error) {
    console.error('Tranzy: Failed to get browser language / 获取浏览器语言失败', error);
    throw error;
  }
}

/**
 * Tranzy核心类
 * 提供页面翻译和DOM变化监听功能
 */
export class Translator {
  /**
   * 创建Translator实例
   * @param {Object} config - 配置选项
   * @param {string} config.toLang - 目标语言代码
   * @param {string} [config.fromLang=''] - 源语言代码
   * @param {string[]} [config.ignore=[]] - 忽略的选择器列表
   * @param {string[]} [config.force=[]] - 强制翻译的选择器列表
   * @param {string} [config.doneClass='tranzy-done'] - 已翻译元素的标记类
   * @param {string} [config.pendingClass='tranzy-pending'] - 正在翻译中的元素标记类
   * @param {Function} [config.translateFn=null] - 自定义翻译函数
   * @param {Object} [config.manualDict={}] - 手动翻译词典
   * @param {Function} [config.beforeTranslate=null] - 翻译开始前的钩子
   * @param {Function} [config.afterTranslate=null] - 翻译结束后的钩子
   */
  constructor(config = {}) {
    this.config = {...DEFAULT_CONFIG, ...config};

    // 合并 all 配置到当前语言的配置中，当前语言的优先级更高
    this.config.manualDict[this.config.toLang] = {
      ...this.config.manualDict.all || {}, ...this.config.manualDict[this.config.toLang] || {}
    };

    // 标准化manualDict配置
    const langDict = this.config.manualDict[this.config.toLang];
    for (const term of Object.keys(langDict)) {
      // 如果翻译值是字符串，转换为标准格式
      if (typeof langDict[term] === 'string') {
        langDict[term] = {
          to: langDict[term],
          standalone: true,
          case: true
        };
      }
    }

    this.observer = null;
    this.translationCache = new TranslationCache(this.config.toLang, this.config.fromLang);

    // 合并并去重忽略选择器
    this.config.ignore = [
      ...new Set([
        ...DEFAULT_IGNORE_SELECTORS,
        ...(this.config.ignore || [])
      ])
    ];

    // 确保强制翻译选择器是数组
    this.config.force = this.config.force || [];

    // 将数组选择器合并为字符串选择器，提高性能
    this.forceSelectorString = this.config.force.length ? this.config.force.join(',') : '';
    this.ignoreSelectorString = this.config.ignore.length ? this.config.ignore.join(',') : '';

    // 初始化状态
    this.isTranslating = false;         // 是否正在翻译
    this.pendingElements = new Set();   // 待翻译元素集合
    this.observerConfig = {             // 观察器配置
      childList: true,                  // 观察子节点变化
      subtree: true,                    // 观察后代节点变化
      characterData: true               // 观察文本内容变化
    };
  }

  /**
   * 创建节点过滤器
   * 用于TreeWalker，决定哪些节点需要被翻译
   * @returns {Object} - 节点过滤器对象
   */
  _createNodeFilter() {
    return {
      acceptNode: function (node) {
        // 跳过已翻译的元素，但允许检查其子元素
        if (node.classList.contains(this.config.doneClass)) {
          return NodeFilter.FILTER_SKIP;
        }

        // 优先级1：检查当前节点是否匹配force选择器
        if (this.forceSelectorString && node.matches(this.forceSelectorString)) {
          return NodeFilter.FILTER_ACCEPT;
        }

        // 优先级2：检查父节点是否匹配force选择器
        if (this.forceSelectorString) {
          let parent = node.parentNode;
          while (parent && parent !== document) {
            if (parent.matches(this.forceSelectorString)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            parent = parent.parentNode;
          }
        }

        // 优先级3：检查子节点是否匹配force选择器
        let hasForceChild = false;
        if (this.forceSelectorString && node.children.length > 0) {
          hasForceChild = node.querySelector(this.forceSelectorString);
        }

        // 优先级4：检查当前节点是否匹配ignore选择器
        if (this.ignoreSelectorString && node.matches(this.ignoreSelectorString)) {
          return hasForceChild ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_REJECT;
        }

        // 优先级5：检查父节点是否匹配ignore选择器
        if (this.ignoreSelectorString) {
          let parent = node.parentNode;
          while (parent && parent !== document) {
            if (parent.matches(this.ignoreSelectorString)) {
              return hasForceChild ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentNode;
          }
        }

        // 默认接受：如果以上所有条件都不满足，接受节点进行翻译
        return NodeFilter.FILTER_ACCEPT;
      }.bind(this)
    };
  }

  /**
   * 开始观察DOM变化
   * @param {string} [root='body'] - 观察的根元素选择器
   * @returns {Translator} - 当前实例，支持链式调用
   */
  startObserver(root = 'body') {
    // 如果源语言和目标语言相同，跳过翻译过程
    if (this.config.fromLang === this.config.toLang) {
      return this;
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      for (const mutation of mutations) {
        // 处理新增节点
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 使用TreeWalker遍历所有元素节点
              const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, this._createNodeFilter());

              // 收集所有符合条件的元素
              let currentNode = treeWalker.nextNode();
              while (currentNode) {
                this.pendingElements.add(currentNode);
                shouldTranslate = true;
                currentNode = treeWalker.nextNode();
              }
            }
          }
        }

        // 处理文本变化
        if (mutation.type === 'characterData') {
          const node = mutation.target.parentNode;
          if (node && node.nodeType === Node.ELEMENT_NODE) {
            // 检查节点是否正在翻译中
            if (node.classList.contains(this.config.pendingClass)) {
              continue;
            }

            // 检查所有父元素，如果有任何父元素被忽略且不在强制翻译列表中，则跳过
            let shouldSkip = false;
            let parent = node;

            while (parent) {
              if (this.ignoreSelectorString && parent.matches(this.ignoreSelectorString) && !(this.forceSelectorString && parent.matches(this.forceSelectorString))) {
                shouldSkip = true;
                break;
              }
              parent = parent.parentNode;
              if (!parent || parent === document) {
                break;
              }
            }

            if (!shouldSkip) {
              this.pendingElements.add(node);
              shouldTranslate = true;
            }
          }
        }
      }

      if (shouldTranslate) {
        // 直接翻译
        this._translatePending();
      }
    });

    this.observer.observe(document.querySelector(root), this.observerConfig);

    return this;
  }

  /**
   * 停止观察DOM变化
   * @returns {Translator} - 当前实例，支持链式调用
   */
  stopObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    return this;
  }

  /**
   * 翻译待处理元素
   * @param {boolean} [again=false] - 是否是重复翻译
   * @private
   */
  async _translatePending(again = false) {
    if (this.pendingElements.size === 0 || this.isTranslating) {
      return;
    }

    if (!again && typeof this.config.beforeTranslate === 'function') {
      this.config.beforeTranslate();
    }

    this.isTranslating = true;

    const elements = Array.from(this.pendingElements);
    this.pendingElements.clear();

    await this._translateElements(elements);

    this.isTranslating = false;

    // 检查是否有新的待处理元素
    if (this.pendingElements.size > 0) {
      this._translatePending(true);
    } else {
      if (typeof this.config.afterTranslate === 'function') {
        this.config.afterTranslate();
      }
    }
  }

  /**
   * 翻译整个页面
   * @param {string} [root='body'] - 翻译的根元素选择器
   * @returns {Promise<Translator>} - 当前实例，支持链式调用
   */
  async translatePage(root = 'body') {
    // 如果源语言和目标语言相同，跳过翻译过程
    if (this.isTranslating || this.config.fromLang === this.config.toLang) {
      return this;
    }

    this.isTranslating = true;

    // 临时停止观察器，避免翻译过程中触发更多的变化
    const wasObserving = !!this.observer;
    if (wasObserving) {
      this.stopObserver();
    }

    // 执行beforeTranslate钩子
    if (typeof this.config.beforeTranslate === 'function') {
      this.config.beforeTranslate();
    }

    try {
      // 使用TreeWalker获取所有需要翻译的元素
      const elements = [];
      const rootElement = document.querySelector(root);

      // 创建TreeWalker，只显示元素节点
      const treeWalker = document.createTreeWalker(rootElement, NodeFilter.SHOW_ELEMENT, this._createNodeFilter());

      // 收集所有符合条件的元素
      let node = treeWalker.nextNode();
      while (node) {
        elements.push(node);
        node = treeWalker.nextNode();
      }

      await this._translateElements(elements);
    } catch (error) {
      console.error('Tranzy: Page translation failed / 页面翻译失败', error);
    } finally {
      // 执行afterTranslate钩子
      if (typeof this.config.afterTranslate === 'function') {
        this.config.afterTranslate();
      }

      this.isTranslating = false;

      // 如果之前在观察，重新启动观察器
      if (wasObserving) {
        this.startObserver(root);
      }
    }

    return this;
  }

  /**
   * 翻译元素数组
   * @param {Element[]} elements - 需要翻译的元素数组
   * @private
   */
  async _translateElements(elements) {
    // 过滤出需要翻译的元素并保存文本
    const validElements = [];
    const elementsText = [];

    for (const el of elements) {
      const text = this._getElementText(el);
      if (text) {
        validElements.push(el);
        elementsText.push(text);
      }
    }

    if (validElements.length === 0) {
      return;
    }

    // 批量处理元素
    for (let i = 0; i < validElements.length; i += 100) {
      const batchElements = validElements.slice(i, i + 100);
      const batchTexts = elementsText.slice(i, i + 100);
      await this._translateElementBatch(batchElements, batchTexts);
    }
  }

  /**
   * 检查文本中是否包含术语并拆分
   * @param {string} text - 需要检查的文本
   * @returns {string[]} - 拆分后的文本数组
   * @private
   */
  _splitByTerms(text) {
    const toLangDict = this.config.manualDict[this.config.toLang];
    if (!toLangDict) {
      return [text];
    }

    // 按长度降序排序术语，优先匹配最长的术语
    const terms = Object.keys(toLangDict).sort((a, b) => b.length - a.length);

    // 先检查是否有完全匹配的术语
    for (const term of terms) {
      const translation = toLangDict[term];
      // 如果是独立匹配模式（默认为true）且文本完全等于术语
      if ((translation.standalone !== false) && (translation.case === false ? text.toLowerCase() === term.toLowerCase() : text === term)) {
        return [text];
      }
    }

    // 如果没有完全匹配，且文本中没有包含任何术语，直接返回原文本
    let containsAnyTerm = false;
    for (const term of terms) {
      const translation = toLangDict[term];
      if (translation.case === false ? text.toLowerCase().includes(term.toLowerCase()) : text.includes(term)) {
        containsAnyTerm = true;
        break;
      }
    }

    if (!containsAnyTerm) {
      return [text];
    }

    // 拆分文本
    const parts = [];
    let currentText = text;

    while (currentText.length > 0) {
      let foundTerm = false;
      for (const term of terms) {
        const translation = toLangDict[term];
        // 跳过需要独立匹配的术语
        if (translation.standalone !== false) {
          continue;
        }

        // 使用正则表达式匹配术语，根据case配置决定是否忽略大小写
        const flags = translation.case === false ? 'gi' : 'g';
        const termRegex = new RegExp(`\\b${term}\\b`, flags);
        const match = termRegex.exec(currentText);

        if (match) {
          const index = match.index;
          // 如果术语前面有文本，添加为一部分
          if (index > 0) {
            parts.push(currentText.substring(0, index));
          }
          // 添加术语
          parts.push(term);
          // 更新剩余文本
          currentText = currentText.substring(index + term.length);
          foundTerm = true;
          break;
        }
      }
      // 如果没有找到术语，将剩余文本作为一部分
      if (!foundTerm) {
        parts.push(currentText);
        break;
      }
    }

    return parts;
  }

  /**
   * 获取元素的直接文本节点
   * @param {Element} element - 需要获取文本节点的元素
   * @returns {Array<{node: Text, text: string, leadingSpaces: string, trailingSpaces: string}>} - 文本节点信息数组
   * @private
   */
  _getDirectTextNodes(element) {
    const textNodes = [];
    const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (node.parentNode !== element) {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let node = treeWalker.nextNode();
    while (node) {
      const text = node.textContent;
      const trimmed = text.trim();
      if (trimmed) {
        textNodes.push({
          node,
          text: trimmed,
          leadingSpaces: text.match(/^\s*/)[0],
          trailingSpaces: text.match(/\s*$/)[0]
        });
      }
      node = treeWalker.nextNode();
    }

    return textNodes;
  }

  /**
   * 批量翻译元素
   * @param {Element[]} elements - 需要翻译的元素数组
   * @param {string[]} textsArray - 对应的文本数组
   * @private
   */
  async _translateElementBatch(elements, textsArray) {
    // 收集需要翻译的文本和对应的元素
    const elementsWithText = [];
    const textsToTranslate = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const text = textsArray[i];

      // 将元素和文本添加到待处理列表
      elementsWithText.push(element);
      textsToTranslate.push(text);
      // 标记元素为正在翻译状态，防止重复处理
      element.classList.add(this.config.pendingClass);
    }

    if (textsToTranslate.length === 0) {
      return;
    }

    // 创建元素到其直接文本节点的映射表
    const nodeTextMap = new Map();

    // 预处理每个元素，收集其直接文本节点
    for (let i = 0; i < elementsWithText.length; i++) {
      const element = elementsWithText[i];

      // 如果元素包含子元素，需要单独处理每个文本节点
      if (element.childElementCount > 0) {
        // 收集元素的直接文本节点（不包含子元素的文本节点）
        const textNodes = this._getDirectTextNodes(element);

        // 如果元素包含多个文本节点，需要特殊处理
        if (textNodes.length > 1) {
          // 存储元素到其文本节点的映射关系，用于后续处理
          nodeTextMap.set(element, textNodes);

          // 为每个文本节点创建独立的翻译任务
          for (const nodeInfo of textNodes) {
            textsToTranslate.push(nodeInfo.text);
            elementsWithText.push({
              isTextNode: true,
              nodeInfo
            });
          }

          // 标记原始元素的翻译任务为跳过，因为已经为每个文本节点创建了独立任务
          textsToTranslate[i] = null;
        }
      }
    }

    // 过滤掉被标记为跳过的元素和文本
    const validElementTexts = elementsWithText.filter((_, i) => textsToTranslate[i] !== null);
    const validTexts = textsToTranslate.filter(text => text !== null);

    // 用术语替换处理每个文本
    const termProcessedTexts = [];
    const termMappings = new Map();

    for (const text of validTexts) {
      if (!text) {
        continue;
      }

      // 检查文本中是否包含术语
      const parts = this._splitByTerms(text);

      // 如果被拆分，需要单独处理每个部分
      if (parts.length > 1) {
        termMappings.set(text, parts);
        for (const part of parts) {
          termProcessedTexts.push(part)
        }
      } else {
        termProcessedTexts.push(text);
      }
    }

    // 去重以减少翻译请求
    const uniqueTextsToTranslate = [...new Set(termProcessedTexts)];

    // 检查手动词典和缓存
    const manualTranslations = {};
    const textsToFetch = [];

    for (const text of uniqueTextsToTranslate) {
      // 检查手动词典
      const toLangDict = this.config.manualDict[this.config.toLang];
      const translation = toLangDict && (toLangDict[text] || (toLangDict[text.toLowerCase()]?.case === false ? toLangDict[text.toLowerCase()] : null));

      if (translation) {
        manualTranslations[text] = translation.to;
      } else {
        // 检查缓存
        const cachedTranslation = await this.translationCache.get(text);
        if (cachedTranslation) {
          manualTranslations[text] = cachedTranslation;
        } else {
          textsToFetch.push(text);
        }
      }
    }

    // 翻译未缓存的文本
    if (textsToFetch.length > 0) {
      try {
        const apiResults = await this.config.translateFn(textsToFetch, this.config.toLang, this.config.fromLang);

        // 更新缓存
        await this.translationCache.setBatch(textsToFetch, apiResults);

        // 合并翻译结果
        textsToFetch.forEach((text, index) => {
          manualTranslations[text] = apiResults[index];
        });
      } catch (error) {
        console.error('Tranzy: Batch translation failed / 批量翻译失败', error);
        for (const text of textsToFetch) {
          manualTranslations[text] = text; // 错误时保持原文
        }
      }
    }

    // 构建最终翻译映射
    const finalTranslations = new Map();

    // 首先处理被术语拆分的文本
    for (const [originalText, parts] of termMappings.entries()) {
      const translatedParts = parts.map(part => manualTranslations[part] || part);
      finalTranslations.set(originalText, translatedParts.join(''));
    }

    // 然后处理未被拆分的文本
    for (const text of validTexts) {
      if (!text || termMappings.has(text)) {
        continue;
      }
      finalTranslations.set(text, manualTranslations[text] || text);
    }

    // 应用翻译结果
    validElementTexts.forEach((element, index) => {
      const originalText = validTexts[index];
      if (!originalText) {
        return;
      }

      const translatedText = finalTranslations.get(originalText);
      if (!translatedText) {
        return;
      }

      // 处理文本节点
      if (element.isTextNode) {
        const {
          node,
          leadingSpaces,
          trailingSpaces
        } = element.nodeInfo;
        node.textContent = leadingSpaces + translatedText + trailingSpaces;

        // 检查父元素是否已经处理完所有子节点
        const parentElement = node.parentNode;
        if (parentElement) {
          // 等待下一个微任务，确保DOM更新完成
          queueMicrotask(() => {
            parentElement.classList.remove(this.config.pendingClass);
            parentElement.classList.add(this.config.doneClass);
          });
        }
      } else {
        // 如果是简单元素(没有被分解为单独节点)，直接应用翻译
        if (!nodeTextMap.has(element)) {
          this._applyTranslation(element, originalText, translatedText);
          // 等待下一个微任务，确保DOM更新完成
          queueMicrotask(() => {
            element.classList.remove(this.config.pendingClass);
            element.classList.add(this.config.doneClass);
          });
        } else {
          // 已经单独处理了各个文本节点，只需标记为已翻译
          // 等待下一个微任务，确保DOM更新完成
          queueMicrotask(() => {
            element.classList.remove(this.config.pendingClass);
            element.classList.add(this.config.doneClass);
          });
        }
      }
    });
  }

  /**
   * 获取元素文本内容
   * @param {Element} element - 需要获取文本的元素
   * @returns {string|null} - 元素的文本内容，如果没有有效文本则返回null
   * @private
   */
  _getElementText(element) {
    // 使用TreeWalker遍历元素的所有文本节点
    let textContent = '';
    const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // 只获取直接的文本节点，跳过深层元素内的文本
        if (node.parentNode !== element) {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let node = treeWalker.nextNode();
    while (node) {
      const text = node.textContent.trim();
      if (text) {
        textContent += `${text} `;
      }
      node = treeWalker.nextNode();
    }

    textContent = textContent.trim();

    // 如果是空文本，直接返回null
    if (!textContent || /^\s*$/.test(textContent)) {
      return null;
    }

    // 过滤掉只包含数字、空格、回车、特殊字符的文本
    // 但保留包含中文、英文、数字的文本
    if (/^[\s\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/.test(textContent) && !/[a-zA-Z\u4e00-\u9fa5]/.test(textContent)) {
      return null;
    }

    return textContent;
  }

  /**
   * 应用翻译结果到元素
   * @param {Element} element - 需要应用翻译的元素
   * @param {string} originalText - 原始文本
   * @param {string} translatedText - 翻译后的文本
   * @private
   */
  _applyTranslation(element, originalText, translatedText) {
    if (!translatedText || originalText === translatedText) {
      return;
    }

    // 标记已翻译
    element.classList.add(this.config.doneClass);

    // 如果元素有子元素，只替换直接的文本节点
    if (element.childElementCount > 0) {
      // 1. 收集所有直接文本节点信息
      const textNodes = this._getDirectTextNodes(element);

      // 如果没有文本节点或只有一个文本节点，简单处理
      if (textNodes.length === 0) {
        return;
      }
      if (textNodes.length === 1) {
        const {
          node,
          leadingSpaces,
          trailingSpaces
        } = textNodes[0];
        node.textContent = leadingSpaces + translatedText + trailingSpaces;
        return;
      }

      // 注意：多文本节点的情况已在_translateElementBatch中处理
      // 这里作为备用方案，使用简单的按比例分配
      const totalTextLength = textNodes.reduce((sum, item) => sum + item.text.length, 0);
      let usedTranslationLength = 0;

      textNodes.forEach((item, index) => {
        const {
          node,
          text,
          leadingSpaces,
          trailingSpaces
        } = item;
        let nodeTranslation;

        if (index === textNodes.length - 1) {
          // 最后一个节点使用剩余的所有翻译文本
          nodeTranslation = translatedText.substring(usedTranslationLength);
        } else {
          // 计算当前节点文本在原始完整文本中的占比
          const ratio = text.length / totalTextLength;
          // 根据比例计算应该分配的翻译文本长度
          const translationLength = Math.round(translatedText.length * ratio);

          // 从当前位置提取对应长度的翻译文本
          nodeTranslation = translatedText.substring(usedTranslationLength, usedTranslationLength + translationLength);

          // 更新已使用的翻译文本长度
          usedTranslationLength += translationLength;
        }

        // 应用翻译结果到文本节点，保留原始空格
        node.textContent = leadingSpaces + nodeTranslation + trailingSpaces;
      });
    } else {
      // 如果没有子元素，保留原始文本中的空格
      const leadingSpaces = element.textContent.match(/^\s*/)[0];
      const trailingSpaces = element.textContent.match(/\s*$/)[0];
      element.textContent = leadingSpaces + translatedText + trailingSpaces;
    }
  }

  /**
   * 销毁实例，释放资源
   * @returns {Translator} - 当前实例，支持链式调用
   */
  destroy() {
    // 停止DOM观察器
    this.stopObserver();

    // 清空待处理元素
    this.pendingElements.clear();

    // 关闭数据库连接
    if (this.translationCache) {
      this.translationCache.destroy();
      this.translationCache = null;
    }

    // 重置状态
    this.isTranslating = false;

    return this;
  }
}

export default Translator; 