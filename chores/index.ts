import { writeFile } from 'fs/promises'
import { processFolder } from 'ydb-codegen'
import build from './build'
import entrypoints from './entrypoints'
import generateGraphQL from './graphql-codegen'

const chores = async () => {
  // Generate YDB queries
  const path = './src/queries'
  const result = await processFolder(path)
  await writeFile(`${path}/index.ts`, result)

  // Generate GraphQL
  await generateGraphQL()

  // Build and upload code
  await build(entrypoints)
}

chores().then(console.log)
