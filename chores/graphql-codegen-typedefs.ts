import { printSchemaWithDirectives } from '@graphql-tools/utils'
import { GraphQLSchema, stripIgnoredCharacters } from 'graphql'

const print = (schema: string) => `
import { parse } from "graphql"
export const typeDefs = parse(\`${schema}\`);
`

export const plugin = (schema: GraphQLSchema) =>
  print(stripIgnoredCharacters(printSchemaWithDirectives(schema)))
