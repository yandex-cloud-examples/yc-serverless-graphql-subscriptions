declare $topic as Utf8;
declare $connectionId as Utf8;

select *
  from subscription
 where topic = $topic
   and connectionId = $connectionId