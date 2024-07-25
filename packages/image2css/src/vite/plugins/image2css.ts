import type { Plugin } from 'vite'
import _ from 'lodash'
import type { Image2cssContext } from '../../core/types'
import { createCssFile, createImages, createLockJson, createWatcherCallback, image2css } from '../../core'
import { VIRTUAL_MODULE_ID } from '../constant'

export function creatImage2cssPlugin(ctx: Image2cssContext): Plugin | undefined {
  const { ready } = ctx
  const virtualModuleId = VIRTUAL_MODULE_ID
  const resolvedVirtualModuleId = `\0${virtualModuleId}`
  return {
    name: 'image2css:base',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        await ready
        const cssFile = createCssFile(ctx)
        return {
          code: cssFile.getContent(),
          map: null,
        }
      }
    },
    async configureServer(server) {
      if (!ctx.resolvedWatchDir)
        return
      console.log('[image2csss]: watching on ', ctx.resolvedWatchDir)

      const watcherCallback = createWatcherCallback(async () => {
        await image2css()

        const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
        if (!mod)
          return

        console.log('[image2csss]: update!!!')
        server.moduleGraph.invalidateModule(mod)

        // TODO: 现在是整个页面刷新，需要优化成局部刷新
        server.ws.send({
          type: 'full-reload',
          path: '*',
        })
      })
      server.watcher.add(ctx.resolvedWatchDir)
      // change事件不包含文件删除
      server.watcher.on('change', (p: string) => {
        if (!p.startsWith(ctx.resolvedWatchDir))
          return
        watcherCallback()
      })
      await ready
      watcherCallback()
    },
  }
}
