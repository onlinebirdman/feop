import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  name: 'ESM only',
  entries: [
    'src/core',
    'src/vite',
  ],
  clean: false,
  declaration: true,
  externals: [
    'vite',
    'astro',
  ],
})
