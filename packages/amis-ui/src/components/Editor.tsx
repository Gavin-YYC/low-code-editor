/**
 * @file Editor
 * @description
 * @author fex
 */

import React from 'react';
import cx from 'classnames';
import {ClassNamesFn, themeable, ThemeProps} from 'amis-core';
import {autobind} from 'amis-core';
import {Icon} from './icons';
import {LocaleProps, localeable} from 'amis-core';

// 用于发布 sdk 版本的时候替换，因为不确定 sdk 版本怎么部署，而 worker 地址路径不可知。
// 所以会被 fis3 替换成取相对的代码。
function filterUrl(url: string) {
  return url;
}

/**
 * Monaco 环境配置函数
 * 注意：推荐使用jsIgnores参数解决问题: {jsIgnores: [/monaco-editor/]}
 * 此函数保留核心逻辑，避免控制台报错
 */
function setupMonacoEnvironmentForWujie() {
  // 如果已经设置过，不再重复设置
  if ((window as any).__monaco_environment_patched__) {
    return;
  }

  // 标记已设置
  (window as any).__monaco_environment_patched__ = true;

  // 保存原始配置
  const originalEnvironment = (window as any).MonacoEnvironment || {};

  /**
   * 将任何路径转换为绝对URL
   */
  const toAbsoluteUrl = (url: string) => {
    if (!url) return url;

    // 已经是绝对URL，直接返回
    if (url.startsWith('http') || url.startsWith('blob:')) {
      return url;
    }

    // 使用子应用的location
    const location = (window as any).$wujie?.location || window.location;
    const protocol = location.protocol;
    const host = location.host;

    // 以斜杠开头的路径
    if (url.startsWith('/')) {
      return `${protocol}//${host}${url}`;
    }

    // 相对路径
    const basePath = location.pathname.substring(
      0,
      location.pathname.lastIndexOf('/') + 1
    );
    return `${protocol}//${host}${basePath}${url}`;
  };

  // 设置新的环境配置
  (window as any).MonacoEnvironment = {
    ...originalEnvironment,
    getWorkerUrl: function (moduleId: string, label: string) {
      let workerUrl = '';

      // 1. 尝试从原始环境获取URL
      if (
        originalEnvironment &&
        typeof originalEnvironment.getWorkerUrl === 'function'
      ) {
        try {
          workerUrl = originalEnvironment.getWorkerUrl(moduleId, label);
        } catch (e) {
          console.warn('Original getWorkerUrl failed:', e);
        }
      }

      // 2. 如果没有获取到URL，生成默认URL
      if (!workerUrl) {
        // 选择对应的worker文件
        let workerFile = 'editor.worker.bundle.js';
        if (label === 'json') {
          workerFile = 'json.worker.bundle.js';
        } else if (label === 'css') {
          workerFile = 'css.worker.bundle.js';
        } else if (label === 'html') {
          workerFile = 'html.worker.bundle.js';
        } else if (label === 'typescript' || label === 'javascript') {
          workerFile = 'ts.worker.bundle.js';
        }

        workerUrl = `/monacoeditorwork/${workerFile}`;
      }

      // 3. 确保URL是绝对路径
      const absoluteUrl = toAbsoluteUrl(workerUrl);

      // 4. 在微前端环境下，使用Blob URL包装
      if ((window as any).__POWERED_BY_WUJIE__) {
        return URL.createObjectURL(
          new Blob(
            [
              `
              // 注意：推荐使用jsIgnores参数解决问题: {jsIgnores: [/monaco-editor/]}
              self.loadForeignModule = function() { return Promise.resolve({}); };
              try { 
                importScripts("${absoluteUrl}"); 
              } catch (error) { 
                console.error("Failed to load monaco worker:", error, "${absoluteUrl}");
              }
              `
            ],
            {type: 'text/javascript'}
          )
        );
      }

      return absoluteUrl;
    }
  };
}

// 立即调用此函数
setupMonacoEnvironmentForWujie();

