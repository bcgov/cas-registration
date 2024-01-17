create or replace function imp.import_swrs_data_from_fdw()
returns void as
$function$
begin

  -- Operator data
  with x as (
    select max(o.report_id) as max_report_id, o.swrs_organisation_id from swrs_operator o
    join swrs_report r on r.id = o.report_id
    and r.reporting_period_duration=2022
    group by o.swrs_organisation_id
  ),
  y as (
    select a.swrs_report_id, a.id, max(version_number) as latest_version
    from ciip_application a
    join ciip_application_revision ar
    on a.id = ar.application_id
    group by a.swrs_report_id, a.id
  ), z as (
      select * from ciip_admin ca
      join y
      on ca.application_id = y.id
      and ca.version_number = y.latest_version
  ), w as (
      select distinct on (o.swrs_organisation_id) o.swrs_organisation_id, z.operator_name, z.bc_corporate_registry_number from z
      join ciip_application a
      on a.id = z.application_id
      join ciip_facility f
      on f.id = a.facility_id
      join ciip_organisation o
      on f.organisation_id = o.id
  )
    insert into imp.operator(
      swrs_organisation_id,
      report_id,
      business_legal_name,
      english_trade_name,
      cra_business_number,
      bc_corporate_registry_number,
      physical_street_address,
      physical_address_municipality,
      physical_address_province,
      physical_address_postal_code,
      mailing_street_address,
      mailing_address_municipality,
      mailing_address_province,
      mailing_address_postal_code)
    select
    o.swrs_organisation_id,
    o.report_id,
    coalesce(w.operator_name, o.business_legal_name),
    o.english_trade_name,
    o.cra_business_number,
    w.bc_corporate_registry_number,
    concat_ws(' ',a.physical_address_unit_number, a.physical_address_street_number, a.physical_address_street_number_suffix, a.physical_address_street_name, a.physical_address_street_type, a.physical_address_street_direction) as physical_street_address,
    a.physical_address_municipality,
    a.physical_address_prov_terr_state,
    a.physical_address_postal_code_zip_code,
    concat_ws(' ',a.mailing_address_unit_number, a.mailing_address_street_number, a.mailing_address_street_number_suffix, a.mailing_address_street_name, a.mailing_address_street_type, a.mailing_address_street_direction) as mailing_street_address,
    a.mailing_address_municipality,
    a.mailing_address_prov_terr_state,
    a.mailing_address_postal_code_zip_code
    from swrs_operator o
    join x on o.swrs_organisation_id = x.swrs_organisation_id
    and o.report_id = x.max_report_id
    join swrs_report r
    on r.id = o.report_id
    left join swrs_address a
    on a.organisation_id = o.id
    and a.path_context = 'RegistrationData'
    left join w
    on w.swrs_organisation_id = o.swrs_organisation_id
    order by swrs_organisation_id;

  with y as (
    select swrs_facility_id, max(report_id) as latest_report from swrs_facility where facility_type in ('SFO', 'LFO')
    group by swrs_facility_id
    order by swrs_facility_id
  )
  insert into imp.operation(
    swrs_facility_id,
    operator_id,
    facility_name,
    facility_type,
    bcghgid
  )
  select
    sf.swrs_facility_id,
    (select id from imp.operator where operator.swrs_organisation_id = r.swrs_organisation_id),
    coalesce(f.facility_name, sf.facility_name) as facility_name,
    sf.facility_type,
    coalesce(f.bcghgid, sf.facility_bc_ghg_id)
    from y
    join swrs_facility sf
    on sf.swrs_facility_id = y.swrs_facility_id
    and sf.report_id = y.latest_report
    left join ciip_facility f
    on f.swrs_facility_id = y.swrs_facility_id
    and f.facility_type not in ('IF_a,', 'IF_b', 'L_c')
    join swrs_operator o
    on o.report_id = sf.report_id
    join swrs_report r
    on r.id = sf.report_id
    and r.reporting_period_duration=2022
    order by r.swrs_organisation_id;

end;
$function$ language plpgsql;
