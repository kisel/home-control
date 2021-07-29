-- zero-filled pump uptime per hour
SELECT
  to_timestamp(floor(extract(epoch from "ts")/3600)*3600) AS "time",
  node AS metric,
  sum(uptime)/60.0 AS "uptime"
FROM (
select *
from (select generate_series(min(ts), max(ts), '1h')::timestamp AS ts FROM waterpump_journals) t1
cross join (SELECT distinct node FROM waterpump_journals) t2
) j
full join waterpump_journals w
using (ts, node)
group by time,metric
order by time;

-- zero-filled pump uptime per hour - grafana
SELECT
  to_timestamp(floor(extract(epoch from "ts")/3600)*3600) AS "time",
  node AS metric,
  coalesce(sum(uptime)/60.0, 0) AS "uptime"
FROM (
select *
from (select generate_series(min(ts), max(ts), '1h')::timestamp AS ts FROM waterpump_journals WHERE  $__timeFilter("ts")) t1
cross join (SELECT distinct node FROM waterpump_journals WHERE  $__timeFilter("ts")) t2
) j
full join waterpump_journals w
using (ts, node)
WHERE $__timeFilter("ts")
group by time,metric
order by time


-- trivial grafana query
SELECT
  floor(extract(epoch from "ts")/3600)*3600 AS "time",
  node AS metric,
  sum(uptime)/60.0 AS "uptime"
FROM waterpump_journals
WHERE
  $__timeFilter("ts")
GROUP BY 1,2
ORDER BY 1,2


