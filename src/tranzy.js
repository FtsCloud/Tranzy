/**
 * Tranzy - 网页自动翻译插件
 * 支持自动检测DOM更新并翻译新增元素
 * 使用微软翻译API实现多语言翻译
 * 同时支持ESM和浏览器直接使用
 *
 * @author Tranzy
 * @license MIT
 */

// 默认忽略的选择器列表，这些元素及其内容不会被翻译
const DEFAULT_IGNORE_SELECTORS = [
  'style',            // 样式标签
  'script',           // 脚本标签
  'noscript',         // 无脚本标签
  'code',             // 代码标签
  'pre',              // 预格式化文本标签
  'input',            // 输入框
  'textarea',         // 文本域
  '[contenteditable="true"]', // 可编辑元素
  '.tranzy-ignore'    // 自定义忽略类
];

// 默认配置选项
const DEFAULT_CONFIG = {
  toLang: navigator.language || '',    // 目标语言，默认从浏览器语言设置获取，如果没有则使用中文
  fromLang: '',                        // 源语言，如：'en'
  root: 'body',                        // 要翻译的根元素
  ignore: [],                          // 自定义忽略选择器列表
  force: [],                           // 强制翻译选择器列表
  doneClass: 'tranzy-done',            // 已翻译元素的标记类
  pendingClass: 'tranzy-pending',      // 正在翻译中的元素标记类
  auto: false,                         // 是否自动监听DOM变化
  batch: 100,                          // 批量翻译时的批次大小
  translator: null,                    // 自定义翻译器实例
  manualDict: {},                      // 手动翻译词典
  hooks: {                             // 生命周期钩子函数
    before: null,                      // 翻译开始前的钩子
    after: null,                       // 翻译结束后的钩子
    beforeElement: null,               // 翻译单个元素前的钩子
    afterElement: null,                // 翻译单个元素后的钩子
  }
};

