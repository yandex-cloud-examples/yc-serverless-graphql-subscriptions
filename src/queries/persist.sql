declare $id as Utf8;
declare $contextValue as Json;
declare $document as Json;
declare $topic as Utf8;
declare $variableValues as Json;

upsert into subscription(id, contextValue, document, topic, variableValues)
values($id, $contextValue, $document, $topic, $variableValues)