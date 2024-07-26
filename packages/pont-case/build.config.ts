import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // If entries is not provided, will be automatically inferred from package.json
  entries: [
    './src/index.ts',
  ],

  // Change outDir, default is 'dist'
  outDir: 'dist',

  clean: true,
  // Generates .d.ts declaration file
  declaration: true,
  rollup: {
    emitCJS: false,
  },
  failOnWarn: false,
})
