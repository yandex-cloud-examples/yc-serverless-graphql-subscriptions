import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLResolveInfo, Kind } from 'graphql'
import isEmpty from 'lodash/fp/isEmpty'
import { Context, Topics } from './context'
import {
  Resolvers,
  Subscription,
  SubscriptionResolvers,
  typeDefs
} from './schema'

const Subscription: SubscriptionResolvers = {
  messages: {
    // TODO Add proper parent typings
    subscribe(parent, args, contextValue, info) {
      console.log('subscribe')
      if (isEmpty(parent)) handleSubscription(info, contextValue)
      return pseudoAsyncIterator(parent)
    },
    resolve: (data: Topics['messages']) => {
      console.log('resolve')
      return [data]
    }
  }
}

const resolvers: Resolvers = {
  Subscription,
  SendMessageResult: {
    __resolveType: (data) =>
      'connectionId' in data ? 'ConnectionNotFound' : 'Message'
  },
  Query: {
    me: (parent, data, context) => context.connectionId
  },
  Mutation: {
    async sendMessage(parent, args, context) {
      const message = {
        from: context.connectionId,
        text: args.text,
        to: args.to
      }
      await context.pubsub.publish('messages', message)
      try {
        return message
      } catch (error) {
        return { connectionId: context.connectionId }
      }
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const handleSubscription = (info: GraphQLResolveInfo, contextValue: Context) =>
  contextValue.pubsub.subscribe({
    topic: info.fieldName,
    contextValue: {
      connectionId: contextValue.connectionId,
      subscriptionId: contextValue.subscriptionId
    },
    document: {
      kind: Kind.DOCUMENT,
      definitions: [...Object.values(info.fragments), info.operation]
    }
  })

const pseudoAsyncIterator = async function* <T>(data: T) {
  yield data
}

export default schema