export function monacoFactory(
  containerElement: HTMLElement,
  monaco: any,
  options: any
) {
  return monaco.editor.create(containerElement, {
    'autoIndent': true,
    'formatOnType': true,
    'formatOnPaste': true,
    'selectOnLineNumbers': true,
    'scrollBeyondLastLine': false,
    'folding': true,
    'minimap': {
      enabled: false
    },
    'scrollbar': {
      alwaysConsumeMouseWheel: false
    },
    'bracketPairColorization.enabled': true,
    ...options
  });
}

export interface EditorBaseProps {
  value?: string;
  defaultValue?: string;
  width?: number | string;
  height?: number | string;
  onChange?: (value: string, event: any) => void;
  disabled?: boolean;
  language?: string;
  editorTheme?: string;
  allowFullscreen?: boolean;
  options: {
    [propName: string]: any;
  };
  context?: any;
  isDiffEditor?: boolean;
  placeholder?: string;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  editorDidMount?: (editor: any, monaco: any) => void;
  editorWillMount?: (monaco: any) => void;
  editorWillUnmount?: (editor: any, monaco: any) => void;
  editorFactory?: (conatainer: HTMLElement, monaco: any, options: any) => any;
}

export interface EditorProps extends EditorBaseProps, LocaleProps, ThemeProps {}

export interface EditorState {
  isFullscreen?: boolean;
  innerWidth?: any;
  innerHeight?: any;
}

export class Editor extends React.Component<EditorProps, EditorState> {
  static defaultProps = {
    language: 'javascript',
    editorTheme: 'vs',
    width: '100%',
    height: '100%',
    allowFullscreen: false,
    options: {}
  };

  state = {
    isFullscreen: false,
    innerWidth: 'auto',
    innerHeight: 'auto'
  };
  editor: any;
  container: any;
  currentValue: any;
  preventTriggerChangeEvent: boolean;
  disposes: Array<() => void> = [];
  constructor(props: EditorProps) {
    super(props);

    this.wrapperRef = this.wrapperRef.bind(this);
    this.getDom = this.getDom.bind(this);
    this.currentValue = props.value;
  }

