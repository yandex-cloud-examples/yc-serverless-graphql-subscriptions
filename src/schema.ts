import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'

const schema = new GraphQLSchema({
  subscription: new GraphQLObjectType({
    name: 'subscription',
    fields: {
      messages: {
        resolve: () => {
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

export default schema
