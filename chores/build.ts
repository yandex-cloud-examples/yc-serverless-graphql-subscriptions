import { context as createContext } from 'esbuild'
import { Entrypoints, esbuildServerlessPlugin } from 'esbuild-plugin-serverless'

const build = async (entryPointsConfig: Entrypoints) => {
  process.env.NODE_ENV = 'PRODUCTION'
  const entryPoints = Object.keys(entryPointsConfig).map(
    (entrypoint) => `./src/${entrypoint}`
  )
  const context = await createContext({
    entryPoints,
    bundle: true,
    minify: true,
    platform: 'node',
    target: 'node16',
    external: ['@yandex-cloud/nodejs-sdk'],
    treeShaking: true,
    outdir: 'build',
    write: false,
    plugins: [esbuildServerlessPlugin(entryPointsConfig)]
  })
  await context.watch()
}

export default build
