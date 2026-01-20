// 低代码里用到的api，考虑解耦 TODO tianfeng
import http from './http';

export function getCustomCollection(name: string) {
  return http.get(
    `${http.baseApiPrefix}/workspaces/current/tool-provider/api/get`,
    {provider: name}
  );
}

export const getToolDetailByToolID = (toolID: string) => {
  return http.get(
    `${http.baseApiPrefix}/workspaces/current/tool-provider/workflow/get?workflow_tool_id=${toolID}`
  );
};

export const getMCPCollection = (collectionName: string) => {
  return http.get(
    `${http.baseApiPrefix}/workspaces/current/tool-provider/mcp/get`,
    {
      params: {
        provider: collectionName
      }
    }
  );
};
