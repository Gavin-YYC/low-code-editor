import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
/**
 * @name SvgIconsPlugin
 * @description 加载SVG文件，自动引入
 */
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons';
import path from 'path';

function resolve(dir) {
  return path.join(__dirname, dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), 'examples/icons')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: true
    }),

    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties']
        }
      }
    }),
    svgr({
      exportAsDefault: true,
      svgrOptions: {
        svgProps: {
          className: 'icon'
        },
        prettier: false,
        dimensions: false
      }
    }),
    monacoEditorPlugin({})
  ],

  // css
  css: {
    preprocessorOptions: {
      scss: {
        modifyVars: {
          // 此处也可设置直角、边框色、字体大小等
          // 'primaryColor': '#1677ff',
          // 'link-color': '#1677ff',
        },
        javascriptEnabled: true,
        additionalData: `@import "./examples/_corpus-i18n.scss";`
      }
    }
  }
});
