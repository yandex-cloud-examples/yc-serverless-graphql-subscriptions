import { Handler } from '@yandex-cloud/function-types'
import { execute, parse } from 'graphql'
import { validateMessage } from 'graphql-ws'
import handleMessage from './handleGraphqlWsMessage'
import schema from './schema'
import websocket from './websocket'

export const handler: Handler.ApiGateway.WebSocket.Message = async (event) => {
  let message: ReturnType<typeof validateMessage>
  try {
    const parsed = JSON.parse(event.body)
    message = validateMessage(parsed)
  } catch (error: unknown) {
    console.error(`Invalid message: ${event.body}`)
    // As per specification https://github.com/enisdenjo/graphql-ws/blob/master/PROTOCOL.md#invalid-message
    // we should break the connection if the message is invalid
    websocket.disconnect(event.requestContext.connectionId)
    return {
      statusCode: 400
    }
  }

  const contextValue = { connectionId: event.requestContext.connectionId }

  const payload = handleMessage(message, async (payload) =>
    execute({
      schema,
      contextValue,
      document: parse(payload.query),
      variableValues: payload.variables,
      operationName: payload.operationName
    })
  )

  return {
    statusCode: 200,
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}
