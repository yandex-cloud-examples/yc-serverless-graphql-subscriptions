declare $connectionId as Utf8;
declare $subscriptionId as Utf8;
declare $contextValue as Json;
declare $document as Json;
declare $topic as Utf8;
declare $variableValues as Json;

upsert into subscription(connectionId, subscriptionId, contextValue, document, topic, variableValues)
values($connectionId, $subscriptionId, $contextValue, $document, $topic, $variableValues)