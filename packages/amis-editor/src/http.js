import request from './request';

/** GET 请求 */
function get(url, params, options) {
  return new Promise((resolve, reject) => {
    request
      .get(url, {params: params, ...options})
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
}

/** POST 请求 */
function post(url, data, options) {
  return new Promise((resolve, reject) => {
    request
      .post(url, data, options)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
}

/** PUT 请求 **/
function put(url, params, options) {
  return new Promise(resolve => {
    request
      .put(url, params, options)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
}

/** DELETE 请求 */
function del(url, data) {
  return new Promise((resolve, reject) => {
    request({
      method: 'delete',
      url,
      data
    })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

// 下载
function download(url, parm) {
  return new Promise(() => {
    request({
      method: 'get',
      url,
      parm,
      responseType: 'blob'
    }).then(res => {
      const conte = res;
      const blob = new Blob([conte]);
      const fileName = '模板.xlsx';
      const link = document.createElement('a');
      link.download = fileName;
      link.style.display = 'none';
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href); // 释放URL 对象
      document.body.removeChild(link);
    });
  });
}

function downloadGet(url, parm, method = 'get', autoDownLoad, defaultFileName) {
  return new Promise((resolve, reject) => {
    request({
      method,
      url,
      params: parm,
      responseType: 'blob'
    })
      .then(res => {
        let isErr = false;
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          if (res.data.type === 'application/json') {
            isErr = true;
            const jsonData = JSON.parse(fileReader.result); // 说明是普通对象数据，后台转换失败
            return resolve(jsonData);
          } else {
            if (res?.data instanceof Blob && !isErr) {
              const url = window.URL.createObjectURL(new Blob([res.data]));
              let fileNameCode = '导出模板.xlsx';
              // if (res.headers?.['content-disposition']?.indexOf('filename')) {
              //   fileNameCode =
              //     /[^*="]+/g.exec(res.headers['content-disposition']?.split('filename=')[1])[0]
              //   if (!fileNameCode) {
              //     fileNameCode = '导出文件'
              //   }
              // } else {
              //   fileNameCode = defaultFileName || '导出文件'
              // }
              const fileName = decodeURI(fileNameCode);
              if (autoDownLoad) {
                let link = document.createElement('a');
                link.style.display = 'none';
                link.href = url;
                link.setAttribute('download', fileNameCode);
                document.body.appendChild(link);
                link.click();
                return resolve(res);
              }
              resolve({
                name: fileName,
                url,
                blob: res.data
              });
            }
          }
        };
        fileReader.readAsText(res.data);
      })
      .catch(err => {
        resolve(err);
      });
  });
}

// post下载
function downloadpost(url, parm) {
  return new Promise(() => {
    request({
      method: 'post',
      url,
      parm,
      responseType: 'blob'
    }).then(res => {
      const conte = res;
      const blob = new Blob([conte]);
      const fileName = '批量导出.xlsx';
      const link = document.createElement('a');
      link.download = fileName;
      link.style.display = 'none';
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href); // 释放URL 对象
      document.body.removeChild(link);
    });
  });
}

// get下载
function blobDownload(url, params) {
  return new Promise((resolve, reject) => {
    request({
      method: 'get',
      url,
      params,
      responseType: 'blob'
    })
      .then(res => {
        if (!res) {
          resolve(false);
        }
        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
        );
        const fileNameCode = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          res.headers['content-disposition']
        )[1];
        const fileName = decodeURI(fileNameCode);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
}

// post下载
function pBlobDownload(url, data) {
  return new Promise((resolve, reject) => {
    request({
      method: 'post',
      url,
      data,
      responseType: 'blob'
    })
      .then(res => {
        if (!res) {
          resolve(false);
        }
        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
        );
        const fileNameCode = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          res.headers['content-disposition']
        )[1];
        const fileName = decodeURI(fileNameCode);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
}

// POST 文件上传
function blobStream(url, data, params) {
  const headerConfig = {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    responseType: 'arraybuffer'
  };
  return new Promise((resolve, reject) => {
    request({
      method: 'post',
      headers: headerConfig.headers,
      url,
      data,
      params
    })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

const {props = {} } = window.$wujie || {};
const { amisEditorProps = {} } = props;
// TODO 待联调
// token appId language从主应用获取
const {url = ''} = amisEditorProps || {};
let baseApiPrefix = `${url}/console/api`;
if (process.env.NODE_ENV === 'production') {
  baseApiPrefix = `${url}/console/api`;
}

export default {
  baseApiPrefix,
  get,
  post,
  put,
  del,
  download,
  downloadGet,
  downloadpost,
  pBlobDownload,
  blobDownload,
  blobStream
};
