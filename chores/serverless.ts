import { serviceClients, Session } from '@yandex-cloud/nodejs-sdk'
import { CreateFunctionVersionRequest } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/serverless/functions/v1/function_service'
import { OutputFile, Plugin } from 'esbuild'
import JSZip from 'jszip'
import path from 'path'
import entrypoints, { EntrypointConfig } from './entrypoints'
import dotenv from 'dotenv'

const esbuildServerlessPlugin: Plugin = {
  name: 'serverless',
  setup(build) {
    dotenv.config()
    const session = new Session({ oauthToken: process.env.YC_OAUTH_TOKEN! })
    build.onEnd(async (result) => {
      if (result.outputFiles)
        for (const outputFile of result.outputFiles) {
          const { content, filename } = await packPayload(outputFile)
          const entrypointConfig = entrypoints[filename.name]
          if (!entrypointConfig)
            throw new Error('There should be a config for each entrypoint')
          const createVersionRequest = entrypointConfig()
          await uploadFunction(session, createVersionRequest, content)
        }
    })
  }
}

const packPayload = async (outputFile: OutputFile) => {
  console.log('Packing started')
  const zip = new JSZip()
  const filename = path.parse(outputFile.path.split('build')[1])
  console.log(
    `Packing ${outputFile.contents.length} bytes from ${filename.base}`
  )
  zip.file(filename.base, outputFile.contents)
  zip.file(
    'package.json',
    '{ "dependencies": { "@yandex-cloud/nodejs-sdk": "2.3.2" }}'
  )
  const content = await zip.generateAsync({ type: 'nodebuffer' })
  return {
    content,
    filename
  }
}

const uploadFunction = async (
  session: Session,
  entrypointConfig: EntrypointConfig,
  content: Buffer
) => {
  console.log('Uploading function')
  const client = session.client(serviceClients.FunctionServiceClient)
  const createVersionRequest = CreateFunctionVersionRequest.fromPartial({
    ...entrypointConfig,
    content
  })
  await client.createVersion(createVersionRequest)
  console.log('Function uploaded')
}

export default esbuildServerlessPlugin
