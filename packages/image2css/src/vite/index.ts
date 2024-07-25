import type { Image2cssConfig } from '../core/types'
import { createContext } from '../core'
import { creatConfigHMRPlugin, creatImage2cssPlugin } from './plugins'

export function defineConfig(config: Image2cssConfig) {
  return config
}
export default function Image2cssPlugin() {
  // console.log('createContext', createContext)
  const ctx = createContext()
  const plugins = []
  plugins.push(creatConfigHMRPlugin(ctx))
  plugins.push(creatImage2cssPlugin(ctx))
  // plugins.push(creatVirtualModulePlugin(ctx))
  return plugins
}
