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

-- gantt chart lead end time
-- Requires class, 'color mapping' for Grafana chart
SELECT
  node as name,
  ts-make_interval(secs => uptime) AS time,
  ts as end_time,
  CASE
    WHEN uptime < 60 then 'grey'
    WHEN uptime < 600 then 'green'
    WHEN uptime < 1200 then 'yellow'
    ELSE 'orange'
  END as color,
  CASE
    WHEN uptime < 60 then '< 60sec'
    WHEN uptime < 600 then '1-10min'
    WHEN uptime < 1200 then '10-20min'
    ELSE '20min+'
  END as class

FROM waterpump_journals
WHERE
  $__timeFilter("ts")

UNION ALL

SELECT
  name,
  time,
  end_time,
  'red' as color,
  'cutoff' as class
FROM (
	SELECT
	node as name,
	ts AS time,
	ch0,
	lead(ts) over (order by ts) as end_time
	FROM waterpump_logs
    WHERE $__timeFilter("ts")
) with_end
WHERE ch0 = '1'
ORDER BY time

