// 全局类型定义 - 统一放置所有全局接口声明
export interface VariableItem {
  name: string
  value: any
  value_type: string
}

export interface SchemaItem {
  id: string
  title: string
  [key: string]: any
}

export interface SaveData {
  schemaList: SchemaItem[]
}

export interface AmisEditorProps {
  isWujie?: boolean
  theme?: string
  url?: string
  token?: string | null
  canEdit?: boolean
  preview?: boolean
  appId?: string
  toolList?: ToolListItem[]
  variables?: VariableItem[]
  schemaList?: SchemaItem[]
  onSave?: (data: SaveData) => void | Promise<void>
}

// Editor 组件专用的类型定义
export interface VariableSchema {
  type: string
  $id: string
  properties: Record<string, {
    type: string
    title: string
    default: any
  }>
}

export interface VariableItemSchema {
  name: string
  title: string
  parentId: string
  order: number
  schema: VariableSchema
}

export interface EditorType {
  EDITOR: string
  MOBILE: string
  FORM: string
}

export interface LanguageOption {
  label: string
  value: string
}

// Schema 相关的类型定义
export interface DefaultSchema {
  type: string
  title: string
  regions: string[]
  body: any[]
}

export interface FormSchema {
  type: string
  fields: any[]
}

// 工具列表项定义
export interface ToolListItem {
  name: string
  icon?: string
  description?: string
  [key: string]: any
}

declare global {
  interface Window {
    $wujie?: {
      props?: {
        isWujie?: boolean
        amisEditorProps?: AmisEditorProps
      }
      bus?: {
        $emit: (event: string, data: any) => void
      }
      location?: Location
    }
    amisData?: {
      toolLists?: any[]
      [key: string]: any
    }
  }
}