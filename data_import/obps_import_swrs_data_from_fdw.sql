create or replace function imp.import_swrs_data_from_fdw(import_addresses boolean)
returns void as
$function$
declare
temp_row record;
physical_addr_id integer;
mailing_addr_id integer;
physical_province_code varchar(2);
mailing_province_code varchar(2);

begin

  create temporary table temp_operator(
    id integer generated always as identity primary key,
    swrs_organisation_id integer unique,
    legal_name text,
    trade_name text,
    cra_business_number integer,
    bc_corporate_registry_number text,
    physical_street_address text,
    physical_address_municipality text,
    physical_address_province text,
    physical_address_postal_code text,
    mailing_street_address text,
    mailing_address_municipality text,
    mailing_address_province text,
    mailing_address_postal_code text
  );

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
    insert into temp_operator(
      swrs_organisation_id,
      legal_name,
      trade_name,
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
    coalesce(w.operator_name, o.business_legal_name) as legal_name,
    o.english_trade_name,
    o.cra_business_number::integer,
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
    order by swrs_organisation_id

    on conflict (swrs_organisation_id)
    do update set
    legal_name = excluded.legal_name,
    trade_name = excluded.trade_name,
    cra_business_number = excluded.cra_business_number,
    bc_corporate_registry_number = excluded.bc_corporate_registry_number,
    physical_street_address = excluded.physical_street_address,
    physical_address_municipality = excluded.physical_address_municipality,
    physical_address_province = excluded.physical_address_province,
    physical_address_postal_code = excluded.physical_address_postal_code,
    mailing_street_address = excluded.mailing_street_address,
    mailing_address_municipality = excluded.mailing_address_municipality,
    mailing_address_province = excluded.mailing_address_municipality,
    mailing_address_postal_code = excluded.mailing_address_postal_code;

  for temp_row in select * from temp_operator loop
    if import_addresses then
      -- only handling known provinces in the swrs dataset (BC, AB, ON, QC & Null)
      physical_province_code = (
        select case
          when temp_row.physical_address_province ilike 'British Columbia' then 'BC'
          when temp_row.physical_address_province ilike 'Alberta' then 'AB'
          when temp_row.physical_address_province ilike 'Ontario' then 'ON'
          when temp_row.physical_address_province ilike 'Quebec' then 'QC'
          else null
        end
      );
      mailing_province_code = (
        select case
          when temp_row.mailing_address_province ilike 'British Columbia' then 'BC'
          when temp_row.mailing_address_province ilike 'Alberta' then 'AB'
          when temp_row.mailing_address_province ilike 'Ontario' then 'ON'
          when temp_row.mailing_address_province ilike 'Quebec' then 'QC'
          else null
        end
      );
      insert into erc.address(
        street_address,
        municipality,
        province,
        postal_code
      ) values (
        temp_row.physical_street_address,
        temp_row.physical_address_municipality,
        physical_province_code,
        temp_row.physical_address_postal_code
      )
      returning id into physical_addr_id;

      insert into erc.address(
        street_address,
        municipality,
        province,
        postal_code
      ) values (
        temp_row.mailing_street_address,
        temp_row.mailing_address_municipality,
        mailing_province_code,
        temp_row.mailing_address_postal_code
      )
        returning id into mailing_addr_id;

      insert into erc.operator(
        legal_name,
        trade_name,
        cra_business_number,
        bc_corporate_registry_number,
        created_at,
        status,
        is_new,
        physical_address_id,
        mailing_address_id
      ) values (
        temp_row.legal_name,
        temp_row.trade_name,
        temp_row.cra_business_number,
        temp_row.bc_corporate_registry_number,
        now(),
        'Draft',
        false,
        physical_addr_id,
        mailing_addr_id
      ) on conflict (cra_business_number)
        do update set
        legal_name = excluded.legal_name,
        trade_name = excluded.trade_name,
        bc_corporate_registry_number = excluded.bc_corporate_registry_number,
        physical_address_id = physical_addr_id,
        mailing_address_id = mailing_addr_id;
    else
      insert into erc.operator(
        legal_name,
        trade_name,
        cra_business_number,
        bc_corporate_registry_number,
        created_at,
        status,
        is_new,
        physical_address_id,
        mailing_address_id
      ) values (
        temp_row.legal_name,
        temp_row.trade_name,
        temp_row.cra_business_number,
        temp_row.bc_corporate_registry_number,
        now(),
        'Draft',
        false,
        null,
        null
      ) on conflict (cra_business_number)
        do update set
        legal_name = excluded.legal_name,
        trade_name = excluded.trade_name,
        cra_business_number = operator.cra_business_number,
        bc_corporate_registry_number = excluded.bc_corporate_registry_number,
        created_at = operator.created_at,
        status = operator.status,
        is_new = operator.is_new,
        physical_address_id = operator.physical_address_id,
        mailing_address_id = operator.mailing_address_id;
    end if;

  end loop;


  -- Operation data
  with y as (
    select swrs_facility_id, max(report_id) as latest_report from swrs_facility where facility_type in ('SFO', 'LFO')
    group by swrs_facility_id
    order by swrs_facility_id
  )
  insert into erc.operation(
    swrs_facility_id,
    operator_id,
    name,
    type,
    bcghg_id,
    operation_has_multiple_operators,
    status
  )
  select
    sf.swrs_facility_id,
    (select id from erc.operator where operator.cra_business_number = o.cra_business_number::integer),
    coalesce(f.facility_name, sf.facility_name) as facility_name,
    sf.facility_type,
    coalesce(f.bcghgid, sf.facility_bc_ghg_id) as bcghg_id,
    false,
    'Not Started'
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
    order by r.swrs_organisation_id

    on conflict (swrs_facility_id)
    do update set
    name = excluded.name,
    type = excluded.type,
    bcghg_id = excluded.bcghg_id;

  update erc.operation set type = 'Single Facility Operation' where type='SFO';
  update erc.operation set type = 'Linear Facilities Operation' where type='LFO';

end;
$function$ language plpgsql;
