import {Button} from 'amis';
import {
  BaseEventContext,
  BasePlugin,
  defaultValue,
  getEventControlConfig,
  getSchemaTpl,
  registerEditorPlugin,
  tipedLabel
} from 'amis-editor';
import {diff, ScaffoldForm} from 'amis-editor-core';
import {title} from 'process';
import React from 'react';

/**
 * #YueZhan：自定义图表-右侧插件
 */
const chartDefaultConfig = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line'
    }
  ],
  backgroundColor: 'transparent'
};
export class EChartsPlugin extends BasePlugin {
  // 这里要跟对应的渲染器名字对应上
  // 注册渲染器的时候会要求指定渲染器名字
  rendererName = 'e-chart';

  // 暂时只支持这个，配置后会开启代码编辑器
  $schema = '/schemas/UnkownSchema.json';

  isBaseComponent = true;

  // 搜索关键词
  searchKeywords = '自定义图表';

  // 用来配置名称和描述
  name = '自定义图表';
  description = '这只是个示例';

  // tag，决定会在哪个 tab 下面显示的
  tags = ['展示'];

  // 图标
  icon = 'fa fa-pie-chart';
  pluginIcon = 'chart-plugin';

  // 用来生成预览图的
  previewSchema = {
    type: 'chart',
    config: chartDefaultConfig,
    replaceChartOption: true
  };

