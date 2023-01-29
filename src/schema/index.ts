import { GraphQLResolveInfo, Kind } from 'graphql'
import { isEmpty } from 'lodash'
import { makeSchema } from 'nexus'
import {
  mutationType,
  nonNull,
  queryType,
  stringArg,
  subscriptionType,
  unionType
} from 'nexus/dist/core'
import createPubSub from '../pubsub'
import ydbStorage from '../ydbStorage'
import ConnectionNotFound from './ConnectionNotFound'
import { Context } from './context'
import Message from './Message'

const pubsub = createPubSub(ydbStorage)

// For simplicity we use code-first approach to schema.
// Alternatively one can use tools like graphql-codegen
// for schema-frist (SDL-first) approach
const schema = makeSchema({
  outputs: {
    typegen: __dirname + '/typings.ts',
    schema: __dirname + '/schema.graphql'
  },
  contextType: {
    module: __dirname + '/context.ts',
    export: 'Context'
  },
  types: [
    Message,
    ConnectionNotFound,
    unionType({
      name: 'SendMessageResult',
      definition(t) {
        t.members('Message', 'ConnectionNotFound')
      },
      resolveType(data) {
        if ('connectionId' in data) return 'ConnectionNotFound'
        return 'Message'
      }
    }),
    queryType({
      definition(t) {
        t.nonNull.string('me', {
          resolve: (parent, args, context) => context.connectionId
        })
      }
    }),
    mutationType({
      definition(t) {
        t.field('sendMessage', {
          type: nonNull('SendMessageResult'),
          args: {
            connectionId: nonNull(stringArg()),
            text: nonNull(stringArg())
          },
          async resolve(parent, args, context) {
            await pubsub.publish('messages', { kek: 'plek' })
            try {
              return { from: context.connectionId, text: args.text }
            } catch (error) {
              return { connectionId: context.connectionId }
            }
          }
        })
      }
    }),
    subscriptionType({
      definition(t) {
        t.list.field('messages', {
          type: 'Message',
          subscribe(parent, args, contextValue, info) {
            console.log('subscribe')
            console.log(JSON.stringify(parent))
            if (isEmpty(parent)) handleSubscription(info, contextValue)
            return pseudoAsyncIterator({ connectionId: 'kek' })
          },
          resolve(data) {
            return [
              {
                from: data.connectionId,
                text: 'plek'
              }
            ]
          }
        })
      }
    })
  ]
})

const handleSubscription = (info: GraphQLResolveInfo, contextValue: Context) =>
  pubsub.subscribe({
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
