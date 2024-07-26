import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Image2css from 'image2css/vite'
// import PluginImage2css from ''
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Image2css(),
  ],
})
