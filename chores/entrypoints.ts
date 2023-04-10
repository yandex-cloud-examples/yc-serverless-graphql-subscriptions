import {
  EntrypointConfig,
  Entrypoints,
  getFromEnv
} from 'esbuild-plugin-serverless'

const environment = {
  DATABASE_ENDPOINT: getFromEnv('DATABASE_ENDPOINT'),
  DATABASE_NAME: getFromEnv('DATABASE_NAME')
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
  serviceAccountId: getFromEnv('SERVICE_ACCOUNT_ID')
}

const entrypoints: Entrypoints = {
  connect: () => ({
    ...common,
    functionId: getFromEnv('CONNECT_HANDLER_ID'),
    entrypoint: 'connect.handler'
  }),
  message: () => ({
    ...common,
    environment,
    functionId: getFromEnv('MESSAGE_HANDLER_ID'),
    entrypoint: 'message.handler'
  }),
  disconnect: () => ({
    ...common,
    environment,
    functionId: getFromEnv('DISCONNECT_HANDLER_ID'),
    entrypoint: 'disconnect.handler'
  })
}

export default entrypoints
