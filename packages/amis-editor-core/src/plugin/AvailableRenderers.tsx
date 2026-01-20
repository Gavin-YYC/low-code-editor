import React from 'react';
import {Icon} from 'amis';
import {registerEditorPlugin} from '../manager';
import {AvailableRenderersPanel} from '../component/Panel/AvailableRenderersPanel';
import {BuildPanelEventContext, BasePlugin, BasicPanelItem} from '../plugin';
import {MultipleAppPanel} from '../component/Panel/MultipleAppPanel';

/**
 * 组件面板
 */
export class AvailableRenderersPlugin extends BasePlugin {
  static scene = ['layout'];
  order = -9999;

  buildEditorPanel(
    context: BuildPanelEventContext,
    panels: Array<BasicPanelItem>
  ) {
    const store = this.manager.store;

    // 多选时不显示
    if (context.selections.length) {
      return;
    }

    if (store.subRenderers.length) {
      panels.push({
        key: 'renderers',
        icon: <Icon icon="editor-renderer" />,
        tooltip: '组件',
        component: AvailableRenderersPanel,
        position: 'left',
        order: -9999
      });
    }
  }
}

/**
 * #YueZhan 多应用注册
 */
export class MultipleAppPlugin extends BasePlugin {
  static scene = ['layout'];
  order = -9999;

  buildEditorPanel(
    context: BuildPanelEventContext,
    panels: Array<BasicPanelItem>
  ) {
    const store = this.manager.store;

    // 多选时不显示
    if (context.selections.length) {
      return;
    }

    if (store.subRenderers.length) {
      panels.push({
        key: 'multiple-app',
        icon: <Icon icon="fa fa-map" />,
        tooltip: '多应用',
        component: MultipleAppPanel,
        position: 'left',
        order: -9999
      });
    }
  }
}

registerEditorPlugin(AvailableRenderersPlugin);
registerEditorPlugin(MultipleAppPlugin);
