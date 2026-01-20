import axios from 'axios';
import {getToken, redirectInit} from './util';

// 创建 axios 实例
const service = axios.create({
  baseURL: '/',
  timeout: 60 * 2000, // 2分钟
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    //'Authorization': 'Bearer c950abdb-ed2a-42b8-b876-cbee554d2a8b',
    //'Tenant-Id': 1,
    //'User-Id': 1,
    'opertoken': getToken(),
    'Authorization': getToken()
  }
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const errorCode = {
  '401': '认证失败，无法访问系统资源',
  '403': '当前操作没有权限',
  '404': '访问资源不存在',
  'default': '系统未知错误，请反馈给管理员'
};

// 响应拦截器
service.interceptors.response.use(
  res => {
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || res.msg || errorCode.default;
    if (code == '1' || code == 200 || code == '10000') {
      // 接口请求成功
      return res.data;
    } else if (code == '990002') {
      // 用于测试网络是否断开接口
      return res.data;
    } else if (code === 401 || code === '9') {
      const page = window.location.href.replace(/\?\S*/g, '');
      if (/\/login$/g.test(page) || /\/loginAuthentication$/g.test(page)) {
        return;
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
    } else if (code === 500) {
      return Promise.reject(new Error(msg));
    } else if (code === 403) {
      redirectInit();
    } else {
      // 其余接口status=200的情况下，返回整体
      return res.data;
    }
  },
  error => {
    console.log('is here', error.status);

    let {message, status} = error;
    if (+status === 403) {
      // 接口无权限
      redirectInit();
    }
    if (message == 'Network Error') {
      message = '后端接口连接异常';
      // return;
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = `系统接口${message.substr(message.length - 3)}异常`;
    }
    if (message == 'canceled') {
      // 前端主动中断接口
      return;
    }
    return Promise.reject(error);
  }
);

// 导出 axios 实例
export default service;
