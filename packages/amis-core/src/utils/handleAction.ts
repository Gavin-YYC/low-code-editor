/**
 * 后续好多地方可能都要支持 action，所以提取公共功能
 */

import {RendererProps} from '../factory';
import {normalizeApi, str2function} from './api';

export function handleAction(
  e: React.MouseEvent<any>,
  action: any,
  props: RendererProps,
  data?: any
) {
  // https://reactjs.org/docs/legacy-event-pooling.html
  e.persist(); // 等 react 17之后去掉 event pooling 了，这个应该就没用了

  const onAction = props.onAction;
  let onClick: any = action.onClick;

  if (typeof onClick === 'string') {
    onClick = str2function(onClick, 'event', 'props', 'data');
  }
  const result: any = onClick && onClick(e, props, data || props.data);

  if (e.isDefaultPrevented() || result === false || !onAction) {
    return;
  }

  e.preventDefault();

  // download 是一种 ajax 的简写
  if (action.actionType === 'download') {
    action.actionType = 'ajax';
    const api = normalizeApi((action as any).api);
    api.responseType = 'blob';
    api.downloadFileName = action.downloadFileName;
    (action as any).api = api;
  }

  // TODO xuzg toolStream 调用工作流工具等，也是发送请求，不过是流式返回
  // if (action.actionType === 'toolStream') {
  //   action.actionType = 'ajax';
  //   // const api = normalizeApi((action as any).api);
  //   // // api.responseType = 'blob';
  //   // // api.downloadFileName = action.downloadFileName;
  //   // (action as any).api = api;
  //   console.log('handleAction action', action);
  // }

  onAction(e, action, data || props.data);
}

export default handleAction;
