import { Handler } from '@yandex-cloud/function-types'
import database from './database'
import { executeRemoveSubscriptions } from './queries'

export const handler: Handler.ApiGateway.WebSocket.Disconnect = async (
  event
) => {
  const connectionId = event.requestContext.connectionId
  await executeRemoveSubscriptions(database, { connectionId })
  return { statusCode: 200 }
}
