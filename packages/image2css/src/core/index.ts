import type {
  Image2cssConfig,
} from './types'

export { createContext } from './mods/context'

export * from './types'
export * from './shared'
export * from './image2css'
export * from './mods'
export function defineConfig(config: Image2cssConfig) {
  return config
}
