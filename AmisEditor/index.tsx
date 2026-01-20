import { AlertComponent, ContextMenu, ToastComponent } from 'amis'
import React, { Suspense, lazy, useMemo } from 'react'
import type { AmisEditorProps } from './types/global'

/**
 * 默认主题配置
 * 备注: 如果需要改用antd主题，还需要将index.html换成index-antd.html
 */
const DEFAULT_THEME = 'cxd' as const

/**
 * App组件 - amis可视化编辑器示例应用
 *
 * 优化说明:
 * 1. 使用函数组件替代类组件，提高代码简洁性和可读性
 * 2. 提取常量DEFAULT_THEME，避免硬编码字符串
 * 3. 使用useMemo优化主题配置，避免不必要的重新计算
 * 4. 添加TypeScript类型定义，提高代码健壮性
 */

type Props = {} & AmisEditorProps
const LazyComponent = lazy(() => import('./Editor'))
const App: React.FC<Props> = (props: Props) => {
  // 使用useMemo缓存主题配置，避免每次渲染都重新创建
  const themeConfig = useMemo(
    () => ({
      theme: DEFAULT_THEME,
      components: {
        ToastComponent,
        AlertComponent,
        ContextMenu,
      },
    }),
    [],
  )

  window.amisData = {}

  // 子包引入时兼容wujie参数
  if (!window.$wujie?.props?.isWujie) {
    window.$wujie = {
      props: {
        isWujie: props.isWujie || false,
        amisEditorProps: {
          ...props,
        },
      },
    }
  }
  const { toolList = [] } = window.$wujie.props?.amisEditorProps || {}
  window.amisData.toolLists = toolList

  return (
    <div className="editor-wrapper">
      {/* 头部导航栏容器 */}
      {!props.preview && <div id="headerBar" className="Editor-header"></div>}

      {/* 主编辑器组件 */}
      <Suspense fallback={<div></div>}>
        <LazyComponent
          {...props}
          theme={themeConfig.theme}
          isWujie={props.isWujie || false}
        />
      </Suspense>

      {/* 全局提示组件 */}
      <ToastComponent theme={themeConfig.theme} />

      {/* 全局警告组件 */}
      <AlertComponent theme={themeConfig.theme} />

      {/* 上下文菜单组件 */}
      <ContextMenu theme={themeConfig.theme} />
    </div>
  )
}

export default App
