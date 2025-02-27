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
    y.swrs_facility_id,
    a.id,
    concat_ws(' ',a.physical_address_unit_number, a.physical_address_street_number, a.physical_address_street_number_suffix, a.physical_address_street_name, a.physical_address_street_type, a.physical_address_street_direction) as street_address,
    a.physical_address_municipality,
    a.physical_address_prov_terr_state,
    a.physical_address_postal_code_zip_code
    from y
    join swrs.address a
    on a.swrs_facility_id = y.swrs_facility_id
    and a.report_id = y.latest_report
    and a.type = 'Facility'
    and a.path_context = 'RegistrationData'
    order by y.swrs_facility_id;
