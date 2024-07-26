# @feop/image2css/vite

# base usage

## config vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Image2css from '@feop/image2css/vite'

export default defineConfig({
  plugins: [
    vue(),
    Image2css(),
  ],
  // ...other options
})
```

## config image2css

```ts
// image2css.config.{ts,js,json}
import { defineConfig } from '@feop/image2css'

export default defineConfig({
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
})
```
