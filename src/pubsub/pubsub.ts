import { ExecutionArgs, subscribe } from 'graphql'
import { MessageType, NextMessage } from 'graphql-ws'
import schema from '../schema'
import { SerializableContext } from '../schema/context'
import websocket from '../services/websocket'

const createPubSub: CreatePubSub = (storage) => ({
  async publish(topic, rootValue) {
    console.log('publish')
    const subscriptions = await storage.get[topic](rootValue)
    const promises = subscriptions.map(async (value) => {
      const data = await subscribe({
        schema,
        rootValue,
        ...value
      })
      // FIXME this loop actually is not needed
      // the only reason it is present is GraphQL Schema
      // requirement for using async iterators as a subscription response
      // @ts-ignore
      for await (const d of data)
        await sendMessage(
          value.contextValue.connectionId,
          value.contextValue.subscriptionId,
          d
        )
      return
    })
    return Promise.all(promises)
  },
  async subscribe(subscription) {
    console.log('subscribe')
    storage.persist(subscription)
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
    payload: data
  }
  return websocket.send(connectionId, Buffer.from(JSON.stringify(payload)))
}

export type Storage<T extends Topics> = {
  get: { [K in keyof T]: (args: T[K]) => Promise<Subscription[]> }
  persist: (subscription: Subscription) => Promise<void>
}

export type CreatePubSub = <T extends Topics>(storage: Storage<T>) => PubSub<T>

export type PubSub<T extends Topics> = {
  publish(topic: keyof T, rootValue: T[typeof topic]): Promise<void[]>
  subscribe(subscription: Subscription): Promise<void>
}

export type Subscription = Pick<
  ExecutionArgs,
  'document' | 'variableValues'
> & {
  contextValue: SerializableContext
  topic: string
}

export type Topics = Record<string, any>

export default createPubSub
