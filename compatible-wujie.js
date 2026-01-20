const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取项目根目录
const ROOT_DIR = process.cwd();

// 查找monaco-editor安装路径
function findMonacoEditorPath() {
  try {
    // 优先查找本地路径
    const possiblePaths = [
      path.join(ROOT_DIR, 'node_modules/monaco-editor/esm/vs/base/browser/dom.js'),
      path.join(ROOT_DIR, 'packages/amis-ui/node_modules/monaco-editor/esm/vs/base/browser/dom.js')
    ];

    // 使用find命令查找所有可能的路径
    const findCommand = 'find ' + ROOT_DIR + ' -path "*/monaco-editor/esm/vs/base/browser/dom.js" | sort';
    const foundPaths = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

    // 合并所有可能的路径
    const allPaths = [...possiblePaths, ...foundPaths];

    // 找到第一个存在的路径
    for (const p of allPaths) {
      if (fs.existsSync(p)) {
        return path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(p)))));
      }
    }

    throw new Error('Monaco Editor not found');
  } catch (error) {
    console.error('Error finding Monaco Editor:', error.message);
    return null;
  }
}

const monacoPath = findMonacoEditorPath();
if (!monacoPath) {
  console.error('Failed to find Monaco Editor installation path. Skipping compatibility fixes.');
  process.exit(1);
}

// 修复dom.js中的getShadowRoot函数
const domPath = path.join(monacoPath, 'esm/vs/base/browser/dom.js');
console.log(`Patching ${domPath}`);

try {
  let dom = fs.readFileSync(domPath, 'utf-8');

  // 检查是否已经修改过
  if (dom.includes('if(window.__POWERED_BY_WUJIE__)')) {
    console.log('dom.js already patched, skipping...');
  } else {
    dom = dom.replace(
      `function getShadowRoot(domNode) {`,
      `function getShadowRoot(domNode) {
    if(window.__POWERED_BY_WUJIE__) {
      return window.$wujie.shadowRoot;
    }`
    );

    fs.writeFileSync(domPath, dom);
    console.log('dom.js patched successfully!');
  }
} catch (error) {
  console.error('Error patching dom.js:', error.message);
}

// 修复mouseTarget.js中的字体样式获取
const mouseTargetPath = path.join(monacoPath, 'esm/vs/editor/browser/controller/mouseTarget.js');
console.log(`Patching ${mouseTargetPath}`);

try {
  let mouseTarget = fs.readFileSync(mouseTargetPath, 'utf-8');

  // 检查是否已经修改过
  if (mouseTarget.includes('getComputedStyle(el, null).fontSize +')) {
    console.log('mouseTarget.js already patched, skipping...');
  } else {
    mouseTarget = mouseTarget.replace(
      `const font = window.getComputedStyle(el, null).getPropertyValue('font');`,
      `const font = window.getComputedStyle(el, null).fontSize + ' ' + window.getComputedStyle(el, null).fontFamily;`
    );

    fs.writeFileSync(mouseTargetPath, mouseTarget);
    console.log('mouseTarget.js patched successfully!');
  }
} catch (error) {
  console.error('Error patching mouseTarget.js:', error.message);
}

console.log('Monaco Editor compatibility fixes for wujie completed.');