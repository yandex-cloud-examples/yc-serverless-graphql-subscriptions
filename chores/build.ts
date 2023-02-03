import { context as createContext } from 'esbuild'
import esbuildServerlessPlugin from './serverless'

const build = async (entryPoints: string[]) => {
  process.env.NODE_ENV = 'PRODUCTION'
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
    plugins: [esbuildServerlessPlugin]
  })
  await context.watch()
}

export default build
