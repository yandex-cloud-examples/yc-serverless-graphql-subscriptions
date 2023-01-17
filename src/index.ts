import { Handler } from '@yandex-cloud/function-types'

const handler: Handler.ApiGateway.WebSocket.Message = () => {
  return {
    statusCode: 200
  }
}