  // 拖入组件里面时的初始数据
  scaffold = {
    type: 'e-chart',
    color: '#049eff'
  };
  get scaffoldForm(): ScaffoldForm {
    const {toolList = []} = window?.$wujie?.props?.amisEditorProps || {};
    return {
      title: '快速构建图表数据',
      body: [
        {
          type: 'switch',
          label: '自定义配置',
          name: 'customOption',
          trueValue: true,
          falseValue: false,
          value: true
        },
        {
          name: 'chartType',
          type: 'radios',
          label: '图表类型',
          value: 'pie',
          visibleOn: '${customOption}',
          options: [
            {
              label: '饼图',
              value: 'pie'
            },
            {
              label: '折线图',
              value: 'line'
            },
            {
              label: '柱状图',
              value: 'bar'
            }
          ]
        },
        {
          type: 'input-table',
          name: 'pie',
          addable: true,
          editable: true,
          visibleOn: "${chartType === 'pie' && customOption}",
          columns: [
            {
              name: 'name',
              label: '类目'
            },
            {
              name: 'value',
              label: '数值'
            }
          ]
        },
        {
          type: 'input-table',
          name: 'line',
          addable: true,
          editable: true,
          visibleOn: "${chartType === 'line' && customOption}",
          columns: [
            {
              name: 'xAxisData',
              label: 'X轴类别'
            },
            {
              name: 'yAxisData',
              label: 'Y轴数据',
              type: 'input-number'
            }
          ]
        },
        {
          type: 'input-table',
          name: 'bar',
          addable: true,
          editable: true,
          visibleOn: "${chartType === 'bar' && customOption}",
          columns: [
            {
              name: 'xValue',
              label: 'X轴类别'
            },
            {
              name: 'yValue',
              label: 'Y轴数据',
              type: 'input-number'
            }
          ]
        },
        // {
        //   type: "form",
        //   title: "数据配置",
        //   visibleOn: "${customOption}",
        //   name: "chartData",
        //   data: {
        //     pie: [{ name: "Java", value: 18 }, { name: "JavaScript", value: 14 }],
        //     line: [{ xAxisData: '周一', yAxisData: 10 }, { xAxisData: '周二', yAxisData: 18 }, { xAxisData: '周三', yAxisData: 6 }],
        //     bar: [{ xValue: '摄影', yValue: 10 }, { xValue: '旅行', yValue: 18 }]
        //   },
        //   body: [

        //   ]
        // },
        {
          label: '调用工具',
          type: 'select',
          name: 'tools',
          menuTpl: '${label}',
          defaultValue: 'a',
          visibleOn: '${!customOption}',
          options: toolList
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
            getSchemaTpl('collapseGroup', [
              {
                title: '基本',
                body: [
                  {
                    label: '图表类型',
                    type: 'select',
                    name: 'chartType',
                    menuTpl: '${label}',
                    value: 'line',
                    options: [
                      {
                        label: '折线图',
                        value: 'line'
                      },
                      {
                        label: '柱状图',
                        value: 'bar'
                      },
                      {
                        label: '饼图',
                        value: 'pie'
                      }
                    ]
                  },
                  {
                    type: 'input-text',
                    label: '标题',
                    name: 'chartTitle'
                  },
                  {
                    type: 'input-text',
                    label: '副标题',
                    name: 'chartSubTitle'
                  },
                  {
                    type: 'input-text',
                    label: 'X轴单位',
                    name: 'xUnit',
                    visibleOn: "${chartType !== 'pie'}"
                  },
                  {
                    type: 'input-text',
                    label: 'Y轴单位',
                    name: 'yUnit',
                    visibleOn: "${chartType !== 'pie'}"
                  },
                  {
                    type: 'input-color',
                    name: 'chartColor',
                    defaultValue: '#ff5500',
                    label: '线段颜色',
                    visibleOn: "${chartType === 'line'}"
                  },
                  {
                    type: 'select',
                    label: '线条类型',
                    name: 'lineType',
                    defaultValue: 'solid',
                    options: [
                      {label: '实线', value: 'solid'},
                      {label: '虚线', value: 'dashed'},
                      {label: '点线', value: 'dotted'}
                    ],
                    visibleOn: "${chartType === 'line'}"
                  },
                  {
                    type: 'input-number',
                    label: '线条宽度',
                    name: 'lineWidth',
                    min: 1,
                    max: 10,
                    step: 1,
                    visibleOn: "${chartType === 'line'}"
                  },
                  {
                    type: 'switch',
                    label: '显示标记点',
                    name: 'showSymbol',
                    trueValue: true,
                    falseValue: false,
                    visibleOn: "${chartType === 'line'}"
                  },
                  {
                    type: 'input-color',
                    label: '标记颜色',
                    name: 'symbolColor',
                    visibleOn: "${chartType === 'line' && showSymbol}"
                  },
                  {
                    type: 'switch',
                    label: '面积填充',
                    name: 'showArea',
                    trueValue: true,
                    falseValue: false,
                    visibleOn: "${chartType === 'line'}"
                  },
                  {
                    type: 'input-color',
                    label: '填充颜色',
                    name: 'areaColor',
                    visibleOn: "${chartType === 'line' && showArea}"
                  },
                  {
                    type: 'input-text',
                    label: '半径配置',
                    name: 'radius',
                    description: '格式: 外半径|内半径 (示例: 50%|30%)',
                    visibleOn: "${chartType === 'pie'}"
                  },
                  {
                    type: 'input-text',
                    label: '中心位置',
                    name: 'center',
                    description: '格式: 水平位置|垂直位置 (示例: 50%|50%)',
                    visibleOn: "${chartType === 'pie'}"
                  },
                  {
                    type: 'switch',
                    label: '显示标签',
                    name: 'showLabel',
                    trueValue: true,
                    falseValue: false,
                    visibleOn: "${chartType === 'pie'}"
                  },
                  {
                    type: 'input-color',
                    label: '标签颜色',
                    name: 'labelColor',
                    visibleOn: "${chartType === 'pie' && showLabel}"
                  },
                  {
                    type: 'input-color',
                    name: 'barColor',
                    defaultValue: '#049eff',
                    label: '柱条颜色',
                    visibleOn: "${chartType === 'bar'}"
                  },
                  {
                    type: 'input-text',
                    label: '柱条宽度',
                    name: 'barWidth',
                    description: '数值或百分比（示例：30 或 40%）',
                    visibleOn: "${chartType === 'bar'}"
                  },
                  {
                    type: 'switch',
                    label: '显示数值标签',
                    name: 'showLabelBar',
                    trueValue: true,
                    falseValue: false,
                    visibleOn: "${chartType === 'bar'}"
                  },
                  {
                    type: 'input-color',
                    label: '标签颜色',
                    name: 'labelColorBar',
                    visibleOn: "${chartType === 'bar' && showLabelBar}"
                  }
                ]
              },
              {
                title: '图表下钻',
                body: [
                  {
                    name: 'clickAction',
                    asFormItem: true,
                    label: false,
                    children: ({onChange, value}: any) => (
                      <div className="m-b">
                        <Button
                          size="sm"
                          level={value ? 'danger' : 'info'}
                          onClick={this.editDrillDown.bind(this, context.id)}
                        >
                          配置 DrillDown
                        </Button>

                        {value ? (
                          <Button
                            size="sm"
                            level="link"
                            className="m-l"
                            onClick={() => onChange('')}
                          >
                            删除 DrillDown
                          </Button>
                        ) : null}
                      </div>
                    )
                  }
                ]
              }
            ])
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
        },
        {
          title: '事件',
          className: 'p-none',
          body: [
            getSchemaTpl('eventControl', {
              name: 'onEvent',
              ...getEventControlConfig(this.manager, context)
            })
          ]
        }
      ])
    ];
  };

  editDrillDown(id: string) {
    const manager = this.manager;
    const store = manager.store;
    const node = store.getNodeById(id);
    const value = store.getValueOf(id);

    const dialog = (value.clickAction && value.clickAction.dialog) || {
      title: '标题',
      body: ['<p>内容 <code>${value|json}</code></p>']
    };
    if (node && value) {
      this.manager.openSubEditor({
        title: '配置 DrillDown 详情',
        value: {
          type: 'container',
          ...dialog
        },
        slot: {
          type: 'container',
          body: '$$'
        },
        typeMutable: false,
        onChange: newValue => {
          newValue = {
            ...value,
            clickAction: {
              actionType: 'dialog',
              dialog: newValue
            }
          };
          manager.panelChangeValue(newValue, diff(value, newValue));
        }
      });
    }
  }
}

registerEditorPlugin(EChartsPlugin);
