import { Session } from '@yandex-cloud/nodejs-sdk'
import {
  DisconnectRequest,
  SendToConnectionRequest,
  SendToConnectionRequest_DataType
} from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/serverless/apigateway/websocket/v1/connection_service'
import { WebSocketConnectionServiceClient } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/service_clients'

// We authorize from metadata
const session = new Session()
const websocket = session.client(WebSocketConnectionServiceClient)

export default {
  disconnect(connectionId: string) {
    websocket.disconnect(
      DisconnectRequest.fromPartial({
        connectionId
      })
    )
  },
  send(
    connectionId: string,
    data: Buffer,
    type: SendToConnectionRequest_DataType = SendToConnectionRequest_DataType.TEXT
  ) {
    return websocket.send(
      SendToConnectionRequest.fromPartial({
        connectionId,
        data,
        type
      })
    )
  }
}
