import path from 'node:path'
import fse from 'fs-extra'
import type { CdnImage, Image2cssContext, ImageDirMeta, ImageMeta } from '../types'

export function createLockJson(ctx: Image2cssContext) {
  const configFilePath = ctx.resolvedConfigPath
  const filePath = path.join(path.dirname(configFilePath), './image2css.lock.json')
  const outputLockJsonFile = (content: ImageDirMeta) => {
    fse.writeFileSync(filePath, JSON.stringify(content, null, 2))
  }

  const getLockJsonData = (): ImageDirMeta => {
    // TODO: 添加缓存优化避免每次都读文件
    const lockJsonData = fse.readJsonSync(filePath)
    return {
      images: [],
      cdnImages: [],
      ...lockJsonData,
    }
  }

  const ensureLockJsonFile = () => {
    if (fse.existsSync(filePath)) {
      return
    }
    // 确保文件存在
    fse.ensureFileSync(filePath)
    // 写入初始内容
    outputLockJsonFile({
      images: [],
      cdnImages: [],
    })

    ctx.log('image2css.lock.json文件已初始化成功')
  }

  const setImages = (images: ImageMeta[]) => {
    const jsonData = getLockJsonData() as ImageDirMeta
    outputLockJsonFile({
      ...jsonData,
      images,
    })
    ctx.log(`image2css.lock.json文件已更新,images(${images.length})`)
  }

  const setCdnImages = (cdnImages: CdnImage[]) => {
    if (!cdnImages || !cdnImages.length)
      return
    const jsonData = getLockJsonData() as ImageDirMeta

    outputLockJsonFile({
      ...jsonData,
      cdnImages: jsonData.cdnImages.concat(cdnImages),
    })
    ctx.log(`image2css.lock.json文件已更新,cdnImages(${cdnImages.length})`)
  }

  function getCdnImageByUid(uid: string) {
    const cdnImages = getLockJsonData().cdnImages
    return cdnImages.filter(item => item.imageUid === uid)
  }
  function getCdnImageByHash(hash: string) {
    const { cdnImages, cdnUrls } = getLockJsonData()
    // cdnUrls 是为了兼容使用了旧版本的项目
    if (cdnUrls) {
      const url = cdnUrls[hash]
      return [
        {
          url,
          imageHash: hash,
          imageUid: null,
        },
      ]
    }
    return cdnImages.filter(item => item.imageHash === hash)
  }
  return {
    getLockJsonData,
    ensureLockJsonFile,
    setImages,
    setCdnImages,
    getCdnImageByUid,
    getCdnImageByHash,
  }
}
