import path from 'node:path'
import Jimp from 'jimp'
import md5 from 'md5'
import fastGlob from 'fast-glob'
import fse from 'fs-extra'
import PQueue from 'p-queue'
import type { CdnImage, Image2cssConfig, Image2cssContext, ImageMeta, ImageUploader } from '../types'
import { createSingleLineLogger, findImages, uniqBy } from '../shared'
import { createLockJson } from './lockJson'

export function createImages(ctx: Image2cssContext) {
  async function scanDirImages() {
    const dir = ctx.resolvedWatchDir
    const outputDir = ctx.resolvedOutputDir
    // All images in target directory
    const imageFilePaths = await findImages(dir)
    const images: ImageMeta[] = []
    for (const index in imageFilePaths) {
      const filePath = imageFilePaths[index]
      // Read image
      const image = await Jimp.read(filePath)

      const route = path.relative(dir, filePath)
      const hash = md5(image.bitmap.data)
      const filename = path.basename(route, path.extname(route))
      const ext = path.extname(route)
      const imageInfo: ImageMeta = {
        cssPath: path.relative(outputDir, filePath),
        hash,
        filename,
        width: image.bitmap.width,
        height: image.bitmap.height,
        ext: image.getExtension(),
        filenameExt: route.split('.').pop() || '',
        size: image.bitmap.data.length,
        route,
        uid: md5(`${route}_${filename}_${hash}_${ext}`),
        url: '',
      }

      images.push(imageInfo)
    }

    return images
  }

  /** upload images to cdn */
  async function upload() {
    const imageUrls = [] as CdnImage[]
    if (ctx.rawConfig.enableUpload) {
      if (!ctx.rawConfig.uploader) {
        ctx.log('uploader is not defined')
        return imageUrls
      }
      const lockJson = createLockJson(ctx)
      const { images, cdnImages } = lockJson.getLockJsonData()

      const imagesUnuploaded = []
      if (ctx.rawConfig.hashOrUid === 'uid') {
        imagesUnuploaded.push(
          ...images.filter((image) => {
            return !cdnImages.find(cdnImage => cdnImage.imageUid === image.uid)
          }),
        )
      }
      else {
      // 根据图片hash去重后再过滤
        imagesUnuploaded.push(
          ...uniqBy(images, image => image.hash).filter((image) => {
            return !cdnImages.find(cdnImage => cdnImage.imageHash === image.hash)
          }),
        )
      }

      if (imagesUnuploaded.length === 0)
        return imageUrls

      // 创建图片上传任务
      const tasks = imagesUnuploaded.map((image) => {
        return async () => {
          try {
            const filePath = path.join(ctx.resolvedWatchDir, image.route)
            const file = await fse.createReadStream(filePath)
            const url = await ctx.rawConfig?.uploader?.(file, image)
            imageUrls.push({
              imageHash: image.hash || '', // undefined 文件写入的时候会被吞掉
              imageUid: image.uid,
              url: url || '',
            })
          }
          catch (error) {
            ctx.log(`图片${image.filename}上传失败: ${JSON.stringify({ error })}`)
          }
        }
      })

      // 进度打印
      const singleLineLogger = createSingleLineLogger()

      // 任务并发管理
      const queue = new PQueue({ concurrency: ctx.rawConfig.concurrency })
      queue.on('next', () => {
        singleLineLogger.next((index: number) => `upload images(${index}/${tasks.length})...`)
      })
      queue.on('empty', () => {
        singleLineLogger.succeed(`upload images done!(${tasks.length})`)
      })
      await queue.addAll(tasks)
    }
    else {
      // logger('skip upload images!')
    }
    return imageUrls
  }
  return {
    scan: scanDirImages,
    upload,
  }
}

// export default findImages
