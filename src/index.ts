import { Handler } from '@yandex-cloud/function-types'
import { execute, parse } from 'graphql'
import { validateMessage } from 'graphql-ws'
import handleMessage from './handleGraphqlWsMessage'
import schema from './schema'

export const handler: Handler.ApiGateway.WebSocket.Message = (event) => {
  let message: ReturnType<typeof validateMessage>
  try {
    const parsed = JSON.parse(event.body)
    message = validateMessage(parsed)
  } catch (error: unknown) {
    console.error(`Invalid message: ${event.body}`)
    console.info((error as Error).toString())
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
