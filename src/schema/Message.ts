import { objectType } from 'nexus'

const Message = objectType({
  name: 'Message',
  definition(t) {
    t.nonNull.string('from')
    t.nonNull.string('text')
  }
})

export default Message
