import { Handler } from '@yandex-cloud/function-types'
import {
  execute,
  ExecutionArgs,
  getOperationAST,
  OperationTypeNode,
  parse,
  subscribe
} from 'graphql'
import { SubscribeMessage, validateMessage } from 'graphql-ws'
import handleMessage from './handleGraphqlWsMessage'
import schema from './schema'
import websocket from './websocket'

export const handler: Handler.ApiGateway.WebSocket.Message = async (event) => {
  let message: ReturnType<typeof validateMessage>
  try {
    const parsed = JSON.parse(event.body)
    message = validateMessage(parsed)
  } catch (error: unknown) {
    console.error(error)
    console.error(`Invalid message: ${event.body}`)
    // As per specification https://github.com/enisdenjo/graphql-ws/blob/master/PROTOCOL.md#invalid-message
    // we should break the connection if the message is invalid
    websocket.disconnect(event.requestContext.connectionId)
    // FIXME how do we disconnect with error code?
    return {
      statusCode: 400
    }
  }

  const payload = await handleMessage(message, (payload) =>
    handlePayload(payload, event.requestContext.connectionId)
  )

  return {
    statusCode: 200,
    ...(payload && {
      body: JSON.stringify(payload)
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

const handlePayload = async (
  message: SubscribeMessage,
  connectionId: string
) => {
  const { payload } = message
  const document = parse(payload.query)
  const operation = getOperationAST(document, payload.operationName)
  const contextValue = {
    connectionId,
    subscriptionId: message.id
  }
  const executeArgs: ExecutionArgs = {
    schema,
    contextValue,
    document,
    variableValues: payload.variables,
    operationName: payload.operationName
  }
  if (operation?.operation === OperationTypeNode.SUBSCRIPTION) {
    console.log('subscription')
    await subscribe(executeArgs)
    return null
  }
  return execute(executeArgs)
}
