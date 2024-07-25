import path from 'node:path'
import fse from 'fs-extra'
import type { Image2cssContext, ImageMeta } from '../types'
import { createLockJson } from './lockJson'

export function createCssFile(ctx: Image2cssContext) {
  /** 生成css文件 */
  function writeCssFile() {
    const cssContent = cssFileContentGenerator()
    fse.writeFileSync(ctx.resolveCssFilePath, cssContent)
  }

  /** css文件内容生成器 */
  function cssFileContentGenerator() {
    const lockJson = createLockJson(ctx)
    const { images } = lockJson.getLockJsonData()

    if (ctx.rawConfig.enableUpload) {
      // 如果开启了图片上传，给images数组每个image对象设置url
      images.forEach((imageMeta) => {
        if (ctx.rawConfig.hashOrUid === 'uid') {
          imageMeta.url = lockJson.getCdnImageByUid(imageMeta.uid)[0]?.url
        }
        else {
          imageMeta.url = lockJson.getCdnImageByHash(imageMeta.hash)[0]?.url
        }
      })
    }
    return `
      ${images.map((imageMeta) => {
        return ctx.rawConfig?.cssGenerator?.(imageMeta)
      }).join('\n')}
    `
  }
  return {
    write: writeCssFile,
    getContent: cssFileContentGenerator,
  }
}
