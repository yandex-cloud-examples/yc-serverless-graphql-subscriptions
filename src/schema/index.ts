import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLResolveInfo, Kind } from 'graphql'
import isEmpty from 'lodash/fp/isEmpty'
import { Context } from './context'
import { Resolvers, typeDefs } from './schema'

const resolvers: Resolvers = {
  SendMessageResult: {
    __resolveType: (data) =>
      'connectionId' in data ? 'ConnectionNotFound' : 'Message'
  },
  Query: {
    me: (parent, data, context) => context.connectionId
  },
  Subscription: {
    messages: {
      subscribe(parent, args, contextValue, info) {
        console.log('subscribe')
        console.log(JSON.stringify(parent))
        if (isEmpty(parent)) handleSubscription(info, contextValue)
        return pseudoAsyncIterator({ connectionId: 'kek' })
      },
      resolve(data: unknown) {
        return []
      }
    }
  },
  Mutation: {
    async sendMessage(parent, args, context) {
      await context.pubsub.publish('messages', args)
      try {
        return { from: context.connectionId, text: args.text }
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
    contextValue,
    document: {
      kind: Kind.DOCUMENT,
      definitions: [...Object.values(info.fragments), info.operation]
    }
  })

const pseudoAsyncIterator = async function* <T>(data: T) {
  yield data
}

export default schema
