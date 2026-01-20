import React from 'react';
import {registerActionPanel} from '../../actionsPanelManager';
import {getSchemaTpl, isObject, tipedLabel} from 'amis-editor-core';

registerActionPanel('toolStream', {
  label: '调用工具',
  tag: '服务',
  description: '调用已添加的工具，获取工具返回的数据',
  descDetail: (info: any, context: any, props: any) => {
    // let apiInfo = info?.api ?? info?.args?.api;
    // if (typeof apiInfo === 'string') {
    //   apiInfo = normalizeApi(apiInfo);
    // }
    return (
      <div className="action-desc">
        工具：
        <span className="variable-right variable-left">
          {info.toolSelect?.label || '-'}
        </span>
      </div>
    );
  },
  schema: () => {
    const toolLists = window?.amisData?.toolLists || [];
    return [
      {
        type: 'wrapper',
        className: 'p-none',
        body: [
          {
            type: 'service',
            id: 'tool-service',
            name: 'tool-service',
            data: {
              tools: toolLists
            },
            body: [
              {
                type: 'select',
                label: tipedLabel(
                  '选择工具',
                  '选择已添加的工具，包括工作流工具和OpenAPI schema工具。若没有，请在业务逻辑页面进行添加'
                ),
                name: 'toolSelect',
                size: 'lg',
                mode: 'horizontal',
                joinValues: false,
                valueField: 'uid',
                labelField: 'label',
                // source: '${ls:toolLists}',
                source: '${tools}',
                // option: toolLists,
                multiple: false,
                required: true,
                selectFirst: true,
                onEvent: {
                  change: {
                    actions: [
                      {
                        args: {
                          value: {}
                        },
                        actionType: 'setValue',
                        componentId: 'queryParam'
                      }
                    ]
                  }
                }
              },
              {
                type: 'combo',
                syncDefaultValue: false,
                size: 'lg',
                name: 'queryParam',
                label: '请求入参',
                id: 'queryParam',
                mode: 'horizontal',
                renderLabel: false,
                descriptionClassName: 'help-block text-xs m-b-none',
                description:
                  '选择工具所需的参数名作为key，组件绑定的值作为value。动态值为\\${value}的形式',
                multiple: true,
                pipeIn: value => {
                  if (!isObject(value)) {
                    return value;
                  }

                  const arr: any[] = [];

                  Object.keys(value).forEach(key => {
                    arr.push({
                      keyName: key || '',
                      value:
                        typeof value[key] === 'string'
                          ? value[key]
                          : JSON.stringify(value[key])
                    });
                  });
                  return arr;
                },
                pipeOut: value => {
                  if (!Array.isArray(value)) {
                    return value;
                  }
                  const obj: any = {};

                  value.forEach(item => {
                    const key: string = item.keyName || '';
                    let val: any = item.value;
                    try {
                      val = JSON.parse(val);
                    } catch (e) {
                      // console.log('err', e);
                    }

                    obj[key] = val;
                  });
                  return obj;
                },
                items: [
                  {
                    type: 'select',
                    unique: true,
                    name: 'keyName',
                    // 从上面的select中取字段名信息
                    source: '${toolSelect.schema}',
                    placeholder: '请选择工具的参数名',
                    required: true
                  },

                  getSchemaTpl('DataPickerControl', {
                    placeholder: 'Value',
                    name: 'value'
                  })
                ]
              }
            ]
          },
          {
            name: 'outputVar',
            type: 'input-text',
            label: '请求结果',
            placeholder: '请输入存储请求结果的变量名称',
            description:
              '如需执行多次发送请求，可以修改此变量名用于区分不同请求返回的结果',
            mode: 'horizontal',
            size: 'lg',
            value: 'resData',
            required: true
          }
        ]
      }
    ];
  },
  outputVarDataSchema: [
    {
      type: 'object',
      title: 'responseResult',
      properties: {
        responseData: {
          type: 'object',
          title: '响应数据'
        },
        responseStatus: {
          type: 'number',
          title: '状态标识'
        },
        responseMsg: {
          type: 'string',
          title: '提示信息'
        }
      }
    }
  ]
});
