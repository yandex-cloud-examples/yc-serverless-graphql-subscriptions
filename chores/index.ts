import build from './build'
import { processFolder } from 'ydb-codegen'
import { writeFile } from 'fs/promises'
import entrypointsConfig from './entrypoints'
import generateGraphQL from './graphql-codegen'

const chores = async () => {
  // Generate YDB queries
  const path = './src/queries'
  const result = await processFolder(path)
  await writeFile(`${path}/index.ts`, result)

  // Generate GraphQL
  await generateGraphQL()

  // Build and upload code
  const entrypoints = Object.keys(entrypointsConfig)
  await build(entrypoints.map((entrypoint) => `./src/${entrypoint}`))
}

chores().then(console.log)
