import {
  getCustomCollection,
  getToolDetailByToolID,
  getMCPCollection
} from '../../../../service';

/**
 * 检查是否为内置工具
 * @param collection 工具集
 * @returns 是否为内置工具
 */
export const isBuiltInTool = (collection: {type: string}): boolean => {
  return collection.type === 'builtIn';
};

/**
 * 检查是否为工作流工具
 * @param collection 工具集
 * @returns 是否为工作流工具
 */
export const isWorkflowTool = (collection: {type: string}): boolean => {
  return collection.type === 'workflow';
};

/**
 * 检查是否为自定义工具
 * @param collection 工具集
 * @returns 是否为自定义工具
 */
export const isCustomTool = (collection: {type: string}): boolean => {
  return collection.type === 'custom';
};

/**
 * 检查是否为OPEN API schema工具
 * @param collection 工具集
 * @returns 是否为OPEN API schema工具
 */
export const isOpenapiShemaTool = (collection: {type: string}): boolean => {
  return collection.type === 'openapi_shema';
};

/**
 * 检查是否为MCP工具
 * @param collection 工具集
 * @returns 是否为MCP工具
 */
export const isMCPTool = (collection: {type: string}): boolean => {
  return collection.type === 'mcp';
};

/**
 * 获取自定义工具集详情
 * @param collection 工具集
 * @returns 自定义工具集详情
 */
const getCustomCollectionDetail = async (
  collection: any
): Promise<Record<string, any>> => {
  const res = await getCustomCollection(collection.name);

  if (
    res.credentials?.auth_type === AuthTypes.apiKey &&
    !res.credentials.api_key_header_prefix &&
    res.credentials.api_key_value
  )
    res.credentials.api_key_header_prefix = AuthHeaderPrefixes.custom;

  return {
    ...res,
    labels: collection.labels,
    provider: collection.name,
    icon_url: collection.icon_url,
    id: collection.id
  };
};

const getWorkflowCollectionDetail = async (
  collection: any
): Promise<Record<string, any>> => {
  const res = await getToolDetailByToolID(collection.id);

  return {
    ...res,
    parameters:
      res.tool?.parameters?.map(item => ({
        name: item.name,
        description: item.llm_description,
        form: item.form,
        required: item.required,
        type: item.type
      })) || [],
    labels: res.tool?.labels || [],
    icon_url: collection.icon_url
  };
};

/**
 * 获取MCP工具集详情
 * @param collection 工具集
 * @returns MCP工具集详情
 */
const getMCPCollectionDetail = async (
  collection: any
): Promise<Record<string, any>> => {
  const res = await getMCPCollection(collection.name);

  if (
    res.credentials?.auth_type === AuthTypes.apiKey &&
    !res.credentials.api_key_header_prefix &&
    res.credentials.api_key_value
  )
    res.credentials.api_key_header_prefix = AuthHeaderPrefixes.custom;

  return {
    ...res,
    labels: collection.labels,
    provider: collection.name,
    icon_url: collection.icon_url,
    id: collection.id
  };
};

export const getCollectionDetail = async (collection: {
  type: string;
}): Promise<Record<string, any> | undefined> => {
  if (isCustomTool(collection)) return getCustomCollectionDetail(collection);

  if (isWorkflowTool(collection))
    return getWorkflowCollectionDetail(collection);

  if (isMCPTool(collection)) return getMCPCollectionDetail(collection);

  return undefined;
};
