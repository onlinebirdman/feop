import type { ReadStream } from 'node:fs'

/** 配置选项 */
export interface Image2cssConfig {
  /** debug mode */
  debug?: boolean
  /** 监听目录 */
  watchDir?: string
  /** 输出目录 */
  outputDir?: string
  /** 输出文件名 */
  outputFile?: string
  /** 是否开启css文件写入 */
  enableWriteCssFile?: boolean
  /** 锁定文件名 */
  lockJsonFile?: string
  /** 图片上传器 */
  uploader?: ImageUploader
  /** 是否上传图片 */
  enableUpload?: boolean
  /**
   * 默认根据hash还是uid来确认cdnImage的url
   * 假如同一张图片a.png 同时存在于 imgs/a.png 和 imgs/icons/a.png中
   * 如果使用hash模式，两个图片会使用同一个cdnImageUrl
   * 如果使用uid模式，两个图片会使用不同的cdnImageUrl
   */
  hashOrUid?: 'hash' | 'uid'
  /** 上传图片时的并发数 */
  concurrency?: number
  /** 单个图片的css代码生成器 */
  cssGenerator?: CssCodeGenerator
  /** css 单位 */
  unit?: string
}

export interface ImageUploader {
  (file: ReadStream, image: ImageMeta): Promise<string>
}
export interface CssCodeGenerator {
  (imageMeta: ImageMeta): string
}
/** 图片后缀名 */
export type ImageExt = 'jpg' | 'png' | 'gif' | 'webp'

/** 图片meta信息 */
export interface ImageMeta {
  width: number
  height: number
  /** 图片文件内容的后缀 */
  ext: string
  /** 图片文件名称上的后缀 */
  filenameExt: string
  /** 图片文件名（不含后缀） */
  filename: string
  /** 图片文件大小(kb) */
  size: number
  /** 文件相对css文件的路径 */
  cssPath: string
  /** 文件相对路径，相对于图片目录 */
  route: string
  /** 图片md5 */
  hash: string
  /** 图片uid，route_filename_md5 */
  uid: string
  /** 图片url */
  url: string
}

/** 图片目录信息 */
export interface ImageDirMeta {
  /** 全部图片的基础信息 */
  images: ImageMeta[]
  /** cdn图片列表 */
  cdnImages: CdnImage[]
  /** cdn图片列表(兼容旧项目) */
  cdnUrls?: {
    [key: string]: string
  }
}

/** cdn图片对象 */
export interface CdnImage {
  imageUid: ImageMeta['uid']
  imageHash: ImageMeta['hash']
  url: string
}
export interface Image2cssContext {
  ready: Promise<Image2cssConfig>
  /** 用户传入的配置 */
  rawConfig: Image2cssConfig
  /** 解析后的监听目录-绝对路径 */
  resolvedWatchDir: string
  /** 解析后的输出目录-绝对路径 */
  resolvedOutputDir: string
  /** 解析后的配置文件路径-绝对路径 */
  resolvedConfigPath: string
  /** css文件输出路径 */
  resolveCssFilePath: string

  /** 重载配置 */
  reloadConfig: () => Promise<Image2cssConfig>

  /** logger */
  log: (msg: string) => void
}
