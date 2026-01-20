import React from 'react';
import {registerActionPanel} from '../../actionsPanelManager';
import {getArgsWrapper} from '../../helper';
import {defaultValue, getSchemaTpl} from 'amis-editor-core';

// #YueZhan：跳转链接事件面板
registerActionPanel('url', {
  label: '跳转链接',
  tag: '页面',
  description: '跳转至指定链接的页面',
  innerArgs: ['url', 'isInnerLink', 'innerLink', 'params', 'blank'],
  descDetail: (info: any, context: any, props: any) => {
    const pages = window?.amisData.page_options || [];
    let data = '';
    if (info?.args?.isInnerLink) {
      const urlValue = info?.args?.innerLink;
      const urlLabel = pages.find(page => page.value === urlValue);
      data = urlLabel ? urlLabel.label : urlValue;
    } else {
      data = info?.args?.url;
    }
    info?.args?.isInnerLink ? info?.args?.innerLink : info?.args?.url;
    return (
      <div className="action-desc">
        跳转至
        <span className="variable-left">{data || '-'}</span>
      </div>
    );
  },
  schema: () => {
    const pages = window?.amisData.page_options || [];
    const data = getArgsWrapper([
      {
        type: 'wrapper',
        body: [
          // #YueZhan: 配置跳转链接
          {
            type: 'switch',
            name: 'isInnerLink',
            label: '内部跳转',
            onText: '是',
            offText: '否',
            mode: 'horizontal',
            value: true
          },
          {
            type: 'select',
            name: 'innerLink',
            required: true,
            label: '内部链接',
            menuTpl: '${label}',
            options: pages,
            // source: '${pages}',
            valueField: 'value',
            labelField: 'label',
            selectFirst: true,
            size: 'lg',
            mode: 'horizontal',
            initAutoFill: true,
            visibleOn: '${isInnerLink === true}'
          },
          getSchemaTpl('textareaFormulaControl', {
            name: 'url',
            label: '页面地址',
            variables: '${variables}',
            mode: 'horizontal',
            size: 'lg',
            required: true,
            visibleOn: '${isInnerLink === false}'
          }),
          {
            type: 'combo',
            name: 'params',
            label: '页面参数',
            multiple: true,
            mode: 'horizontal',
            size: 'lg',
            formClassName: 'event-action-combo',
            itemClassName: 'event-action-combo-item',
            items: [
              {
                name: 'key',
                placeholder: '参数名',
                type: 'input-text'
              },
              getSchemaTpl('formulaControl', {
                variables: '${variables}',
                name: 'val',
                placeholder: '参数值',
                columnClassName: 'flex-1'
              })
            ]
          },
          {
            type: 'switch',
            name: 'blank',
            label: '新窗口打开',
            onText: '是',
            offText: '否',
            mode: 'horizontal',
            pipeIn: defaultValue(true)
          }
        ]
      }
    ]);
    return data;
  }
});
