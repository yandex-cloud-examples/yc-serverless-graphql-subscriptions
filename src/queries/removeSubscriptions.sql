declare $connectionId as Utf8;

delete
  from subscription
 where connectionId = $connectionId