  componentDidUpdate(prevProps: EditorProps) {
    if (
      this.props.value !== this.currentValue &&
      this.editor &&
      !this.props.isDiffEditor
    ) {
      let value = String(this.props.value);

      if (this.props.language === 'json') {
        try {
          value = JSON.stringify(JSON.parse(value), null, 2);
        } catch (e) {}
      }

      this.preventTriggerChangeEvent = true;
      const eidtor = this.editor.getModifiedEditor
        ? this.editor.getModifiedEditor()
        : this.editor;
      const model = eidtor.getModel();
      eidtor.pushUndoStop();
      // pushEditOperations says it expects a cursorComputer, but doesn't seem to need one.
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: value
          }
        ]
      );
      eidtor.pushUndoStop();
      this.preventTriggerChangeEvent = false;
    }

    if (
      this.props.options.readOnly !== prevProps.options.readOnly &&
      this.editor
    ) {
      this.editor.updateOptions?.(this.props.options);
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      const context = this.props.context || window;
      const monaco = context.monaco || (window as any).monaco;
      const editorWillUnmount = this.props.editorWillUnmount;
      editorWillUnmount && editorWillUnmount(this.editor, monaco);
    }
    this.disposes.forEach(dispose => dispose());
    this.disposes = [];
    this.editor?.dispose();
  }

  wrapperRef(ref: any) {
    this.container = ref;
    if (ref) {
      this.loadMonaco();
    } else {
      try {
        this.disposes.forEach(dispose => dispose());
        this.disposes = [];
        if (this.editor) {
          this.editor.getModel().dispose();
          this.editor.dispose();
        }
        this.editor = null;
      } catch (e) {
        // ignore
      }
    }
  }

  getDom() {
    return this.container;
  }

  loadMonaco() {
    // 由于 require.config({'vs/nls': { availableLanguages: { '*': 'xxxx' }}}) 只能在初始化之前设置有用，所以这里只能用全局变量的方式来设置。
    // 另外此方式只是针对 jssdk 和平台有效，对于其他方式还需要再想想。
    (window as any).__amis_monaco_editor_locale = this.props.locale;
    import('monaco-editor').then(monaco => this.initMonaco(monaco));
  }

  initMonaco(monaco: any) {
    let value =
      this.props.value !== null ? this.props.value : this.props.defaultValue;
    const {language, editorTheme, options, editorFactory} = this.props;
    const containerElement = this.container;
    if (!containerElement) {
      return;
    }

    // Before initializing monaco editor
    this.editorWillMount(monaco);

    if (this.props.language === 'json') {
      try {
        value = JSON.stringify(
          typeof value === 'string' ? JSON.parse(value) : value,
          null,
          2
        );
      } catch (e) {
        // ignore
      }
    }

    const factory = editorFactory || monacoFactory;
    this.editor = factory(containerElement, monaco, {
      ...options,
      readOnly: this.props.disabled,
      automaticLayout: true,
      value,
      language,
      editorTheme,
      theme: editorTheme
    });

    // json 默认开启验证。
    monaco.languages.json?.jsonDefaults.setDiagnosticsOptions({
      enableSchemaRequest: true,
      validate: true,
      allowComments: true,
      ...monaco.languages.json?.jsonDefaults.diagnosticsOptions
    });

    // After initializing monaco editor
    this.editorDidMount(this.editor, monaco);
  }

  editorWillMount(monaco: any) {
    const {editorWillMount} = this.props;
    editorWillMount && editorWillMount(monaco);
  }

  editorDidMount(editor: any, monaco: any) {
    const {editorDidMount, onChange, onFocus, onBlur} = this.props;
    editorDidMount && editorDidMount(editor, monaco);
    editor.onDidChangeModelContent &&
      this.disposes.push(
        editor.onDidChangeModelContent((event: any) => {
          const value = editor.getValue();
          // Always refer to the latest value
          this.currentValue = value;

          // Only invoking when user input changed
          if (!this.preventTriggerChangeEvent && onChange) {
            onChange(value, event);
          }
        }).dispose
      );
    onFocus &&
      editor.onDidFocusEditorWidget &&
      this.disposes.push(editor.onDidFocusEditorWidget(onFocus).dispose);
    onBlur &&
      editor.onDidBlurEditorWidget &&
      this.disposes.push(editor.onDidBlurEditorWidget(onBlur).dispose);

    const {width = 'auto', height = 'auto'} =
      this?.editor?._configuration?._elementSizeObserver ?? {};

    this.setState({innerHeight: height, innerWidth: width});
  }

  @autobind
  handleFullscreenModeChange() {
    this.setState(
      {isFullscreen: !this.state.isFullscreen},
      () =>
        // 退出全屏模式后需要resize一下editor的宽高，避免溢出父元素
        !this.state.isFullscreen &&
        this.editor.layout({
          width: this.state.innerWidth,
          height: this.state.innerHeight
        })
    );
  }

  render() {
    const {
      className,
      width,
      height,
      translate: __,
      placeholder,
      classnames: cx,
      value
    } = this.props;
    let style = {...(this.props.style || {})};

    style.width = width;
    style.height = height;

    return (
      <div
        className={cx(
          `MonacoEditor`,
          {'is-fullscreen': this.state.isFullscreen},
          className
        )}
        style={style}
        ref={this.wrapperRef}
      >
        {this.editor && placeholder && !value ? (
          <span className={cx('MonacoEditor-placeholder')}>{placeholder}</span>
        ) : null}
        {this.editor && this.props.allowFullscreen ? (
          <div className={cx(`MonacoEditor-header`)}>
            <a
              className={cx('Modal-close', `MonacoEditor-fullscreen`)}
              data-tooltip={
                this.state.isFullscreen
                  ? __('Editor.exitFullscreen')
                  : __('Editor.fullscreen')
              }
              data-position="left"
              onClick={this.handleFullscreenModeChange}
            >
              <Icon
                icon={this.state.isFullscreen ? 'compress-alt' : 'expand-alt'}
                className="icon"
              />
            </a>
          </div>
        ) : null}
      </div>
    );
  }
}

export default themeable(localeable(Editor, ['getDom']), ['getDom']);
