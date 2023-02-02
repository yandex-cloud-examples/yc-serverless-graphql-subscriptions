import { PubSub } from '../pubsub'

export type Context = {
  connectionId: string
  subscriptionId: string
  pubsub: PubSub<Topics>
}

export type Topics = {
  messages: { to: string; text: string }
}
