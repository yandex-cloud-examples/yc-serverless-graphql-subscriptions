import { Handler } from '@yandex-cloud/function-types'

export const handler: Handler.ApiGateway.WebSocket.Connect = async (event) => {
  const connectionId = event.requestContext.connectionId
  const protocol = event.headers[wsProtocolHeader.key]
  console.log(JSON.stringify({ connectionId, protocol }))
  return {
    statusCode: 200,
    headers: {
      // This is critical for correct behavior of GraphQL Subscriptions clients
      [wsProtocolHeader.key]: wsProtocolHeader.value
    }
  }
}

const wsProtocolHeader = {
  key: 'Sec-Websocket-Protocol',
  value: 'graphql-transport-ws'
}
