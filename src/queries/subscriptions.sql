declare $topic as Utf8;

select *
  from subscription
 where topic = $topic