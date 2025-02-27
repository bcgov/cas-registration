-- Count of IF_a IF_b, L_c facilities under each LFO in swrs
with y as (
    select f.swrs_facility_id, max(r.id) as latest_report from swrs.facility f
    join swrs.report r
    on f.report_id = r.id
    and r.reporting_period_duration=2023
    and facility_type in ('IF_a', 'IF_b', 'L_c')
    group by f.swrs_facility_id
    order by f.swrs_facility_id
  ),
z as(
    select
    f.parent_facility_id,
    count(*)
    from y
    join swrs.facility f
    on f.swrs_facility_id = y.swrs_facility_id
    and f.report_id = y.latest_report
    and f.facility_type in ('IF_a', 'IF_b', 'L_c')
    and f.facility_bc_ghg_id is not null
    join swrs.report r
    on r.id = f.report_id
    and r.reporting_period_duration=2023
    group by f.parent_facility_id
)
select f.swrs_facility_id, z.count
from z
join swrs.facility f
on z.parent_facility_id = f.id
order by f.swrs_facility_id;
