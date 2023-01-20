import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'

// For simplicity we use code-first approach to schema.
// Alternatively one can use tools like graphql-codegen
// for schema-frist approach
const schema = new GraphQLSchema({
  query: new GraphQLObjectType<unknown, Context>({
    name: 'query',
    fields: {
      me: {
        type: GraphQLString,
        resolve: (parent, args, context) => context.connectionId
      }
    }
  }),
  subscription: new GraphQLObjectType<unknown, Context>({
    name: 'subscription',
    fields: {
      messages: {
        subscribe: (parent) => {
          console.log('subscribe')
          return pseudoAsyncIterator()
        },
        type: new GraphQLObjectType<unknown, Context>({
          name: 'messages',
          fields: {
            from: {
              type: GraphQLString
            },
            timestamp: {
              type: GraphQLString
            },
            text: {
              type: GraphQLString
            }
          }
        })
      }
    }
  })
})

export type Context = {
  connectionId: string
}

const pseudoAsyncIterator = async function* () {
  while (true) yield {}
}

export default schema
