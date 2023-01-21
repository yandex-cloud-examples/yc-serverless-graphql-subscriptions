import { makeSchema } from 'nexus'
import {
  mutationType,
  nonNull,
  queryType,
  stringArg,
  subscriptionType,
  unionType
} from 'nexus/dist/core'
import websocket from '../websocket'
import ConnectionNotFound from './ConnectionNotFound'
import Message from './Message'

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
            try {
              await websocket.send(args.connectionId, Buffer.from(args.text))
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
          subscribe() {
            console.log('subscribe')
            return pseudoAsyncIterator()
          },
          resolve() {
            return []
          }
        })
      }
    })
  ]
})

const pseudoAsyncIterator = async function* () {
  while (true) yield {}
}

export default schema
