/**
 * @file 用来渲染 Markdown
 */
import React from 'react';
import {Renderer, RendererProps} from 'amis-core';
import {BaseSchema} from '../Schema';
import {isPureVariable, resolveVariableAndFilter} from 'amis-core';
import {LazyComponent} from 'amis-core';
import {getPropValue} from 'amis-core';
import {isApiOutdated, isEffectiveApi} from 'amis-core';

import {streamEventTarget} from 'amis-core';

/**
 * Markdown 渲染
 * 文档：https://aisuda.bce.baidu.com/amis/zh-CN/components/markdown
 */
export interface MarkdownSchema extends BaseSchema {
  /**
   * markdown 渲染
   */
  type: 'markdown';

  /**
   * markdown 内容
   */
  value?: string;

  /**
   * 样式类
   */
  className?: string;

  /**
   * 名字映射
   */
  name?: string;

  /**
   * 是否使用工具
   */
  ifUseTool: boolean;

  /**
   * 选择的工具值（对象）
   */
  toolSelect?: {
    label: string; // 工具名称
    name: string; // 工具name
    id: string; // 父级id
    type: string;
  };
}

function loadComponent(): Promise<any> {
  return import('amis-ui/lib/components/Markdown').then(item => item.default);
}

export interface MarkdownProps
  extends RendererProps,
    Omit<MarkdownSchema, 'type' | 'className'> {}

interface MarkdownState {
  content: string;
}

export class Markdown extends React.Component<MarkdownProps, MarkdownState> {
  constructor(props: MarkdownProps) {
    super(props);
    const {name, data, src} = this.props;
    if (src) {
      this.state = {content: ''};
      this.updateContent();
    } else {
      const content =
        getPropValue(this.props) ||
        (name && isPureVariable(name)
          ? resolveVariableAndFilter(name, data, '| raw')
          : null);
      this.state = {content};
    }
  }

  componentDidMount() {
    const {ifUseTool, toolSelect} = this.props;
    // const isPreview = localStorage.getItem('editting_preview') === '1';
    const isPreview = window?.amisData.editting_preview === '1';
    if (ifUseTool && toolSelect?.name && isPreview) {
      // 在需要的地方使用以下方法，获取实时数据 (唯一标识用工具的name字段拼接)
      streamEventTarget.addEventListener(
        `chunkReceived_${toolSelect?.name}`,
        ({detail}) => {
          const result = detail;
          this.setState({content: result.data});
        }
      );
    }
  }
  componentDidUpdate(prevProps: MarkdownProps) {
    const props = this.props;
    // 使用工具输出结果的话，就无需处理数据，否则走以下逻辑
    if (!props.ifUseTool) {
      if (props.src) {
        if (
          isApiOutdated(prevProps.src, props.src, prevProps.data, props.data)
        ) {
          this.updateContent();
        }
      } else {
        this.updateContent();
      }
    }
  }

  async updateContent() {
    const {name, data, src, env} = this.props;
    if (src && isEffectiveApi(src, data)) {
      const ret = await env.fetcher(src, data);
      if (typeof ret === 'string') {
        this.setState({content: ret});
      } else if (typeof ret === 'object' && ret.data) {
        this.setState({content: ret.data});
      } else {
        console.error('markdown response error', ret);
      }
    } else {
      const content =
        getPropValue(this.props) ||
        (name && isPureVariable(name)
          ? resolveVariableAndFilter(name, data, '| raw')
          : null);
      if (content !== this.state.content) {
        this.setState({content});
      }
    }
  }

  render() {
    const {className, style, classnames: cx, options} = this.props;

    return (
      <div className={cx('Markdown', className)} style={style}>
        <LazyComponent
          getComponent={loadComponent}
          content={this.state.content || ''}
          options={options}
        />
      </div>
    );
  }
}

@Renderer({
  type: 'markdown'
})
export class MarkdownRenderer extends Markdown {}
