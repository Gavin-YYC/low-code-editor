import type {BaseEventContext} from 'amis-editor-core';
import {
  BasePlugin,
  defaultValue,
  getSchemaTpl,
  registerEditorPlugin,
  tipedLabel
} from 'amis-editor-core';

export class MarkdownPlugin extends BasePlugin {
  static id = 'MarkdownPlugin';
  static scene = ['layout'];
  // 关联渲染器名字
  rendererName = 'markdown';
  $schema = '/schemas/MarkdownSchema.json';

  // 组件名称
  name = 'Markdown';
  isBaseComponent = true;
  description = '展示 markdown 内容';
  docLink = '/amis/zh-CN/components/markdown';
  tags = ['展示'];
  icon = 'fa fa-file-text';
  pluginIcon = 'markdown-plugin';
  scaffold = {
    type: 'markdown',
    value: '## 这是标题'
  };

  previewSchema = {
    ...this.scaffold
  };

  panelTitle = 'MD';
  panelBodyCreator = (context: BaseEventContext) => {
    const isUnderField = /\/field\/\w+$/.test(context.path as string);
    const toolLists = window.amisData.toolLists || [];
    return [
      getSchemaTpl('tabs', [
        {
          title: '常规',
          body: [
            // getSchemaTpl('layout:originPosition', {value: 'left-top'}),
            getSchemaTpl('switch', {
              name: 'ifUseTool',
              label: tipedLabel(
                '使用工具',
                '是否使用工具返回的结果，若是，则工具返回结果后将自动渲染。不支持自定义编辑'
              ),
              pipeIn: defaultValue(false),
              defaultValue: false,
              value: false
            }),
            {
              type: 'select',
              label: tipedLabel(
                '绑定工具',
                '选择已添加的工具进行绑定，将获取工具返回的数据进行展示。包括工作流工具和OpenAPI schema工具。若没有，请在业务逻辑页面进行添加'
              ),
              name: 'toolSelect',
              visibleOn: '${ifUseTool == true}',
              // mode: 'horizontal',
              joinValues: false,
              valueField: 'uid',
              labelField: 'label',
              // source: '${ls:toolLists}',
              options: toolLists,
              multiple: false,
              required: true,
              selectFirst: true
            },
            getSchemaTpl('markdownBody', {
              visibleOn: '${ifUseTool == false}'
            })
          ]
        },
        {
          title: '外观',
          body: [getSchemaTpl('className')]
        },
        {
          title: '显隐',
          body: [getSchemaTpl('ref'), getSchemaTpl('visible')]
        }
      ])
    ];
  };
}

registerEditorPlugin(MarkdownPlugin);
