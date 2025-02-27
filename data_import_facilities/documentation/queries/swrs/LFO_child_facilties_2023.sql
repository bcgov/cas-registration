-- IF_a, IF_b, L_c Facilities 2023 swrs
with y as (
    select f.swrs_facility_id, max(r.id) as latest_report from swrs.facility f
    join swrs.report r
    on f.report_id = r.id
    and r.reporting_period_duration in (2023)
    and facility_type in ('IF_a', 'IF_b', 'L_c')
    group by f.swrs_facility_id
    order by f.swrs_facility_id
  )
select
    f.swrs_facility_id,
    f.facility_name,
    f.facility_type,
    f.facility_bc_ghg_id as bcghg_id,
    r.reporting_period_duration,
    pf.swrs_facility_id as parent_swrs_id
    from y
    join swrs.facility f
    on f.swrs_facility_id = y.swrs_facility_id
    join swrs.facility pf
    on f.parent_facility_id = pf.id
    and f.report_id = y.latest_report
    and f.facility_type in ('IF_a', 'IF_b', 'L_c')
    and f.facility_bc_ghg_id is not null
    join swrs.report r
    on r.id = f.report_id
    order by f.swrs_facility_id;
