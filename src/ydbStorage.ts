import { declareType, TypedData, Types } from 'ydb-sdk'
import { Subscription as SubscriptionRow } from './pubsub'
import database from './database'
import { Storage } from './pubsub'
import { executePersist, executeSubscriptions } from './queries'

const ydbStorage: Storage = {
  async get(topic) {
    const result = await executeSubscriptions(database, { topic })
    console.log('getting subscriptions', JSON.stringify(result))
    return Subscription.createNativeObjects(result.resultSets[0]).map(
      (data) => ({
        document: JSON.parse(data.document || '{}'),
        contextValue: JSON.parse(data.contextValue || '{}'),
        variableValues: JSON.parse(data.variableValues || '{}'),
        topic: data.topic
      })
    )
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
