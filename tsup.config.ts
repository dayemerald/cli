import { defineConfig} from 'tsup'

export default defineConfig({
    clean: true,
    bundle: true,
    entry: ['./src/**/*.ts'],
    outDir: 'dist',
    dts: true,
    treeshake: true,
    target: ['node20'],
    format: ['esm'],
    // outExtension: ({ format }) => ({
    //     js: '.js'
    // })
})
