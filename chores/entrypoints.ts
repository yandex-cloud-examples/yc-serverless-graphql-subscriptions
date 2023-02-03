import { CreateFunctionVersionRequest } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/serverless/functions/v1/function_service'
import dotenv from 'dotenv'
dotenv.config()

const environment = {
  DATABASE_ENDPOINT: process.env.DATABASE_ENDPOINT!,
  DATABASE_NAME: process.env.DATABASE_NAME!
}

const common: EntrypointConfig = {
  runtime: 'nodejs16',
  tag: ['latest'],
  resources: {
    $type: 'yandex.cloud.serverless.functions.v1.Resources',
    memory: 128 * 1024 * 1024
  },
  executionTimeout: {
    $type: 'google.protobuf.Duration',
    seconds: 5,
    nanos: 0
  },
  serviceAccountId: process.env.SERVICE_ACCOUNT_ID!
}

const entrypoints: Entrypoints = {
  connect: () => ({
    ...common,
    functionId: process.env.CONNECT_HANDLER_ID!,
    entrypoint: 'connect.handler'
  }),
  message: () => ({
    ...common,
    environment,
    functionId: process.env.MESSAGE_HANDLER_ID!,
    entrypoint: 'message.handler'
  }),
  disconnect: () => ({
    ...common,
    environment,
    functionId: process.env.DISCONNECT_HANDLER_ID!,
    entrypoint: 'disconnect.handler'
  })
}

export type EntrypointConfig = Partial<CreateFunctionVersionRequest>
export type Entrypoints = Record<string, () => EntrypointConfig>

export default entrypoints
