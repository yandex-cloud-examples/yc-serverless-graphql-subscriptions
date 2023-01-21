import { objectType } from 'nexus'

const ConnectionNotFound = objectType({
  name: 'ConnectionNotFound',
  definition(t) {
    t.nonNull.string('connectionId')
  }
})

export default ConnectionNotFound
