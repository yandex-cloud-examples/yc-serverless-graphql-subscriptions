import { execute, ExecutionArgs } from 'graphql'
import { MessageType, NextMessage } from 'graphql-ws'
import websocket from './websocket'
import schema from './schema'
import { Context } from './schema/context'

const pubsub = {
  publish(topic: string, rootValue: ExecutionArgs['rootValue']) {
    const subscriptions = getSubscriptions(topic)
    const promises = subscriptions.map(async (value) => {
      const data = await execute({
        schema,
        rootValue,
        ...value
      })
      return sendMessage(
        value.contextValue.connectionId,
        value.contextValue.subscriptionId,
        data
      )
    })
    return Promise.all(promises)
  },
  subscribe(topic: string, subscription: Subscription) {
    persist({ topic, ...subscription })
  }
}

const getSubscriptions = (topic: string): Subscription[] => {
  return []
}

const persist = (payload: Subscription & { topic: string }) => {}

const sendMessage = async (
  connectionId: string,
  subscriptionId: string,
  data: Record<string, any>
) => {
  const payload: NextMessage = {
    id: subscriptionId,
    type: MessageType.Next,
    payload: { data }
  }
  return websocket.send(connectionId, Buffer.from(JSON.stringify(payload)))
}

type Subscription = Pick<
  ExecutionArgs,
  'document' | 'variableValues' | 'contextValue' | 'operationName'
> & {
  contextValue: Context
}

export default pubsub
