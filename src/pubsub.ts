import { execute, ExecutionArgs } from 'graphql'
import { MessageType, NextMessage } from 'graphql-ws'
import websocket from './websocket'
import schema from './schema'
import { Context } from './schema/context'

const createPubSub = (storage: Storage) => ({
  async publish(topic: string, rootValue: ExecutionArgs['rootValue']) {
    console.log('publish')
    const subscriptions = await storage.get(topic)
    const promises = subscriptions.map(async (value) => {
      const data = await execute({
        schema,
        rootValue,
        ...value
      })
      console.log(JSON.stringify(data))
      return sendMessage(
        value.contextValue.connectionId,
        value.contextValue.subscriptionId,
        data
      )
    })
    return Promise.all(promises)
  },
  subscribe(subscription: Subscription) {
    console.log('subscribe')
    storage.persist(subscription).catch((error) => {
      console.log(JSON.stringify(error))
      console.log(JSON.stringify(subscription))
    })
  }
})

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

export type Storage = {
  get(topic: string): Promise<Subscription[]>
  persist: (subscription: Subscription) => Promise<void>
}

export type Subscription = Pick<
  ExecutionArgs,
  'document' | 'variableValues' | 'contextValue'
> & {
  contextValue: Context
  topic: string
}

export default createPubSub
