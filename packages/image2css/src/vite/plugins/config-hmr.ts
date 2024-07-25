import type { Plugin } from 'vite'
import type { Image2cssContext } from '../../core/types'
import { createWatcherCallback, image2css } from '../../core'
import { VIRTUAL_MODULE_ID } from '../constant'

export function creatConfigHMRPlugin(ctx: Image2cssContext): Plugin | undefined {
  const { ready } = ctx
  return {
    name: 'image2css:config',
    async configureServer(server) {
      await ready
      if (!ctx.resolvedConfigPath)
        return

      server.watcher.add(ctx.resolvedConfigPath)
      const watcherCallback = createWatcherCallback(async (p: string) => {
        if (p !== ctx.resolvedConfigPath)
          return

        await ctx.reloadConfig()
        await image2css()

        const virtualModuleId = VIRTUAL_MODULE_ID
        const resolvedVirtualModuleId = `\0${virtualModuleId}`
        const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
        if (!mod)
          return
        server.moduleGraph.invalidateModule(mod)

        server.ws.send({
          type: 'full-reload',
          path: '*',
        })
      })
      server.watcher.on('change', watcherCallback)
    },
  }
}
