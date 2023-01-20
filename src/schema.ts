import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'

// For simplicity we use code-first approach to schema.
// Alternatively one can use tools like graphql-codegen
// for schema-frist approach
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'query',
    fields: {
      me: {
        type: GraphQLString,
        resolve: (parent, args, context) => context.connectionId
      }
    }
  }),
  subscription: new GraphQLObjectType({
    name: 'subscription',
    fields: {
      messages: {
        resolve: (parent, args, context) => {
          console.log('kek')
          console.log(parent)
          return true
        },
        type: new GraphQLObjectType({
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

type Context = {
  connectionId: string
}

export default schema
