-- LFO Facilities 2023 swrs overlap with OBPS LFOs
with y as (
    select f.swrs_facility_id, max(r.id) as latest_report from swrs.facility f
    join swrs.report r
    on f.report_id = r.id
    and r.reporting_period_duration in (2023)
    and facility_type in ('LFO')
    group by f.swrs_facility_id
    order by f.swrs_facility_id
  )
select
    f.swrs_facility_id,
    f.facility_name,
    f.facility_type,
    f.facility_bc_ghg_id as bcghg_id,
    r.reporting_period_duration
    from y
    join swrs.facility f
    on f.swrs_facility_id = y.swrs_facility_id
    and f.report_id = y.latest_report
    and f.facility_type = 'LFO'
    join swrs.report r
    on r.id = f.report_id
    and r.reporting_period_duration=2023
    and f.facility_bc_ghg_id is not null
    and f.swrs_facility_id not in (
          2255,  -- List of IDs from OBPS LFO operations
          1750,
          1830,
          1736,
          1935,
          2282,
          1933,
          59946,
          1759,
          1313,
          61991,
          64125,
          63590,
          23348,
          21945,
          59432,
          1920,
          1856,
          1733,
          445,
          2257,
          55462,
          55674,
          60336,
          63344,
          27276,
          2008,
          2250,
          1872,
          27285,
          203,
          27534,
          23338,
          61883,
          30984,
          26221,
          1734,
          26870)
    order by f.swrs_facility_id;
