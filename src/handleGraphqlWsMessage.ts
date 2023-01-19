import { GraphQLError } from 'graphql'
import {
  MessageType,
  NextMessage,
  SubscribeMessage,
  validateMessage
} from 'graphql-ws'

type ServerMessageTypes =
  | MessageType.Next
  | MessageType.Error
  | MessageType.Pong
  | MessageType.ConnectionAck
  | MessageType.Complete

type ServerMessages = Extract<Messages, { type: ServerMessageTypes }>

type Messages = ReturnType<typeof validateMessage>
export type PayloadHandler = (
  payload: SubscribeMessage['payload']
) => Promise<NextMessage['payload']>

const handleMessage = async (
  message: Messages,
  payloadHandler: PayloadHandler
): Promise<ServerMessages | null> => {
  switch (message.type) {
    case MessageType.ConnectionInit:
      return {
        type: MessageType.ConnectionAck
      }
    case MessageType.Subscribe:
      try {
        return {
          id: message.id,
          type: MessageType.Next,
          payload: await payloadHandler(message.payload)
        }
      } catch (error: unknown) {
        return {
          id: message.id,
          type: MessageType.Error,
          payload: error as GraphQLError[]
        }
      }
    // We only need to cover these two cases
    // because everything else is either incorrect message or asynchronious
    default:
      return null
  }
}

export default handleMessage
