import { PubSub } from '../pubsub/pubsub'

export type SerializableContext = {
  connectionId: string
  subscriptionId: string
}

export type Context = {
  pubsub: PubSub<Topics>
} & SerializableContext

export type Topics = {
  messages: { to: string; text: string }
}
