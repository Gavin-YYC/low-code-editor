import React from 'react';
import {createObject, Renderer, RendererProps} from 'amis-core';
import {BaseSchema} from '../Schema';
import * as ECharts from 'echarts';
import {EChartOption} from 'echarts';
import {ActionSchema} from 'amis';

export interface EChartSchema extends BaseSchema {
  type: 'e-chart';
}

export interface EChartProps
  extends RendererProps,
    Omit<EChartSchema, 'type' | 'className'> {
  width?: string;
  height?: string;
  chartType?: 'line' | 'bar' | 'pie';
  chartTitle?: string;
  chartColor?: string;
  /**
   * 点击行为配置，可以用来满足下钻操作等。
   */
  clickAction?: ActionSchema;
}

export default class EChart extends React.Component<EChartProps> {
  static defaultProps = {
    width: '100%',
    height: '300px',
    chartType: 'line',
    chartTitle: '',
    chartColor: '#049eff'
  };

  // 创建一个ResizeObserver实例来监听父容器的尺寸变化
  watchChartWc = new ResizeObserver(() => {
    this.echarts?.resize();
  });

  echarts: ECharts.ECharts | null = null;
  graphDom: React.RefObject<HTMLDivElement> = React.createRef();
  parentContainer: React.RefObject<HTMLDivElement> = React.createRef();
  componentDidMount(): void {
    // 开始监听父容器的尺寸变化
    this.watchChartWc.observe(this.parentContainer.current!);
    this.renderOptions();
  }

  componentWillUnmount(): void {
    this.watchChartWc.unobserve(this.parentContainer.current!);
  }

  componentDidUpdate(): void {
    this.renderOptions();
  }

  handleClick(ctx: object) {
    const {onAction, clickAction, data} = this.props;

    if (clickAction && onAction) {
      onAction(null, clickAction, createObject(data, ctx));
    }
  }

  renderOptions() {
    if (!this.graphDom.current) return;

    this.echarts = ECharts.init(this.graphDom.current!);
    this.echarts.clear();

    const {chartType} = this.props;

    let options: EChartOption = {};

    if (chartType === 'line') {
      options = this.lineOptions();
    } else if (chartType === 'bar') {
      options = this.barOptions();
    } else if (chartType === 'pie') {
      options = this.pieOptions();
    }
    this.echarts?.setOption(options);

    this.echarts?.on('click', this.handleClick.bind(this));
  }
  // 在文件顶部添加辅助函数
  hexToRgba(hex: string, opacity: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  lineOptions() {
    const {
      chartColor = '#ff5500',
      lineType = 'solid',
      lineWidth = 2,
      showSymbol,
      symbolColor,
      showArea,
      areaColor,
      chartTitle,
      chartSubTitle,
      xUnit,
      yUnit,
      customOption,
      line
    } = this.props;
    let xData: Array<string> = [];
    let yData: Array<number> = [];

    // 自定义配置
    if (customOption && line?.length > 0) {
      xData = line.map(item => item.xAxisData);
      yData = line.map(item => Number(item.yAxisData));
    }

    const options: EChartOption = {
      // 标题
      title: {
        text: chartTitle,
        subtext: chartSubTitle,
        left: 'center'
      },
      // 提示框组件
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      // X轴
      xAxis: [
        {
          type: 'category',
          data: xData,
          axisLabel: {
            interval: 0,
            rotate: 0
          },
          name: xUnit
        }
      ],
      // Y轴
      yAxis: [
        {
          type: 'value',
          name: yUnit,
          axisLabel: {
            formatter: '{value} '
          }
        }
      ],
      // 数据系列
      series: [
        {
          type: 'line',
          data: yData,
          lineStyle: {
            color: chartColor,
            type: lineType,
            width: Number(lineWidth)
          },
          symbol: showSymbol ? 'circle' : 'none',
          symbolSize: 8,
          itemStyle: {
            color: symbolColor || chartColor
          },
          areaStyle: showArea
            ? {
                color: areaColor || this.hexToRgba(chartColor, 0.3)
              }
            : undefined,
          smooth: true // 添加平滑曲线效果
        }
      ]
    };
    return options;
  }
  barOptions() {
    const {
      barColor = '#049eff',
      barWidth = 'auto',
      showLabelBar,
      labelColorBar,
      xUnit,
      yUnit,
      customOption,
      bar
    } = this.props;
    let xData: Array<string> = [];
    let yData: Array<number> = [];
    if (customOption && bar.length > 0) {
      xData = bar.map(item => item.xValue);
      yData = bar.map(item => Number(item.yValue));
    }
    const options: EChartOption = {
      title: {
        text: this.props.chartTitle,
        subtext: this.props.chartSubTitle,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: {
          rotate: 0
        },
        name: xUnit,
        axisLine: {
          lineStyle: {
            color: '#666' // X轴颜色
          }
        }
      },
      yAxis: {
        type: 'value',
        name: yUnit,
        axisLine: {
          lineStyle: {
            color: '#666' // Y轴颜色
          }
        }
      },
      series: [
        {
          type: 'bar',
          data: yData,
          itemStyle: {
            color: barColor,
            barBorderRadius: [6, 6, 0, 0],
            borderWidth: 1,
            borderType: 'solid'
          },
          barWidth: barWidth === 'auto' ? '30%' : barWidth,
          label: {
            show: showLabelBar,
            color: labelColorBar || '#333',
            position: 'top',
            fontWeight: 'bold',
            formatter: '{c}'
          }
        }
      ]
    };
    return options;
  }
  pieOptions() {
    const {
      radius = '50%',
      center = '50%|50%',
      showLabel,
      labelColor,
      customOption,
      pie
    } = this.props;

    // 处理半径配置 (格式: 外半径|内半径)
    const [outerRadius, innerRadius] = radius.includes('|')
      ? radius.split('|')
      : [radius, '0'];

    // 处理中心位置 (格式: 水平|垂直)
    const [centerX, centerY] = center.includes('|')
      ? center.split('|')
      : ['50%', '50%'];

    // 转换图例数据为 echarts 需要的格式
    let data: Array<{name: string; value: number}> = [];
    // 自定义配置
    if (customOption && pie) {
      data = pie.map(item => ({
        name: item.name,
        value: Number(item.value)
      }));
    }

    const options: EChartOption = {
      title: {
        text: this.props.chartTitle,
        subtext: this.props.chartSubTitle,
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
          radius: [innerRadius, outerRadius],
          center: [centerX, centerY],
          data,
          // itemStyle: {
          //   color: chartColor
          // },
          label: {
            show: showLabel,
            color: labelColor,
            formatter: '{b}: {c} ({d}%)'
          }
        }
      ]
    };
    return options;
  }

  render() {
    const {width, height} = this.props;

    return (
      <>
        <div
          style={{width, height}}
          id="echarts-container"
          ref={this.parentContainer}
        >
          <div style={{width: '100%', height: '100%'}} ref={this.graphDom}>
            EChart
          </div>
        </div>
      </>
    );
  }
}

@Renderer({
  type: 'e-chart',
  name: 'e-chart'
})
export class EChartRenderer extends EChart {}
