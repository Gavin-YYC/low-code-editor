import type {Api, ApiObject} from '../types';
import {normalizeApi, normalizeApiResponseData} from '../utils/api';
import {ServerError} from '../utils/errors';
import {createObject, isEmpty} from '../utils/helper';
import type {RendererEvent} from '../utils/renderer-event';
import {evalExpressionWithConditionBuilderAsync} from '../utils/tpl';
import type {ListenerAction, ListenerContext, RendererAction} from './Action';
import {registerAction} from './Action';
import {streamEventTarget} from 'amis-core';
// const streamEventTarget = new EventTarget();

export type IAjaxAction = {
  action: 'ajax';
  api: Api;
  messages?: {
    success: string;
    failed: string;
  };
  options?: Record<string, any>;
  [propName: string]: any;
} & ListenerAction;

/**
 * 发送请求动作
 *
 * @export
 * @class AjaxAction
 * @implements {Action}
 */
export class AjaxAction implements RendererAction {
  fetcherType: string;
  constructor(fetcherType = 'ajax') {
    this.fetcherType = fetcherType;
  }

  async run(
    action: IAjaxAction,
    renderer: ListenerContext,
    event: RendererEvent<any>
  ) {
    if (!event.context.env?.fetcher) {
      throw new Error('env.fetcher is required!');
    }

    if (!action.api) {
      throw new Error('api is required!');
    }

    // TODO xuzg toolStream 类型也在这里处理，接口返回的是流式数据

    if (this.fetcherType === 'download' && action.actionType === 'download') {
      if ((action as any).api) {
        (action as any).api.responseType = 'blob';
      }
    }

    const env = event.context.env;
    const silent = action?.options?.silent || (action?.api as ApiObject).silent;
    const messages = (action?.api as ApiObject)?.messages;
    let api = normalizeApi(action.api);

    if (api.sendOn !== undefined) {
      // 发送请求前，判断是否需要发送
      const sendOn = await evalExpressionWithConditionBuilderAsync(
        api.sendOn,
        action.data ?? {},
        false
      );

      if (!sendOn) {
        return;
      }
    }

    // 如果没配置data数据映射，则给一个空对象，避免将当前数据域作为接口请求参数
    if ((api as any)?.data == undefined) {
      api = {
        ...api,
        data: {}
      };
    }

    try {
      const result = await env.fetcher(
        api,
        action.data ?? {},
        action?.options ?? {}
      );
      const responseData =
        !isEmpty(result.data) || result.ok
          ? normalizeApiResponseData(result.data)
          : null;

      // 记录请求返回的数据
      event.setData(
        createObject(event.data, {
          ...responseData, // 兼容历史配置
          responseData,
          [action.outputVar || 'responseResult']: {
            ...responseData,
            responseData,
            responseStatus: result.status,
            responseMsg: result.msg
          }
        })
      );
      if (!silent) {
        if (!result.ok) {
          throw new ServerError(
            messages?.failed ?? action.messages?.failed ?? result.msg,
            result
          );
        } else {
          const msg =
            messages?.success ??
            action.messages?.success ??
            result.msg ??
            result.defaultMsg;
          msg &&
            env.notify(
              'success',
              msg,
              result.msgTimeout !== undefined
                ? {
                    closeButton: true,
                    timeout: result.msgTimeout
                  }
                : undefined
            );
        }
      }

      return result.data;
    } catch (e) {
      if (!silent) {
        if (e.type === 'ServerError') {
          const result = (e as ServerError).response;
          env.notify(
            'error',
            e.message,
            result.msgTimeout !== undefined
              ? {
                  closeButton: true,
                  timeout: result.msgTimeout
                }
              : undefined
          );
        } else {
          env.notify('error', e.message);
        }
      }
      throw e;
    }
  }
}
async function processStream(result: any, tool_name: string) {
  if (result.body) {
    const reader = result.body.getReader();
    let patchChunk = '';
    let resultData: any;
    let bufferData = {};
    while (true) {
      const {done, value} = await reader.read();
      if (done) {
        break;
      }

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n'); // 按行分割
      // console.log('chunk ', chunk);
      let parseError = false;

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const processedChunk = line.slice('data: '.length).trim(); // 去掉 "data: " 前缀
          try {
            const jsonStr = line.substring(6);
            bufferData = JSON.parse(jsonStr);
          } catch {
            console.log('*** parseError', line);
            parseError = true;
            // return;
          }
          if (bufferData.event === 'text_chunk') {
            patchChunk += bufferData?.data?.text || '';
          }
          if (bufferData.event === 'workflow_finished') {
            patchChunk =
              bufferData.data.outputs[Object.keys(bufferData.data.outputs)[0]];
          }

          if (processedChunk === '[DONE]') {
            console.log('*** done');

            // 流式响应结束
            break;
          }

          // patchChunk += processedChunk;
        }
      }

      resultData = {
        ok: true,
        data: patchChunk,
        status: result.status,
        msg: ''
      };

      // 触发事件，传递实时数据块
      const chunkEvent = new CustomEvent(`chunkReceived_${tool_name}`, {
        detail: {...resultData}
      });
      // 分发事件
      streamEventTarget.dispatchEvent(chunkEvent);
    }
    // console.log('xuzg, patchChunk', `chunkReceived_${tool_name}`, patchChunk);

    return resultData;
  }
}

