import {
  BaseEventContext,
  BasePlugin,
  defaultValue,
  getSchemaTpl,
  registerEditorPlugin,
  tipedLabel
} from 'amis-editor';
import {getI18nEnabled, ScaffoldForm} from 'amis-editor-core';

/**
 * #YueZhan：自定义表格-右侧插件
 */
export class CustomTablePlugin extends BasePlugin {
  // 这里要跟对应的渲染器名字对应上
  // 注册渲染器的时候会要求指定渲染器名字
  rendererName = 'custom-table';

  // 暂时只支持这个，配置后会开启代码编辑器
  $schema = '/schemas/UnkownSchema.json';

  isBaseComponent = true;

  // 搜索关键词
  searchKeywords = '自定义表格';

  // 用来配置名称和描述
  name = '自定义表格';
  description = '这只是个示例';

  // tag，决定会在哪个 tab 下面显示的
  tags = ['展示'];

  // 图标
  icon = 'fa fa-table';
  pluginIcon = 'table-plugin';

  previewSchema: any = {
    type: 'table',
    className: 'text-left m-b-none',
    affixHeader: false,
    tableData: [],
    columns: [
      {
        title: '名字',
        label: '名字',
        name: 'userName',
        type: 'text',
        id: 'u:d834e8468b6c',
        placeholder: '-',
        $$id: '48e86a89ec22'
      },
      {
        title: '年龄',
        type: 'text',
        label: '年龄',
        name: 'age',
        id: 'u:9e720a204102',
        placeholder: '-',
        $$id: '3772e4d031e4'
      }
    ]
  };

  // 拖入组件里面时的初始数据
  scaffold = {
    type: 'custom-table',
    tableData: [],
    columns: [
      {
        title: '名字',
        label: '名字',
        name: 'userName',
        type: 'text',
        id: 'u:d834e8468b6c',
        placeholder: '-',
        $$id: '48e86a89ec22'
      },
      {
        title: '年龄',
        type: 'text',
        label: '年龄',
        name: 'age',
        id: 'u:9e720a204102',
        placeholder: '-',
        $$id: '3772e4d031e4'
      }
    ]
  };

  get scaffoldForm(): ScaffoldForm {
    const i18nEnabled = getI18nEnabled();

    return {
      title: '快速构建表格',
      body: [
        {
          type: 'tabs',
          tabs: [
            {
              title: '列配置',
              body: [
                {
                  name: 'columns',
                  type: 'combo',
                  multiple: true,
                  label: false,
                  addButtonText: '新增一列',
                  draggable: true,
                  multiLine: true,
                  tabsMode: true,
                  tabsStyle: 'card',
                  items: [
                    {
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text',
                      name: 'label',
                      placeholder: '标题'
                    },
                    {
                      type: 'input-text',
                      name: 'name',
                      placeholder: '绑定字段名'
                    },
                    {
                      type: 'select',
                      name: 'type',
                      placeholder: '类型',
                      value: 'text',
                      options: [
                        {
                          value: 'text',
                          label: '纯文本'
                        },
                        {
                          value: 'image',
                          label: '图片'
                        },
                        {
                          value: 'date',
                          label: '日期'
                        },
                        {
                          value: 'progress',
                          label: '进度'
                        },
                        {
                          value: 'status',
                          label: '状态'
                        },
                        {
                          value: 'operation',
                          label: '操作栏'
                        }
                      ]
                    },
                    {
                      type: 'combo',
                      label: '手动添加数据',
                      name: 'data',
                      multiple: true,
                      addButtonText: '添加数据',
                      draggable: true,
                      items: [
                        {
                          type: 'input-text',
                          name: 'value',
                          placeholder: '请输入当前列的数据'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              title: '数据配置',
              body: [
                {
                  type: 'combo',
                  name: 'tableData',
                  id: 'table-data',
                  multiple: true,
                  label: false,
                  addButtonText: '新增一行',
                  draggable: true,
                  items: [
                    {
                      type: 'input-text',
                      name: 'value',
                      placeholder: '请输入每一行的数据，使用&符号分隔'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      canRebuild: true
    };
  }

  // 右侧面板相关
  panelTitle = '自定义组件';
  panelJustify = true;
  panelBodyCreator = (context: BaseEventContext) => {
    return [
      getSchemaTpl('tabs', [
        {
          title: '属性',
          body: [
            {
              type: 'switch',
              name: 'affixHeader',
              label: '固定表头',
              value: false
            },
            {
              type: 'switch',
              name: 'showIndex',
              label: '展示序号',
              value: false
            },
            {
              type: 'input-text',
              name: 'placeholder',
              label: '空数据提示'
            },
            {
              type: 'switch',
              name: 'resizable',
              label: '列宽可调整',
              value: false
            }
          ]
        },
        {
          title: '外观',
          body: getSchemaTpl('collapseGroup', [
            {
              title: '宽高设置',
              body: [
                getSchemaTpl('style:widthHeight', {
                  widthSchema: {
                    label: tipedLabel(
                      '宽度',
                      '默认宽度为父容器宽度，值单位默认为 px，也支持百分比等单位 ，如：100%'
                    ),
                    pipeIn: defaultValue('100%')
                  },
                  heightSchema: {
                    label: tipedLabel(
                      '高度',
                      '默认高度为300px，值单位默认为 px，也支持百分比等单位 ，如：100%'
                    ),
                    pipeIn: defaultValue('300px')
                  }
                }),
                {
                  type: 'input-color',
                  name: 'background',
                  defaultValue: '#fff',
                  label: '背景色'
                }
              ]
            }
          ])
        }
      ])
    ];
  };
}

registerEditorPlugin(CustomTablePlugin);
