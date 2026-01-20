import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './examples/App';
// import '../../examples/static/iconfont.css';
// import '../../node_modules/@fortawesome/fontawesome-free/css/all.css';
// import '../../node_modules/@fortawesome/fontawesome-free/css/v4-shims.css';
// import './scss/themes/cxd.scss';
// import './scss/helper.scss';

import * as monaco from 'monaco-editor';
// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';
// import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
export function bootstrap(mountTo, initalState) {
  // window.MonacoEnvironment = {
  // getWorker(_, label) {
  //   if (label === 'json') {
  //     return new jsonWorker();
  //   }
  //   if (label === 'css' || label === 'scss' || label === 'less') {
  //     return new cssWorker();
  //   }
  //   if (label === 'html' || label === 'handlebars' || label === 'razor') {
  //     return new htmlWorker();
  //   }
  //   if (label === 'typescript' || label === 'javascript') {
  //     return new tsWorker();
  //   }
  //   return new editorWorker();
  // }
  // getWorker(_, label) {
  //   // 获取原始 worker
  //   let originalWorker;
  //   if (label === 'json') {
  //     originalWorker = new jsonWorker();
  //   } else if (label === 'css' || label === 'scss' || label === 'less') {
  //     originalWorker = new cssWorker();
  //   } else if (
  //     label === 'html' ||
  //     label === 'handlebars' ||
  //     label === 'razor'
  //   ) {
  //     originalWorker = new htmlWorker();
  //   } else if (label === 'typescript' || label === 'javascript') {
  //     originalWorker = new tsWorker();
  //   } else {
  //     originalWorker = new editorWorker();
  //   }
  //   // 获取原始 worker 的 URL
  //   const originalWorkerUrl = URL.createObjectURL(originalWorker);
  //   console.log('xuzg originalWorkerUrl', originalWorkerUrl, label);
  //   // 创建一个包装后的 Worker，添加错误处理逻辑
  //   const workerCode = `
  //     // 禁用 loadForeignModule 以避免 "Unexpected usage" 错误
  //     self.loadForeignModule = function() {
  //       return Promise.resolve({});
  //     };
  //     // 加载原始 worker 脚本
  //     self.importScripts('${originalWorkerUrl}');
  //   `;
  //   return new Worker(
  //     URL.createObjectURL(new Blob([workerCode], {type: 'text/javascript'}))
  //   );
  // }
  // };

  const root = createRoot(mountTo);
  root.render(React.createElement(App));
}
