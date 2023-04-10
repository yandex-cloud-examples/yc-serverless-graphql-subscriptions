import { GraphQLResolveInfo, Kind } from 'graphql'
import isEmpty from 'lodash/fp/isEmpty'
import { Context, Topics } from './context'
import {
  MutationResolvers,
  QueryResolvers,
  Resolvers,
  Subscription,
  SubscriptionResolvers
} from './schema'

const Query: QueryResolvers = {
  me: (parent, args, context) => context.connectionId
}

const Subscription: SubscriptionResolvers<
  Context,
  Partial<Topics> | undefined
> = {
  messages: {
    // TODO Add proper parent typings
    async subscribe(parent, args, contextValue, info) {
      console.log('handling messages')
      let result = {}
      // This is a poor man's check if this is a subscription request
      // or a subscription resolving triggered by pubsub
      if (parent?.messages) {
        if (parent.messages.to === contextValue.connectionId)
          result = parent.messages
      } else {
        await handleSubscription(args, contextValue, info)
      }
      return pseudoAsyncIterator(result)
    },
    resolve: (data: Topics['messages']) => {
      return [data]
    }
  }
}

const Mutation: MutationResolvers = {
  async sendMessage(parent, args, context) {
    const message = {
      from: context.connectionId,
      text: args.text,
      to: args.to
    }
    try {
      await context.pubsub.publish('messages', message)
      return message
    } catch (error) {
      return { connectionId: context.connectionId }
    }
  }
}

const resolvers: Resolvers = {
  Subscription,
  Query,
  Mutation,
  SendMessageResult: {
    __resolveType: (data) =>
      'connectionId' in data ? 'ConnectionNotFound' : 'Message'
  }
}

const handleSubscription = (
  variableValues: Record<string, any>,
  contextValue: Context,
  info: GraphQLResolveInfo
) =>
  contextValue.pubsub.subscribe({
    topic: info.fieldName,
    variableValues,
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

export default resolvers
