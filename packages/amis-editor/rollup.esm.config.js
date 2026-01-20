// rollup.esm.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import license from 'rollup-plugin-license';
import autoExternal from 'rollup-plugin-auto-external';
import {
  name,
  version,
  author,
  module
} from './package.json';
import path from 'path';
import fs from 'fs';
import svgr from '@svgr/rollup';
import i18nPlugin from 'plugin-react-i18n';
import postcss from 'rollup-plugin-postcss';

const i18nConfig = require('./i18nConfig');

const pkgs = [];
// 读取所有的node_modules目录，获取所有的包名
[
  path.join(__dirname, './node_modules'),
  path.join(__dirname, '../../node_modules')
].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(item => {
      if (item.startsWith('.')) {
        return;
      }

      if (item.startsWith('@')) {
        fs.readdirSync(path.join(dir, item)).forEach(subItem => {
          pkgs.push(item + '/' + subItem);
        });
      }

      return pkgs.push(item);
    });
  }
});

const external = id =>
  pkgs.some(pkg => id.startsWith(pkg) || ~id.indexOf(`node_modules/${pkg}`));

const input = './src/index.tsx';

function transpileDynamicImportForCJS(options) {
  return {
    name: 'transpile-dynamic-import-for-cjs',
    renderDynamicImport({format, targetModuleId}) {
      if (format !== 'cjs') {
        return null;
      }

      return {
        left: 'Promise.resolve().then(function() {return new Promise(function(fullfill) {require([',
        right:
          ', "tslib"], function(mod, tslib) {fullfill(tslib.__importStar(mod))})})})'
      };
    }
  };
}

function getPlugins(format = 'esm') {
  const typeScriptOptions = {
    typescript: require('typescript'),
    sourceMap: false,
    outputToFilesystem: true,
    ...(format === 'esm'
      ? {
          compilerOptions: {
            rootDir: './src',
            outDir: path.dirname(module)
          }
        }
      : {
          compilerOptions: {
            rootDir: './src',
            outDir: path.dirname(module)
          }
        })
  };

  return [
    i18nPlugin(i18nConfig),
    typescript(typeScriptOptions),
    svgr({
      svgProps: {
        className: 'icon'
      },
      prettier: false,
      dimensions: false
    }),
    postcss({
      extract: false, // 将 CSS 内联到 JS 中
      inject: true,
      minimize: true,
      sourceMap: false,
      extensions: ['.css', '.scss', '.sass']
    }),
    transpileDynamicImportForCJS(),
    autoExternal(),
    json(),
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      sourceMap: false
    }),
    license({
      banner: `
        ${name} v${version}
        build time: ${new Date().toISOString().split('T')[0]}
        Copyright 2018-${new Date().getFullYear()} ${author}
      `
    }),
    onRollupError(error => {
      console.warn(`[构建异常]${error}`);
      // 构建异常时，删除 tsconfig.tsbuildinfo
      fs.unlink(path.resolve(__dirname, 'tsconfig.tsbuildinfo'), () => {
        console.info(
          '[构建异常]已自动删除tsconfig.tsbuildinfo，请重试构建命令。'
        );
      });
    })
  ];
}

function onRollupError(callback = () => {}) {
  return {
    name: 'onerror',
    buildEnd(err) {
      if (err) {
        callback(err);
      }
    }
  };
}

export default {
  input,
  output: [
    {
      dir: path.dirname(module),
      format: 'esm',
      exports: 'named',
      preserveModulesRoot: './src',
      preserveModules: true // Keep directory structure and files
    }
  ],
  external,
  plugins: getPlugins('esm')
};