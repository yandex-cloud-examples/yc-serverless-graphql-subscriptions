import { subscribe, ExecutionArgs } from 'graphql'
import { MessageType, NextMessage } from 'graphql-ws'
import websocket from './websocket'
import schema from './schema'
import { Context } from './schema/context'
import { SendToConnectionResponse } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/serverless/apigateway/websocket/v1/connection_service'

const createPubSub: CreatePubSub = (storage) => ({
  async publish(topic, rootValue) {
    console.log('publish')
    const subscriptions = await storage.get(topic as string)
    const promises = subscriptions.map(async (value) => {
      const data = await subscribe({
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
    payload: { data }
  }
  return websocket.send(connectionId, Buffer.from(JSON.stringify(payload)))
}

export type Storage = {
  get(topic: string): Promise<Subscription[]>
  persist: (subscription: Subscription) => Promise<void>
}

export type CreatePubSub = <T extends Topics>(storage: Storage) => PubSub<T>

export type PubSub<T extends Topics> = {
  publish(
    topic: keyof T,
    rootValue: T[typeof topic]
  ): Promise<SendToConnectionResponse[]>
  subscribe(subscription: Subscription): Promise<void>
}

export type Subscription = Pick<
  ExecutionArgs,
  'document' | 'variableValues' | 'contextValue'
> & {
  contextValue: Context
  topic: string
}

export type Topics = Record<string, unknown>

export default createPubSub
