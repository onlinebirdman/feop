# @feop/image2css

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
  enableWriteCssFile: false,
  // ...other options
})
```
