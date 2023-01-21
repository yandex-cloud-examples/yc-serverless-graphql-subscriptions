import { makeSchema } from 'nexus'
import {
  mutationType,
  nonNull,
  objectType,
  queryType,
  stringArg,
  subscriptionType
} from 'nexus/dist/core'

// For simplicity we use code-first approach to schema.
// Alternatively one can use tools like graphql-codegen
// for schema-frist (SDL-first) approach
const schema = makeSchema({
  outputs: {
    typegen: __dirname + '/typings.ts',
    schema: __dirname + '/schema.graphql'
  },
  types: [
    objectType({
      name: 'Message',
      definition(t) {
        t.string('from')
        t.string('text')
      }
    }),
    queryType({
      definition(t) {
        t.string('me')
      }
    }),
    mutationType({
      definition(t) {
        t.field('sendMessage', {
          type: 'Message',
          args: {
            connectionId: nonNull(stringArg()),
            text: nonNull(stringArg())
          },
          resolve(parent, args) {
            return {}
          }
        })
      }
    }),
    subscriptionType({
      definition(t) {
        t.field('messages', {
          type: 'Message',
          subscribe() {
            return pseudoAsyncIterator()
          },
          resolve() {
            return {}
          }
        })
      }
    })
  ]
})

export type Context = {
  connectionId: string
}

const pseudoAsyncIterator = async function* () {
  while (true) yield {}
}

export default schema
