import { TypedValues, Types, Driver, Session } from "ydb-sdk";

const defaultQueryOptions = {
    beginTx: { staleReadOnly: {} },
    commitTx: true
}

interface PersistVariables {
    connectionId: Parameters<typeof TypedValues.utf8>[0];
    subscriptionId: Parameters<typeof TypedValues.utf8>[0];
    contextValue: Parameters<typeof TypedValues.json>[0];
    document: Parameters<typeof TypedValues.json>[0];
    topic: Parameters<typeof TypedValues.utf8>[0];
    variableValues: Parameters<typeof TypedValues.json>[0];
}

export function executePersist(driver: Driver, variables: PersistVariables, queryOptions?: Parameters<Session["executeQuery"]>[2]) {
    const payload = {
        $connectionId: TypedValues.fromNative(Types.UTF8, variables.connectionId),
        $subscriptionId: TypedValues.fromNative(Types.UTF8, variables.subscriptionId),
        $contextValue: TypedValues.fromNative(Types.JSON, variables.contextValue),
        $document: TypedValues.fromNative(Types.JSON, variables.document),
        $topic: TypedValues.fromNative(Types.UTF8, variables.topic),
        $variableValues: TypedValues.fromNative(Types.JSON, variables.variableValues)
    };
    const sql = "declare $connectionId as Utf8;\r\ndeclare $subscriptionId as Utf8;\r\ndeclare $contextValue as Json;\r\ndeclare $document as Json;\r\ndeclare $topic as Utf8;\r\ndeclare $variableValues as Json;\r\n\r\nupsert into subscription(connectionId, subscriptionId, contextValue, document, topic, variableValues)\r\nvalues($connectionId, $subscriptionId, $contextValue, $document, $topic, $variableValues)";
    async function sessionHandler(session: Session) {
        return session.executeQuery(sql, payload, queryOptions);
    }
    const result = driver.tableClient.withSession(sessionHandler);
    return result;
}

interface RemoveSubscriptionsVariables {
    connectionId: Parameters<typeof TypedValues.utf8>[0];
}

export function executeRemoveSubscriptions(driver: Driver, variables: RemoveSubscriptionsVariables, queryOptions?: Parameters<Session["executeQuery"]>[2]) {
    const payload = {
        $connectionId: TypedValues.fromNative(Types.UTF8, variables.connectionId)
    };
    const sql = "declare $connectionId as Utf8;\r\n\r\ndelete from subscription\r\n      where connectionId = $connectionId";
    async function sessionHandler(session: Session) {
        return session.executeQuery(sql, payload, queryOptions);
    }
    const result = driver.tableClient.withSession(sessionHandler);
    return result;
}

interface SubscriptionsVariables {
    topic: Parameters<typeof TypedValues.utf8>[0];
}

export function executeSubscriptions(driver: Driver, variables: SubscriptionsVariables, queryOptions?: Parameters<Session["executeQuery"]>[2]) {
    const payload = {
        $topic: TypedValues.fromNative(Types.UTF8, variables.topic)
    };
    const sql = "declare $topic as Utf8;\r\n\r\nselect *\r\n  from subscription\r\n where topic = $topic";
    async function sessionHandler(session: Session) {
        return session.executeQuery(sql, payload, queryOptions);
    }
    const result = driver.tableClient.withSession(sessionHandler);
    return result;
}