import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties']
        }
      }
    }),
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
      outDir: 'dist',
      tsconfigPath: 'tsconfig.json',
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'index.umd.ts'),
      name: 'LowCodeEditor',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [
        /^react(\/*.*)?$/,
        /^react-dom(\/*.*)?$/,
        'amis',
        'amis-ui',
        'amis-core',
        'amis-formula',
        'amis-editor',
        'amis-editor-core',
        'lodash',
        'moment',
        'echarts',
        'qs',
        'axios',
        'classnames',
        'lodash-es',
        'mobx',
        'mobx-state-tree',
        'mobx-react-lite',
        'history',
        'react-router',
        'react-router-dom',
        'react-helmet',
        'react-dropzone',
        'react-json-view',
        'react-sortablejs',
        'react-cropper',
        'react-transition-group',
        'react-onclickoutside',
        'hoist-non-react-statics',
        'keymaster',
        'dom-helpers',
        'paper',
        'kind-of',
        'is-plain-object',
        'isarray',
        'deepmerge'
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'amis': 'amis',
          'amis-ui': 'amis-ui',
          'amis-core': 'amis-core',
          'amis-formula': 'amis-formula',
          'amis-editor': 'amis-editor',
          'amis-editor-core': 'amis-editor-core',
          'lodash': '_',
          'moment': 'moment',
          'echarts': 'echarts',
          'qs': 'qs',
          'axios': 'axios',
          'classnames': 'classNames',
          'lodash-es': '_',
          'mobx': 'mobx',
          'mobx-state-tree': 'mobxStateTree',
          'mobx-react-lite': 'mobxReactLite',
          'history': 'History',
          'react-router': 'ReactRouter',
          'react-router-dom': 'ReactRouterDOM',
          'react-helmet': 'ReactHelmet',
          'react-dropzone': 'ReactDropzone',
          'react-json-view': 'ReactJsonView',
          'react-sortablejs': 'ReactSortablejs',
          'react-cropper': 'ReactCropper',
          'react-transition-group': 'ReactTransitionGroup',
          'react-onclickoutside': 'ReactOnClickOutside',
          'hoist-non-react-statics': 'hoistNonReactStatics',
          'keymaster': 'keymaster',
          'dom-helpers': 'domHelpers',
          'paper': 'paper',
          'kind-of': 'kindOf',
          'is-plain-object': 'isPlainObject',
          'isarray': 'isArray',
          'deepmerge': 'deepmerge'
        },
        name: 'LowCodeEditor'
      }
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: [
      {
        find: 'moment/locale',
        replacement: 'moment/dist/locale'
      },
      {
        find: 'amis-formula/lib',
        replacement: resolve(__dirname, './packages/amis-formula/src')
      },
      {
        find: 'amis-formula',
        replacement: resolve(__dirname, './packages/amis-formula/src')
      },
      {
        find: 'amis-ui/lib',
        replacement: resolve(__dirname, './packages/amis-ui/src')
      },
      {
        find: 'amis-ui',
        replacement: resolve(__dirname, './packages/amis-ui/src')
      },
      {
        find: 'amis-core',
        replacement: resolve(__dirname, './packages/amis-core/src')
      },
      {
        find: 'amis/lib',
        replacement: resolve(__dirname, './packages/amis/src')
      },
      {
        find: 'amis/schema.json',
        replacement: resolve(__dirname, './packages/amis/schema.json')
      },
      {
        find: 'amis',
        replacement: resolve(__dirname, './packages/amis/src')
      },
      {
        find: 'amis-editor',
        replacement: resolve(__dirname, './packages/amis-editor/src')
      },
      {
        find: 'amis-editor-core',
        replacement: resolve(__dirname, './packages/amis-editor-core/src')
      },
      // {
      //   find: 'office-viewer',
      //   replacement: resolve(__dirname, './packages/office-viewer/src')
      // },
      {
        find: 'amis-theme-editor-helper',
        replacement: resolve(__dirname, './packages/amis-theme-editor-helper/src')
      }
    ]
  }
})