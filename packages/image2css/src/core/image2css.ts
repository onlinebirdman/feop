import { createContext } from './mods/context'
import { createLockJson } from './mods/lockJson'
import { createImages } from './mods/images'
import { createCssFile } from './mods/css'

export * from './shared'
export async function image2css() {
  const ctx = createContext()
  await ctx.ready
  // image2css.lock.json
  const lockJson = createLockJson(ctx)
  lockJson.ensureLockJsonFile()

  // images & cdnImages
  const images = createImages(ctx)
  lockJson.setImages(await images.scan())
  lockJson.setCdnImages(await images.upload())

  // cssFile
  if (ctx.rawConfig.enableWriteCssFile) {
    const cssFile = createCssFile(ctx)
    cssFile.write()
  }
}
