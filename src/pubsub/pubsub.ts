import { ExecutionArgs, subscribe } from 'graphql'
import { MessageType, NextMessage } from 'graphql-ws'
import schema from '../schema'
import { SerializableContext } from '../schema/context'
import websocket from '../services/websocket'

// This dumb pubsub requires a storage that implements getters for the subsciption topics
const createPubSub: CreatePubSub = (storage) => ({
  async publish(topic, data) {
    console.log('publish')
    const subscriptions = await storage.get[topic](data)
    console.log(subscriptions.length)
    const promises = subscriptions.map(async (subscription) => {
      const iterator = await subscribe({
        schema,
        rootValue: { [topic]: data },
        ...subscription
      })
      // FIXME this loop actually is not needed
      // the only reason it is present is GraphQL Schema
      // requirement for using async iterators as a subscription response
      // @ts-ignore
      for await (const item of iterator)
        await sendMessage(
          subscription.contextValue.connectionId,
          subscription.contextValue.subscriptionId,
          item
        )
      return
    })
    return Promise.all(promises)
  },
  async subscribe(subscription) {
    console.log('subscribe')
    console.log('data', JSON.stringify(subscription))
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

export type CreatePubSub = <T extends Topics>(storage: Storage<T>) => PubSub<T>

export type Storage<T extends Topics> = {
  get: { [K in keyof T]: (args: T[K]) => Promise<Subscription[]> }
  persist: (subscription: Subscription) => Promise<void>
}

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
