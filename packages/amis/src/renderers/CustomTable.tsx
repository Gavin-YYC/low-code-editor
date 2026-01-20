import React from 'react';
import {Renderer, RendererProps} from 'amis-core';
import {BaseSchema} from '../Schema';
import {Table} from 'amis';

export interface CustomTableSchema extends BaseSchema {
  type: 'custom-table';
}

export interface CustomTableProps
  extends RendererProps,
    Omit<CustomTableSchema, 'type' | 'className'> {
  tableData: Array<any>;
  columns: Array<any>;
  title: string; // 标题
  affixHeader: boolean; // 是否固定表头
  showIndex: boolean; // 是否展示序号
  placeholder: string; // 当没数据的时候的文字提示
  resizable: boolean; // 是否可以调整列宽
}

export default class CustomTable extends React.Component<CustomTableProps> {
  static defaultProps = {
    columns: [
      {
        title: '名字',
        label: '名字',
        name: 'userName',
        type: 'text',
        placeholder: '-'
      },
      {
        title: '年龄',
        type: 'text',
        label: '年龄',
        name: 'age',
        placeholder: '-'
      }
    ],
    tableData: [],
    affixHeader: false, // 是否固定表头
    showIndex: false, // 是否展示序号
    placeholder: '', // 当没数据的时候的文字提示
    resizable: false // 是否可以调整列宽
  };

  /** 提取columns中的数据 */
  pickColumnsData(columns: any[]) {
    const result = [];

    // 获取最大数据长度
    const maxLength = Math.max(
      ...columns.map(col => (col.data ? col.data.length : 0))
    );

    for (let i = 0; i < maxLength; i++) {
      const row: Record<string, any> = {};

      columns.forEach(col => {
        const value = col.data?.[i]?.value;
        // 处理数字类型字段
        row[col.name] =
          col.type === 'number' && value ? Number(value) : value || '-';
      });

      result.push(row);
    }

    return result;
  }
  render() {
    const {columns, showIndex, affixHeader, resizable, placeholder, render} =
      this.props;
    const filterColumns = columns.map(item => {
      return {
        ...item,
        title: item.label
      };
    });

    const data = this.pickColumnsData(columns);
    return (
      <>
        <div>
          {render &&
            render('table', {
              type: 'table',
              columns: filterColumns,
              items: data,
              showIndex: showIndex,
              affixHeader: affixHeader,
              resizable: resizable,
              placeholder: placeholder
            })}
          {/* <Table columns={filterColumns} dataSource={data} showIndex={showIndex} affixHeader={affixHeader} resizable={resizable} placeholder={placeholder} /> */}
        </div>
      </>
    );
  }
}

@Renderer({
  type: 'custom-table',
  name: 'custom-table'
})
export class CustomTableRenderer extends CustomTable {}