// 辅助函数：深度合并对象，支持数组去重
function mergeDeep(...objects) {
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        // 数组类型进行合并并去重
        prev[key] = Array.from(new Set([...pVal, ...oVal]));
      } else if (isObject(pVal) && isObject(oVal)) {
        // 对象类型进行递归合并
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        // 其他类型直接覆盖
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

// 辅助函数：检查值是否为对象（非null且非数组）
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// IndexedDB缓存管理器：用于存储翻译结果，提高性能
class TranslationCache {
  constructor() {
    this.dbName = 'tranzy-cache';      // 数据库名称
    this.storeName = 'translations';    // 存储对象名称
    this.db = null;                     // 数据库实例
    this.initPromise = this._initDatabase(); // 初始化Promise
  }

  // 生成字符串哈希值，用于缓存键
  _generateHash(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash *= 16777619;
    }
    return hash.toString(36);  // 使用base36编码，生成更短的哈希值
  }

  // 初始化IndexedDB数据库
  async _initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('Tranzy: 初始化缓存数据库失败', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // 获取缓存的翻译结果
  async get(text, toLang, fromLang = '') {
    await this.initPromise;
    const id = this._generateHash(`${text}|${toLang}|${fromLang}`);

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

  // 设置翻译结果到缓存
  async set(text, translation, toLang, fromLang = '') {
    await this.initPromise;
    const id = this._generateHash(`${text}|${toLang}|${fromLang}`);

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

  // 批量获取缓存的翻译结果
  async getBatch(texts, toLang, fromLang = '') {
    await this.initPromise;
    const results = Array(texts.length).fill(null);
    const remainingIndices = [];

    await Promise.all(texts.map(async (text, index) => {
      const cachedTranslation = await this.get(text, toLang, fromLang);
      if (cachedTranslation) {
        results[index] = cachedTranslation;
      } else {
        remainingIndices.push(index);
      }
    }));

    return {
      results,
      remainingIndices
    };
  }

  // 批量设置翻译结果到缓存
  async setBatch(texts, translations, toLang, fromLang = '') {
    await this.initPromise;
    await Promise.all(texts.map((text, index) => {
      return this.set(text, translations[index], toLang, fromLang);
    }));
  }
}

// 默认微软翻译API实现
class MicrosoftTranslator {
  constructor(fromLang = '') {
    this.fromLang = fromLang;
    this.tokenExpireMinutes = 10; // token过期时间（分钟）
    this._loadTokenFromSession();
  }

  // 从sessionStorage加载token
  _loadTokenFromSession() {
    try {
      const tokenData = sessionStorage.getItem('tranzy_auth_token');
      if (tokenData) {
        const { token, timestamp } = JSON.parse(tokenData);
        const now = Date.now();
        // 如果token未过期，则使用缓存的token
        if (token && (now - timestamp) < this.tokenExpireMinutes * 60 * 1000) {
          this.authToken = token;
          this.tokenTimestamp = timestamp;
        } else {
          // token已过期，清除缓存
          this._clearTokenFromSession();
        }
      }
    } catch (error) {
      console.error('Tranzy: 从session加载token失败', error);
      this._clearTokenFromSession();
    }
  }

  // 保存token到sessionStorage
  _saveTokenToSession(token, timestamp) {
    try {
      sessionStorage.setItem('tranzy_auth_token', JSON.stringify({ token, timestamp }));
    } catch (error) {
      console.error('Tranzy: 保存token到session失败', error);
    }
  }

  // 清除sessionStorage中的token
  _clearTokenFromSession() {
    try {
      sessionStorage.removeItem('tranzy_auth_token');
      this.authToken = null;
      this.tokenTimestamp = 0;
    } catch (error) {
      console.error('Tranzy: 清除session中的token失败', error);
    }
  }

  // 获取微软翻译API的认证token
  async getAuthToken() {
    const now = Date.now();

    // 如果token获取时间小于10分钟，则直接返回
    if (this.authToken && (now - this.tokenTimestamp) < this.tokenExpireMinutes * 60 * 1000) {
      return this.authToken;
    }

    try {
      const response = await fetch('https://edge.microsoft.com/translate/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`获取微软翻译授权失败: ${response.status} ${response.statusText}`);
      }

      const token = await response.text();
      this.tokenTimestamp = now;
      this.authToken = token;
      
      // 保存token到session
      this._saveTokenToSession(token, now);
      
      return token;
    } catch (error) {
      console.error('Tranzy: 获取微软翻译授权失败', error);
      this._clearTokenFromSession();
      throw error;
    }
  }

  // 调用微软翻译API进行翻译
  async translate(texts, toLang) {
    try {
      // 过滤掉空文本和null值
      const filteredTexts = texts.filter(text => text && text.trim());

      // 如果没有有效文本需要翻译，直接返回空数组
      if (filteredTexts.length === 0) {
        return [];
      }

      // 获取认证令牌
      const token = await this.getAuthToken();

      // 构建URL，只在设置了fromLang时添加from参数
      const url = `https://api.cognitive.microsofttranslator.com/translate?${this.fromLang?`from=${this.fromLang}&`:''}to=${toLang}&api-version=3.0`
        

      // 构建请求数据
      const data = filteredTexts.map(text => ({ Text: text }));

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
        throw new Error(`翻译请求失败: ${response.status} ${response.statusText}`);
      }

      // 处理响应
      const result = await response.json();
      return result.map(item => item.translations[0].text);
    } catch (error) {
      console.error('Tranzy: 翻译请求失败', error);
      throw error;
    }
  }
}

// Tranzy核心类
class Tranzy {
  constructor(config = {}) {
    // 合并默认配置与用户配置
    this.config = mergeDeep({}, DEFAULT_CONFIG, config);

    // 标准化manualDict配置
    if (this.config.manualDict) {
      Object.keys(this.config.manualDict).forEach(lang => {
        const langDict = this.config.manualDict[lang];
        Object.keys(langDict).forEach(term => {
          // 如果翻译值是字符串，转换为标准格式
          if (typeof langDict[term] === 'string') {
            langDict[term] = {
              to: langDict[term],
              standalone: true,
              case: true
            };
          }
        });
      });
    }

    // 初始化缓存
    this.cache = new TranslationCache();

    // 初始化翻译器，传入用户配置的fromLang
    this.translator = this.config.translator || new MicrosoftTranslator(this.config.fromLang);

    // 初始化状态
    this.isTranslating = false;         // 是否正在翻译
    this.pendingElements = new Set();   // 待翻译元素集合
    this.observer = null;               // DOM观察器实例
    this.observerConfig = {             // 观察器配置
      childList: true,                  // 观察子节点变化
      subtree: true                     // 观察后代节点变化
    };
    
    // 初始化选择器字符串
    this.forceSelectorString = '';      // 强制翻译选择器字符串
    this.ignoreSelectorString = '';     // 忽略选择器字符串
  }

  // 创建节点过滤器
  _createNodeFilter() {
    return {
      acceptNode: function (node) {
        // 跳过已翻译的元素
        if (node.classList.contains(this.config.doneClass)) {
          return NodeFilter.FILTER_SKIP; // 改为SKIP，允许检查子元素
        }

        // 第一步：检查当前节点是否匹配force选择器
        if (this.forceSelectorString && node.matches(this.forceSelectorString)) {
          return NodeFilter.FILTER_ACCEPT;
        }
          
        // 第二步：检查父节点是否匹配force选择器
        if (this.forceSelectorString) {
          let parent = node.parentNode;
          while (parent && parent !== document) {
            if (parent.matches(this.forceSelectorString)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            parent = parent.parentNode;
          }
        }
        
        // 第三步：检查子节点是否有任何一个匹配force选择器
        // 如果有，我们不应该直接接受当前节点，而是标记为SKIP
        // 这样TreeWalker会继续检查子节点，那些匹配force的子节点会被单独接受
        if (this.forceSelectorString && node.children.length > 0) {
          // 使用querySelector检查是否有子节点匹配force选择器
          const hasForceChild = node.querySelector(this.forceSelectorString);
          if (hasForceChild) {
            // 跳过当前节点，让TreeWalker继续检查其子节点
            return NodeFilter.FILTER_SKIP;
          }
        }
        
        // 第四步：检查当前节点是否匹配ignore选择器
        if (this.ignoreSelectorString && node.matches(this.ignoreSelectorString)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // 第五步：检查父节点是否匹配ignore选择器
        if (this.ignoreSelectorString) {
          let parent = node.parentNode;
          while (parent && parent !== document) {
            if (parent.matches(this.ignoreSelectorString)) {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentNode;
          }
        }

        // 默认接受节点进行翻译
        return NodeFilter.FILTER_ACCEPT;
      }.bind(this)
    };
  }

  // 翻译页面并初始化插件
  translate() {
    // 合并并去重忽略选择器
    this.config.ignore = [...new Set([
      ...DEFAULT_IGNORE_SELECTORS,
      ...(this.config.ignore || [])
    ])];

    // 确保强制翻译选择器是数组
    this.config.force = this.config.force || [];
    
    // 将数组选择器合并为字符串选择器，提高性能
    this.forceSelectorString = this.config.force.length ? this.config.force.join(',') : '';
    this.ignoreSelectorString = this.config.ignore.length ? this.config.ignore.join(',') : '';

    // 先进行一次初始翻译
    this.translatePage();

    // 如果配置了自动监听，则开始监听DOM变化
    if (this.config.auto) {
      this.startObserver();
    }

    return this;
  }

  // 开始观察DOM变化
  startObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      for (const mutation of mutations) {
        // 处理新增节点
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 使用TreeWalker遍历所有元素节点
              const treeWalker = document.createTreeWalker(
                node,
                NodeFilter.SHOW_ELEMENT,
                this._createNodeFilter()
              );

              // 添加根节点
              this.pendingElements.add(node);
              shouldTranslate = true;

              // 添加所有子元素节点
              let currentNode;
              while (currentNode = treeWalker.nextNode()) {
                this.pendingElements.add(currentNode);
              }
            }
          });
        }

        // 处理文本变化
        if (mutation.type === 'characterData') {
          const node = mutation.target.parentNode;
          if (node && node.nodeType === Node.ELEMENT_NODE) {
            // 检查所有父元素，如果有任何父元素被忽略且不在强制翻译列表中，则跳过
            let shouldSkip = false;
            let parent = node;

            while (parent) {
              if (this.ignoreSelectorString && parent.matches(this.ignoreSelectorString) &&
                !(this.forceSelectorString && parent.matches(this.forceSelectorString))) {
                shouldSkip = true;
                break;
              }
              parent = parent.parentNode;
              if (!parent || parent === document) break;
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

    this.observer.observe(document.body, this.observerConfig);

    return this;
  }

  // 停止观察DOM变化
  stopObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    return this;
  }

  // 翻译待处理元素
  async _translatePending() {
    if (this.pendingElements.size === 0 || this.isTranslating) {
      return;
    }

    this.isTranslating = true;

    const elements = Array.from(this.pendingElements);
    this.pendingElements.clear();

    await this._translateElements(elements);

    this.isTranslating = false;

    // 检查是否有新的待处理元素
    if (this.pendingElements.size > 0) {
      this._translatePending();
    }
  }

  // 翻译整个页面
  async translatePage() {
    if (this.isTranslating) {
      return;
    }

    this.isTranslating = true;

    // 临时停止观察器，避免翻译过程中触发更多的变化
    const wasObserving = !!this.observer;
    if (wasObserving) {
      this.stopObserver();
    }

    // 执行beforeTranslate钩子
    if (typeof this.config.hooks.before === 'function') {
      await this.config.hooks.before();
    }

    try {
      // 使用TreeWalker获取所有需要翻译的元素
      const elements = [];
      const rootElement = document.querySelector(this.config.root);

      // 创建TreeWalker，只显示元素节点
      const treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_ELEMENT,
        this._createNodeFilter()
      );

      // 收集所有符合条件的元素
      let node;
      while (node = treeWalker.nextNode()) {
        elements.push(node);
      }

      await this._translateElements(elements);
    } catch (error) {
      console.error('Tranzy: 页面翻译失败', error);
    } finally {
      // 执行afterTranslate钩子
      if (typeof this.config.hooks.after === 'function') {
        await this.config.hooks.after();
      }

      this.isTranslating = false;

      // 如果之前在观察，重新启动观察器
      if (wasObserving) {
        this.startObserver();
      }
    }

    return this;
  }

  // 翻译元素数组
  async _translateElements(elements) {
    // 过滤出需要翻译的元素并保存文本
    const validElements = [];
    const elementsText = [];
    
    for (const el of elements) {
      const text = this._getElementText(el);
      if (text) { // _getElementText 已经包含了对文本的验证
        validElements.push(el);
        elementsText.push(text);
      }
    }

    if (validElements.length === 0) {
      return;
    }

    // 批量处理元素
    const batchSize = this.config.batch;
    for (let i = 0; i < validElements.length; i += batchSize) {
      const batchElements = validElements.slice(i, i + batchSize);
      const batchTexts = elementsText.slice(i, i + batchSize);
      await this._translateElementBatch(batchElements, batchTexts);
    }
  }

  // 检查文本中是否包含术语并拆分
  _splitByTerms(text) {
    const toLangDict = this.config.manualDict[this.config.toLang];
    if (!toLangDict) return [text];

    // 按长度降序排序术语，优先匹配最长的术语
    const terms = Object.keys(toLangDict).sort((a, b) => b.length - a.length);
    
    // 先检查是否有完全匹配的术语
    for (const term of terms) {
      const translation = toLangDict[term];
      // 如果是独立匹配模式（默认为true）且文本完全等于术语
      if ((translation.standalone !== false) && 
          (translation.case === false ? text.toLowerCase() === term.toLowerCase() : text === term)) {
        return [text];
      }
    }

    // 如果没有完全匹配，且文本中没有包含任何术语，直接返回原文本
    let containsAnyTerm = false;
    for (const term of terms) {
      const translation = toLangDict[term];
      if (translation.case === false ? 
          text.toLowerCase().includes(term.toLowerCase()) : 
          text.includes(term)) {
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
    let lastIndex = 0;

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

  // 批量翻译元素
  async _translateElementBatch(elements, textsArray) {
    // 收集需要翻译的文本
    const elementsWithText = [];
    let textsToTranslate = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const text = textsArray[i];
      
      // 执行beforeElementTranslate钩子
      if (typeof this.config.hooks.beforeElement === 'function') {
        const shouldContinue = await this.config.hooks.beforeElement(element);
        if (shouldContinue === false) {
          continue;
        }
      }

      // text已经通过_getElementText过滤，无需额外检查
      elementsWithText.push(element);
      textsToTranslate.push(text);
      // 添加正在翻译的class
      element.classList.add(this.config.pendingClass);
    }

    if (textsToTranslate.length === 0) {
      return;
    }

    // 创建翻译结果映射表
    const translationMap = {};
    const nodeTextMap = new Map(); // 存储元素到其直接文本节点的映射

    // 预处理每个元素，收集直接文本节点
    for (let i = 0; i < elementsWithText.length; i++) {
      const element = elementsWithText[i];
      
      // 如果元素有子元素，需要单独处理每个文本节点
      if (element.childElementCount > 0) {
        // 收集元素的直接文本节点
        const textNodes = [];
        const treeWalker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              if (node.parentNode !== element) {
                return NodeFilter.FILTER_SKIP;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );
        
        let node;
        while (node = treeWalker.nextNode()) {
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
        }
        
        // 如果有多个文本节点，存储映射关系
        if (textNodes.length > 1) {
          nodeTextMap.set(element, textNodes);
          
          // 为每个文本节点单独添加翻译任务
          textNodes.forEach(nodeInfo => {
            textsToTranslate.push(nodeInfo.text);
            elementsWithText.push({
              isTextNode: true,
              nodeInfo
            });
          });
          
          // 移除原始元素的翻译任务
          textsToTranslate[i] = null; // 标记为跳过
        }
      }
    }

    // 移除被标记为跳过的元素和文本
    const validElementTexts = elementsWithText.filter((_, i) => textsToTranslate[i] !== null);
    const validTexts = textsToTranslate.filter(text => text !== null);

    // 用术语替换处理每个文本
    const termProcessedTexts = [];
    const termMappings = new Map();
    
    for (const text of validTexts) {
      if (!text) continue;
      
      // 检查文本中是否包含术语
      const parts = this._splitByTerms(text);
      
      // 如果被拆分，需要单独处理每个部分
      if (parts.length > 1) {
        termMappings.set(text, parts);
        parts.forEach(part => termProcessedTexts.push(part));
      } else {
        termProcessedTexts.push(text);
      }
    }
    
    // 去重以减少翻译请求
    const uniqueTextsToTranslate = [...new Set(termProcessedTexts)];
    
    // 检查手动词典和缓存
    const manualTranslations = {};
    const textsToBeCached = [];
    const textsToFetch = [];
    
    for (const text of uniqueTextsToTranslate) {
      // 检查手动词典
      const toLangDict = this.config.manualDict[this.config.toLang];
      const translation = toLangDict && (
        toLangDict[text] || 
        (toLangDict[text.toLowerCase()]?.case === false ? toLangDict[text.toLowerCase()] : null)
      );
      
      if (translation) {
        manualTranslations[text] = translation.to;
      } else {
        // 检查缓存
        const cachedTranslation = await this.cache.get(text, this.config.toLang, this.config.fromLang);
        if (cachedTranslation) {
          manualTranslations[text] = cachedTranslation;
        } else {
          textsToBeCached.push(text);
          textsToFetch.push(text);
        }
      }
    }
    
    // 翻译未缓存的文本
    if (textsToFetch.length > 0) {
      try {
        const apiResults = await this.translator.translate(textsToFetch, this.config.toLang);
        
        // 更新缓存
        await this.cache.setBatch(textsToFetch, apiResults, this.config.toLang, this.config.fromLang);
        
        // 合并翻译结果
        textsToFetch.forEach((text, index) => {
          manualTranslations[text] = apiResults[index];
        });
      } catch (error) {
        console.error('Tranzy: 批量翻译失败', error);
        textsToFetch.forEach(text => {
          manualTranslations[text] = text; // 错误时保持原文
        });
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
      if (!text || termMappings.has(text)) continue;
      finalTranslations.set(text, manualTranslations[text] || text);
    }
    
    // 应用翻译结果
    validElementTexts.forEach((element, index) => {
      const originalText = validTexts[index];
      if (!originalText) return;
      
      const translatedText = finalTranslations.get(originalText);
      if (!translatedText) return;
      
      // 处理文本节点
      if (element.isTextNode) {
        const { node, leadingSpaces, trailingSpaces } = element.nodeInfo;
        node.textContent = leadingSpaces + translatedText + trailingSpaces;
        
        // 检查父元素是否已经处理完所有子节点
        const parentElement = node.parentNode;
        if (parentElement) {
          // 标记父元素已翻译
          parentElement.classList.remove(this.config.pendingClass);
          parentElement.classList.add(this.config.doneClass);
          
          // 调用钩子
          if (typeof this.config.hooks.afterElement === 'function') {
            this.config.hooks.afterElement(parentElement, originalText, translatedText);
          }
        }
      } else {
        // 处理常规元素
        element.classList.remove(this.config.pendingClass);
        
        // 如果是简单元素(没有被分解为单独节点)，直接应用翻译
        if (!nodeTextMap.has(element)) {
          this._applyTranslation(element, originalText, translatedText);
        } else {
          // 已经单独处理了各个文本节点，只需标记为已翻译
          element.classList.add(this.config.doneClass);
        }
        
        // 调用钩子
        if (typeof this.config.hooks.afterElement === 'function') {
          this.config.hooks.afterElement(element, originalText, translatedText);
        }
      }
    });
  }

  // 获取元素文本内容
  _getElementText(element) {
    // 使用TreeWalker遍历元素的所有文本节点
    let textContent = '';
    const treeWalker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          // 只获取直接的文本节点，跳过深层元素内的文本
          if (node.parentNode !== element) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = treeWalker.nextNode()) {
      const text = node.textContent.trim();
      if (text) {
        textContent += text + ' ';
      }
    }

    textContent = textContent.trim();
    
    // 如果是空文本，直接返回null
    if (!textContent || /^\s*$/.test(textContent)) {
      return null;
    }
    
    // 过滤掉只包含数字、空格、回车、特殊字符的文本
    // 但保留包含中文、英文、数字的文本
    if (/^[\s\d\p{P}\p{S}]+$/u.test(textContent) && !/[\p{L}\u4e00-\u9fa5]/.test(textContent)) {
      return null;
    }
    
    return textContent;
  }

  // 应用翻译
  _applyTranslation(element, originalText, translatedText) {
    if (!translatedText || originalText === translatedText) {
      return;
    }
    
    // 标记已翻译
    element.classList.add(this.config.doneClass);
    
    // 如果元素有子元素，只替换直接的文本节点
    if (element.childElementCount > 0) {
      // 1. 收集所有直接文本节点信息
      const textNodes = [];
      const treeWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (node.parentNode !== element) {
              return NodeFilter.FILTER_SKIP;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      
      let node;
      while (node = treeWalker.nextNode()) {
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
      }
      
      // 如果没有文本节点或只有一个文本节点，简单处理
      if (textNodes.length === 0) {
        return;
      } else if (textNodes.length === 1) {
        const { node, leadingSpaces, trailingSpaces } = textNodes[0];
        node.textContent = leadingSpaces + translatedText + trailingSpaces;
        return;
      }
      
      // 注意：多文本节点的情况已在_translateElementBatch中处理
      // 这里作为备用方案，使用简单的按比例分配
      const totalTextLength = textNodes.reduce((sum, item) => sum + item.text.length, 0);
      let usedTranslationLength = 0;
      
      textNodes.forEach((item, index) => {
        const { node, text, leadingSpaces, trailingSpaces } = item;
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
          nodeTranslation = translatedText.substring(
            usedTranslationLength, 
            usedTranslationLength + translationLength
          );
          
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

  // 销毁实例，释放资源
  destroy() {
    // 停止DOM观察器
    this.stopObserver();
    
    // 清空待处理元素
    this.pendingElements.clear();
    
    // 关闭数据库连接
    if (this.cache && this.cache.db) {
      this.cache.db.close();
      this.cache.db = null;
    }
    
    // 重置状态
    this.isTranslating = false;
    
    return this;
  }
}

export default Tranzy; 