/**
 * 工作流 工具 请求动作
 *
 * @export
 * @class ToolAction
 * @implements {Action}
 */
export class ToolAction implements RendererAction {
  fetcherType: string;
  constructor(fetcherType = 'ajax') {
    this.fetcherType = fetcherType;
  }

  async run(
    action: IAjaxAction,
    renderer: ListenerContext,
    event: RendererEvent<any>,
    mergeData: any
  ) {
    const env = event.context.env;
    const silent = action?.options?.silent || (action?.api as ApiObject).silent;
    const messages = (action?.api as ApiObject)?.messages;
    let api = normalizeApi(action.api);
    if (api.sendOn !== undefined) {
      // 发送请求前，判断是否需要发送
      const sendOn = await evalExpressionWithConditionBuilderAsync(
        api.sendOn,
        action.data ?? {},
        false
      );

      if (!sendOn) {
        return;
      }
    }

    // 如果没配置data数据映射，则给一个空对象，避免将当前数据域作为接口请求参数
    if ((api as any)?.data == undefined) {
      api = {
        ...api,
        data: {}
      };
    }
    const mergeDataIsEmpty =
      Object.keys(mergeData).filter(item => item !== '__super').length === 0;
    if (mergeData && !mergeDataIsEmpty && api?.data?.parameters) {
      const keys = Object.keys(api?.data?.parameters);
      if (keys && keys.length > 0) {
        const newObj = JSON.parse(JSON.stringify(api?.data?.parameters));
        keys.forEach(key => {
          const value = mergeData[key];
          if (value === undefined) {
            return;
          }
          newObj[key] = value;
        });
        api.data.parameters = newObj;
      }
    }
    if (mergeData && !mergeDataIsEmpty && api?.data?.inputs) {
      api.data.inputs = mergeData;
    }

    const toolName = api.data?.tool_name;
    const toolType = api?.data?.tool_provider_type;
    // delete api.data?.tool_name;

    try {
      const response: any = await fetch(api.url, {
        method: api.method || 'GET',
        headers: api.headers || {},
        body: api.data ? JSON.stringify(api.data) : undefined
      });

      if (!response.ok) {
        const result = await response.json();
        const message =
          typeof result === 'string'
            ? result
            : result.message
            ? result.message
            : `HTTP error! status: ${response.status}`;
        throw new ServerError(message, response);
      }
      let finalResult;
      if (toolType === 'workflow') {
        // 工作流工具全是流式响应
        finalResult = await processStream(response, toolName);
      } else {
        finalResult = await response.json();
        const resultData = {
          ok: true,
          data: finalResult,
          status: response.status,
          msg: ''
        };
        const chunkEvent = new CustomEvent(`chunkReceived_${toolName}`, {
          detail: {...resultData}
        });
        // 分发事件
        streamEventTarget.dispatchEvent(chunkEvent);
      }

      // 记录请求返回的数据
      event.setData(
        createObject(event.data, {
          [action.outputVar || 'responseResult']: finalResult
        })
      );
      console.log('AjaxAction.ts finalResult', finalResult);

      return finalResult?.data;
    } catch (e) {
      if (!silent) {
        if (e.type === 'ServerError') {
          const result = (e as ServerError).response;
          env.notify(
            'error',
            e.message,
            result.msgTimeout !== undefined
              ? {
                  closeButton: true,
                  timeout: result.msgTimeout
                }
              : undefined
          );
        } else {
          env.notify('error', e.message);
        }
      }
      throw e;
    }
  }
}

registerAction('ajax', new AjaxAction());

registerAction('download', new AjaxAction('download'));

// TODO xuzg 先写上
registerAction('toolStream', new ToolAction('toolStream'));
