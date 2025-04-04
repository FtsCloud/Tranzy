!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).Tranzy={})}(this,(function(t){"use strict";
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
   */const e=["style","script","noscript","kbd","code","pre","input","textarea",'[contenteditable="true"]',".tranzy-ignore"],n={toLang:navigator.language||"",fromLang:"",ignore:[],force:[],doneClass:"tranzy-done",pendingClass:"tranzy-pending",translateFn:r,manualDict:{},beforeTranslate:null,afterTranslate:null};class s{constructor(t,e=""){this.dbName=`tranzy-${t}${e?"-"+e:""}`,this.storeName="translations",this.db=null,this.initPromise=this._initDatabase()}_generateHash(t){let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e*=16777619;return e.toString(36)}async _initDatabase(){return new Promise(((t,e)=>{const n=indexedDB.open(this.dbName,1);n.onupgradeneeded=t=>{const e=t.target.result;e.objectStoreNames.contains(this.storeName)||e.createObjectStore(this.storeName,{keyPath:"id"})},n.onsuccess=e=>{this.db=e.target.result,t()},n.onerror=t=>{e(t.target.error)}}))}async get(t){await this.initPromise;const e=this._generateHash(t);return new Promise((t=>{if(!this.db)return void t(null);const n=this.db.transaction(this.storeName,"readonly").objectStore(this.storeName).get(e);n.onsuccess=e=>{t(e.target.result?.value||null)},n.onerror=()=>{t(null)}}))}async set(t,e){await this.initPromise;const n=this._generateHash(t);return new Promise((t=>{if(!this.db)return void t();const s=this.db.transaction(this.storeName,"readwrite").objectStore(this.storeName).put({id:n,value:e});s.onsuccess=()=>{t()},s.onerror=()=>{t()}}))}async setBatch(t,e){await this.initPromise,await Promise.all(t.map(((t,n)=>this.set(t,e[n]))))}destroy(){this.db&&(this.db.close(),this.db=null)}}function o(){try{sessionStorage.removeItem("tranzy_auth_token")}catch(t){}}async function i(){const t=Date.now(),{token:e,timestamp:n}=function(){try{const t=sessionStorage.getItem("tranzy_auth_token");if(t){const{token:e,timestamp:n}=JSON.parse(t),s=Date.now();if(e&&s-n<6e5)return{token:e,timestamp:n};o()}}catch(t){o()}return{token:null,timestamp:0}}();if(e&&t-n<6e5)return e;try{const e=await fetch("https://edge.microsoft.com/translate/auth",{method:"GET",headers:{"Content-Type":"application/json"}});if(!e.ok)return null;const n=await e.text();return function(t,e){try{sessionStorage.setItem("tranzy_auth_token",JSON.stringify({token:t,timestamp:e}))}catch(t){}}(n,t),n}catch(t){throw o(),t}}async function r(t,e=navigator.language,n=""){try{const s=t.filter((t=>t?.trim()));if(0===s.length)return[];const o=await i(),r=`https://api.cognitive.microsofttranslator.com/translate?${n?`from=${n}&`:""}to=${e}&api-version=3.0`,a=s.map((t=>({Text:t}))),c=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify(a)});if(!c.ok)return t;return(await c.json()).map((t=>t.translations[0].text))}catch(t){throw t}}class a{constructor(t={}){this.config={...n,...t},this.config.manualDict[this.config.toLang]={...this.config.manualDict.all||{},...this.config.manualDict[this.config.toLang]||{}};const o=this.config.manualDict[this.config.toLang];for(const t of Object.keys(o))"string"==typeof o[t]&&(o[t]={to:o[t],standalone:!0,case:!0});this.observer=null,this.translationCache=new s(this.config.toLang,this.config.fromLang),this.config.ignore=[...new Set([...e,...this.config.ignore||[]])],this.config.force=this.config.force||[],this.forceSelectorString=this.config.force.length?this.config.force.join(","):"",this.ignoreSelectorString=this.config.ignore.length?this.config.ignore.join(","):"",this.isTranslating=!1,this.pendingElements=new Set,this.observerConfig={childList:!0,subtree:!0,characterData:!0}}_createNodeFilter(){return{acceptNode:function(t){if(t.classList.contains(this.config.doneClass))return NodeFilter.FILTER_SKIP;if(this.forceSelectorString&&t.matches(this.forceSelectorString))return NodeFilter.FILTER_ACCEPT;if(this.forceSelectorString){let e=t.parentNode;for(;e&&e!==document;){if(e.matches(this.forceSelectorString))return NodeFilter.FILTER_ACCEPT;e=e.parentNode}}let e=!1;if(this.forceSelectorString&&t.children.length>0&&(e=t.querySelector(this.forceSelectorString)),this.ignoreSelectorString&&t.matches(this.ignoreSelectorString))return e?NodeFilter.FILTER_SKIP:NodeFilter.FILTER_REJECT;if(this.ignoreSelectorString){let n=t.parentNode;for(;n&&n!==document;){if(n.matches(this.ignoreSelectorString))return e?NodeFilter.FILTER_SKIP:NodeFilter.FILTER_REJECT;n=n.parentNode}}return NodeFilter.FILTER_ACCEPT}.bind(this)}}startObserver(t="body"){return this.config.fromLang===this.config.toLang||(this.observer&&this.observer.disconnect(),this.observer=new MutationObserver((t=>{let e=!1;for(const n of t){if("childList"===n.type&&n.addedNodes.length>0)for(const t of n.addedNodes)if(t.nodeType===Node.ELEMENT_NODE){const n=document.createTreeWalker(t,NodeFilter.SHOW_ELEMENT,this._createNodeFilter());let s=n.nextNode();for(;s;)this.pendingElements.add(s),e=!0,s=n.nextNode()}if("characterData"===n.type){const t=n.target.parentNode;if(t&&t.nodeType===Node.ELEMENT_NODE){if(t.classList.contains(this.config.pendingClass))continue;let n=!1,s=t;for(;s;){if(this.ignoreSelectorString&&s.matches(this.ignoreSelectorString)&&(!this.forceSelectorString||!s.matches(this.forceSelectorString))){n=!0;break}if(s=s.parentNode,!s||s===document)break}n||(this.pendingElements.add(t),e=!0)}}}e&&this._translatePending()})),this.observer.observe(document.querySelector(t),this.observerConfig)),this}stopObserver(){return this.observer&&(this.observer.disconnect(),this.observer=null),this}async _translatePending(t=!1){if(0===this.pendingElements.size||this.isTranslating)return;t||"function"!=typeof this.config.beforeTranslate||this.config.beforeTranslate(),this.isTranslating=!0;const e=Array.from(this.pendingElements);this.pendingElements.clear(),await this._translateElements(e),this.isTranslating=!1,this.pendingElements.size>0?this._translatePending(!0):"function"==typeof this.config.afterTranslate&&this.config.afterTranslate()}async translatePage(t="body"){if(this.isTranslating||this.config.fromLang===this.config.toLang)return this;this.isTranslating=!0;const e=!!this.observer;e&&this.stopObserver(),"function"==typeof this.config.beforeTranslate&&this.config.beforeTranslate();try{const e=[],n=document.querySelector(t),s=document.createTreeWalker(n,NodeFilter.SHOW_ELEMENT,this._createNodeFilter());let o=s.nextNode();for(;o;)e.push(o),o=s.nextNode();await this._translateElements(e)}catch(t){}finally{"function"==typeof this.config.afterTranslate&&this.config.afterTranslate(),this.isTranslating=!1,e&&this.startObserver(t)}return this}async _translateElements(t){const e=[],n=[];for(const s of t){const t=this._getElementText(s);t&&(e.push(s),n.push(t))}if(0!==e.length)for(let t=0;t<e.length;t+=100){const s=e.slice(t,t+100),o=n.slice(t,t+100);await this._translateElementBatch(s,o)}}_splitByTerms(t){const e=this.config.manualDict[this.config.toLang];if(!e)return[t];const n=Object.keys(e).sort(((t,e)=>e.length-t.length));for(const s of n){const n=e[s];if(!1!==n.standalone&&(!1===n.case?t.toLowerCase()===s.toLowerCase():t===s))return[t]}let s=!1;for(const o of n){if(!1===e[o].case?t.toLowerCase().includes(o.toLowerCase()):t.includes(o)){s=!0;break}}if(!s)return[t];const o=[];let i=t;for(;i.length>0;){let t=!1;for(const s of n){const n=e[s];if(!1!==n.standalone)continue;const r=!1===n.case?"gi":"g",a=new RegExp(`\\b${s}\\b`,r).exec(i);if(a){const e=a.index;e>0&&o.push(i.substring(0,e)),o.push(s),i=i.substring(e+s.length),t=!0;break}}if(!t){o.push(i);break}}return o}_getDirectTextNodes(t){const e=[],n=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode:e=>e.parentNode!==t?NodeFilter.FILTER_SKIP:NodeFilter.FILTER_ACCEPT});let s=n.nextNode();for(;s;){const t=s.textContent,o=t.trim();o&&e.push({node:s,text:o,leadingSpaces:t.match(/^\s*/)[0],trailingSpaces:t.match(/\s*$/)[0]}),s=n.nextNode()}return e}async _translateElementBatch(t,e){const n=[],s=[];for(let o=0;o<t.length;o++){const i=t[o],r=e[o];n.push(i),s.push(r),i.classList.add(this.config.pendingClass)}if(0===s.length)return;const o=new Map;for(let t=0;t<n.length;t++){const e=n[t];if(e.childElementCount>0){const i=this._getDirectTextNodes(e);if(i.length>1){o.set(e,i);for(const t of i)s.push(t.text),n.push({isTextNode:!0,nodeInfo:t});s[t]=null}}}const i=n.filter(((t,e)=>null!==s[e])),r=s.filter((t=>null!==t)),a=[],c=new Map;for(const t of r){if(!t)continue;const e=this._splitByTerms(t);if(e.length>1){c.set(t,e);for(const t of e)a.push(t)}else a.push(t)}const l=[...new Set(a)],h={},f=[];for(const t of l){const e=this.config.manualDict[this.config.toLang],n=e&&(e[t]||(!1===e[t.toLowerCase()]?.case?e[t.toLowerCase()]:null));if(n)h[t]=n.to;else{const e=await this.translationCache.get(t);e?h[t]=e:f.push(t)}}if(f.length>0)try{const t=await this.config.translateFn(f,this.config.toLang,this.config.fromLang);await this.translationCache.setBatch(f,t),f.forEach(((e,n)=>{h[e]=t[n]}))}catch(t){for(const t of f)h[t]=t}const g=new Map;for(const[t,e]of c.entries()){const n=e.map((t=>h[t]||t));g.set(t,n.join(""))}for(const t of r)t&&!c.has(t)&&g.set(t,h[t]||t);i.forEach(((t,e)=>{const n=r[e];if(!n)return;const s=g.get(n);if(s)if(t.isTextNode){const{node:e,leadingSpaces:n,trailingSpaces:o}=t.nodeInfo;e.textContent=n+s+o;const i=e.parentNode;i&&queueMicrotask((()=>{i.classList.remove(this.config.pendingClass),i.classList.add(this.config.doneClass)}))}else o.has(t)||this._applyTranslation(t,n,s),queueMicrotask((()=>{t.classList.remove(this.config.pendingClass),t.classList.add(this.config.doneClass)}))}))}_getElementText(t){let e="";const n=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode:e=>e.parentNode!==t?NodeFilter.FILTER_SKIP:NodeFilter.FILTER_ACCEPT});let s=n.nextNode();for(;s;){const t=s.textContent.trim();t&&(e+=`${t} `),s=n.nextNode()}return e=e.trim(),!e||/^\s*$/.test(e)||/^[\s\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/.test(e)&&!/[a-zA-Z\u4e00-\u9fa5]/.test(e)?null:e}_applyTranslation(t,e,n){if(n&&e!==n)if(t.classList.add(this.config.doneClass),t.childElementCount>0){const e=this._getDirectTextNodes(t);if(0===e.length)return;if(1===e.length){const{node:t,leadingSpaces:s,trailingSpaces:o}=e[0];return void(t.textContent=s+n+o)}const s=e.reduce(((t,e)=>t+e.text.length),0);let o=0;e.forEach(((t,i)=>{const{node:r,text:a,leadingSpaces:c,trailingSpaces:l}=t;let h;if(i===e.length-1)h=n.substring(o);else{const t=a.length/s,e=Math.round(n.length*t);h=n.substring(o,o+e),o+=e}r.textContent=c+h+l}))}else{const e=t.textContent.match(/^\s*/)[0],s=t.textContent.match(/\s*$/)[0];t.textContent=e+n+s}}destroy(){return this.stopObserver(),this.pendingElements.clear(),this.translationCache&&(this.translationCache.destroy(),this.translationCache=null),this.isTranslating=!1,this}}t.Translator=a,t.default=a,t.detectLang=async function(t){try{const e=(Array.isArray(t)?t:[t]).filter((t=>t?.trim()));if(0===e.length)return[];const n=await i(),s=e.map((t=>({Text:t}))),o=await fetch("https://api.cognitive.microsofttranslator.com/detect?api-version=3.0",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify(s)});return o.ok?await o.json():[]}catch(t){throw t}},t.getBrowserLang=async function(){try{const t=navigator.language,e=await i(),n=await fetch(`https://api.cognitive.microsofttranslator.com/translate?to=${t}&api-version=3.0`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify([{Text:""}])});if(!n.ok)return navigator.language||"en";return(await n.json())[0].translations[0].to}catch(t){throw t}},t.getSupportedLangs=async function(t=""){try{const e={"Content-Type":"application/json"};t&&(e["Accept-Language"]=t);const n=await fetch("https://api.cognitive.microsofttranslator.com/languages?api-version=3.0",{method:"GET",headers:e});if(!n.ok)return{};return(await n.json()).translation}catch(t){throw t}},t.translateText=r,Object.defineProperty(t,"__esModule",{value:!0})}));
//# sourceMappingURL=tranzy.umd.js.map
