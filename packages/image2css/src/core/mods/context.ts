import path from 'node:path'
import type { ReadStream } from 'node:fs'
import { loadConfig } from 'unconfig'
import type {
  Image2cssConfig,
  Image2cssContext,
  ImageMeta,
} from '../types'
import print from '../shared/print'

export function createContext() {
  const ready = reloadConfig()
  const defaultConfig: Image2cssConfig = {
    debug: true,
    watchDir: './src/assets/imgs',
    outputDir: './',
    enableWriteCssFile: false,
    outputFile: 'image2css.css',
    lockJsonFile: './image2css.lock.json',
    enableUpload: false,
    hashOrUid: 'hash',
    concurrency: 1,
    uploader: (file: ReadStream, image: ImageMeta) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`remote:${image.route}`)
        }, 1001)
      })
    },
    cssGenerator: (imageMeta: ImageMeta) => {
      const { width, height, cssPath, url, filenameExt, route } = imageMeta
      const unit = 'px'
      let className = `.img-${route.replaceAll('/', '_').replaceAll('.', '_')}`
      if (filenameExt === 'png') {
        className += `, .img-${route.replaceAll('/', '_').split('.')[0]}`
      }
      // a/b/pic9.png -> a_b_pic9_png/a_b_pic9
      // a/b/pic9.jpeg -> a_b_pic9_jpeg
      return `
      ${className} {
        width: ${width}${unit};
        height: ${height}${unit};
        display: block;
        position: relative;
        background-image: url('${url || cssPath}');
        background-size: ${width}${unit} ${height}${unit};
        background-position: 0 0;
        background-repeat: no-repeat;
        box-sizing: border-box;
      }
    `
    },
  }
  let rawConfig = {} as Image2cssConfig
  let configPath = ''
  function resolvePath(route: string | undefined) {
    if (!configPath || !route)
      return ''
    return path.join(path.dirname(configPath), route)
  }
  async function reloadConfig() {
    const { config, sources } = await loadConfig({
      sources: [
        // load from `image2css.config.xx`
        {
          files: 'image2css.config',
          // default extensions
          extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
        },
      ],
      // if false, the only the first matched will be loaded
      // if true, all matched will be loaded and deep merged
      merge: false,
    })
    if (!sources.length) {
      print.warn('未找到image2css.config.{\'ts\'|\'mts\'|\'cts\'|\'js\'|\'mjs\'|\'cjs\'|\'json\'|\'\'}配置文件')
    }
    rawConfig = Object.assign({}, defaultConfig, config)
    configPath = sources[0]

    return rawConfig
  }
  const ctx = {
    get ready() {
      return ready
    },
    get resolvedWatchDir() {
      return resolvePath(rawConfig.watchDir)
    },
    get resolvedOutputDir() {
      return resolvePath(rawConfig.outputDir)
    },
    get resolvedConfigPath() {
      return configPath
    },
    get resolveCssFilePath() {
      const resolvedOutputDir = resolvePath(rawConfig.outputDir)
      return resolvedOutputDir ? path.join(resolvedOutputDir, rawConfig.outputFile || '') : ''
    },
    get rawConfig() {
      return rawConfig
    },
    reloadConfig,
    getConfig() {
      return rawConfig
    },
    getConfigPath() {
      return configPath
    },
    resolvePath,
    log: (msg: string) => {
      if (rawConfig.debug) {
        print.warn(msg)
      }
    },
  } as Image2cssContext
  return ctx
}
