import React from 'react';
import {PanelProps} from '../../plugin';
import {autobind, Icon, render as renderAmis} from 'amis';

interface IPageSchema {
  type: string;
  id: string;
  title?: string;
  body: Array<unknown>;
  [key: string]: unknown;
}
// #YueZhan: 多页面
export class MultipleAppPanel extends React.Component<PanelProps> {
  state: {pages: IPageSchema[]} = {
    pages: []
  };

  componentDidMount(): void {
    const list = this.getSchemaCacheList();
    this.setState({pages: list});
  }

  @autobind
  getSchemaCacheList(): IPageSchema[] | undefined {
    const data = window?.amisData.schema_cache_list;
    if (!data) {
      const currentEditSchema = window?.amisData.editting_schema;
      if (!currentEditSchema) return;
      this.setSchemaCacheList([currentEditSchema]);
      return [currentEditSchema];
    }
    return data;
  }
  @autobind
  setSchemaCacheList(schemaList: IPageSchema[]) {
    window.amisData.schema_cache_list = schemaList;
  }
  @autobind
  setPageOptions() {
    const options = this.state.pages.map(item => {
      return {
        label: item.title ?? item.id,
        value: item.id
      };
    });
    window.amisData.page_options = options;
  }

  @autobind
  async addSchema() {
    await this.setState({
      pages: [
        ...this.state.pages,
        {
          type: 'page',
          id: 'u' + this.random(13),
          title: `page${this.state.pages.length + 1}`,
          regions: ['body'],
          body: []
        }
      ]
    });

    this.setSchemaCacheList(this.state.pages);
    this.setPageOptions();
  }

  @autobind
  async editSchema(item: IPageSchema) {
    const {store} = this.props;
    const data = this.getSchemaCacheList();
    if (!data) return;
    await this.setState({
      pages: data
    });
    const currentIndex = data.findIndex(page => page.id === item.id);
    store.setSchema(this.state.pages[currentIndex]);
  }

  @autobind
  async removeSchema(id: string) {
    const pages = this.state.pages.filter(item => item.id !== id);
    await this.setState({
      pages
    });
    this.setSchemaCacheList(this.state.pages);
    if (pages.length === 0) return;
    this.editSchema(pages[pages.length - 1]);
    this.setPageOptions();
  }

  random(length: number) {
    const random = Math.random().toString().split('.').pop() as string;
    return random.slice(0, length);
  }

  render(): React.ReactNode {
    const {store} = this.props;
    /** 当前页面 */
    const currentPage = store.valueWithoutHiddenProps;

    return (
      <>
        <div className="ae-RendererPanel">
          <div className="panel-header">页面</div>
          <ul className="multiple-app-container">
            {this.state.pages.map(item => {
              return (
                <li
                  key={item.id}
                  className={`${currentPage?.id === item?.id ? 'active' : ''}`}
                >
                  <div className="multiple-app-page">
                    {renderAmis(item)}
                    <div className="multiple-app-action">
                      <Icon
                        icon="fa-solid fa-pen-nib"
                        className="multiple-app-icon"
                        onClick={() => this.editSchema(item)}
                      />
                      {this.state.pages.length > 1 && (
                        <Icon
                          icon="fa-solid fa-trash"
                          className="multiple-app-icon"
                          onClick={() => this.removeSchema(item.id)}
                        />
                      )}
                    </div>
                  </div>

                  {item.title && (
                    <p className="multiple-app-title">{item.title}</p>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="multiple-app-add" onClick={this.addSchema}>
            新增
          </div>
        </div>
      </>
    );
  }
}
