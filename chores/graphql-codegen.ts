import { generate } from '@graphql-codegen/cli'
import { join } from 'path'

const generateGraphQL = () =>
  generate(
    {
      schema: './src/schema/schema.graphql',
      config: {
        contextType: './context#Context',
        allowParentTypeOverride: true
      },
      generates: {
        './src/schema/schema.ts': {
          plugins: [
            'typescript',
            'typescript-resolvers',
            join(__dirname, 'graphql-codegen-typedefs.ts')
          ]
        }
      }
    },
    true
  )

export default generateGraphQL
