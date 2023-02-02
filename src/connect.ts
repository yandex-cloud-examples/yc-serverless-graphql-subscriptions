import { Handler } from '@yandex-cloud/function-types'

export const handler: Handler.ApiGateway.WebSocket.Connect = async (event) => {
  const connectionId = event.requestContext.connectionId
  return { statusCode: 200 }
}
