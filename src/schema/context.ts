import { PubSub } from './../pubsub/pubsub'
import { SubscriptionResolvers } from './schema'

export type SerializableContext = {
  connectionId: string
  subscriptionId: string
}

export type Context = {
  pubsub: PubSub<Topics>
} & SerializableContext

export interface Topics extends Record<keyof SubscriptionResolvers, unknown> {
  messages: {
    from: string
    to: string
    text: string
  }
}
