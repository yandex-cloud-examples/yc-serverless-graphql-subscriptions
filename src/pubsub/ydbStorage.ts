import { declareType, TypedData, Types, Ydb } from 'ydb-sdk'
import { Subscription as SubscriptionRow } from './pubsub'
import database from '../services/database'
import { Storage } from './pubsub'
import { executeMessagesSubscriptions, executePersist } from '../queries'
import { Topics } from './../schema/context'

const ydbStorage: Storage<Topics> = {
  get: {
    async messages(args) {
      // Notice that for each topic we implement a getter
      // This is necessary so we can properly filter the subscriptions
      // in the database, so we do not produce empty updates
      const result = await executeMessagesSubscriptions(database, {
        topic: 'messages',
        connectionId: args.to
      })
      return toSubscriptions(result.resultSets[0])
    }
  },
  async persist(payload) {
    executePersist(database, {
      connectionId: payload.contextValue.connectionId,
      subscriptionId: payload.contextValue.subscriptionId,
      contextValue: JSON.stringify(payload.contextValue || {}),
      variableValues: JSON.stringify(payload.variableValues || {}),
      document: JSON.stringify(payload.document || {}),
      topic: payload.topic
    })
  }
}

const toSubscriptions = (resultSet: Ydb.IResultSet) =>
  Subscription.createNativeObjects(resultSet).map((data) => ({
    document: JSON.parse(data.document || '{}'),
    contextValue: JSON.parse(data.contextValue || '{}'),
    variableValues: JSON.parse(data.variableValues || '{}'),
    topic: data.topic
  }))

class Subscription extends TypedData {
  @declareType(Types.UTF8)
  public topic: string

  @declareType(Types.JSON)
  public document: SubscriptionRow['document']

  @declareType(Types.JSON)
  public contextValue: SubscriptionRow['contextValue']

  @declareType(Types.JSON)
  public variableValues: SubscriptionRow['variableValues']

  constructor(data: SubscriptionRow) {
    super(data)
    this.topic = data.topic
    this.document = data.document
    this.contextValue = data.contextValue
    this.variableValue = data.variableValues
  }
}

export default ydbStorage
