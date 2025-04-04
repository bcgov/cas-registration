create or replace function imp.import_swrs_data_from_fdw()
returns void as
$function$
declare
temp_row record;
addr_id int;

begin

  -- BCGHGID Data
  with y as (
    select f.swrs_facility_id, max(r.id) as latest_report from swrs_facility f
    join swrs_report r
    on f.report_id = r.id
    and r.reporting_period_duration = 2023
    and facility_type in ('IF_a', 'IF_b', 'L_c')
    group by f.swrs_facility_id
    order by f.swrs_facility_id
  )
  insert into erc.bc_greenhouse_gas_id(
    id,
    issued_at,
    comments
  )
  select
    f.facility_bc_ghg_id,
    '1970-01-01 00:00:00.000000',
    ''
  from y
    join swrs_facility f
    on f.swrs_facility_id = y.swrs_facility_id
    and f.report_id = y.latest_report
    join swrs_report r
    on r.id = f.report_id
    and r.reporting_period_duration=2023
    and f.facility_type in ('IF_a', 'IF_b', 'L_c')
    and f.facility_bc_ghg_id is not null
    join erc.operation o
    on o.swrs_facility_id = (select swrs_facility_id from swrs_facility where id = f.parent_facility_id)
  on conflict (id) do nothing;

  -- Facility Data
  with y as (
    select f.swrs_facility_id, max(r.id) as latest_report from swrs_facility f
    join swrs_report r
    on f.report_id = r.id
    and r.reporting_period_duration = 2023
    and facility_type in ('IF_a', 'IF_b', 'L_c')
    group by f.swrs_facility_id
    order by f.swrs_facility_id
  )
  insert into erc.facility(
    id,
    swrs_facility_id,
    bcghg_id_id,
    operation_id,
    name,
    type,
    latitude_of_largest_emissions,
    longitude_of_largest_emissions
  )
  select
    uuid_generate_v4(),
    f.swrs_facility_id,
    f.facility_bc_ghg_id,
    (select id from erc.operation where swrs_facility_id = (select swrs_facility_id from swrs_facility where id = f.parent_facility_id)),
    f.facility_name,
    f.facility_type,
    latitude,
    longitude
    from y
    join swrs_facility f
    on f.swrs_facility_id = y.swrs_facility_id
    and f.report_id = y.latest_report
    join swrs_report r
    on r.id = f.report_id
    and r.reporting_period_duration=2023
    and f.facility_type in ('IF_a', 'IF_b', 'L_c')
    and f.facility_bc_ghg_id is not null
    join erc.operation o
    on o.swrs_facility_id = (select swrs_facility_id from swrs_facility where id = f.parent_facility_id);

  update erc.facility set type = 'Large Facility' where type='IF_a';
  update erc.facility set type = 'Medium Facility' where type='IF_b';
  update erc.facility set type = 'Small Aggregate' where type='L_c';

  -- Temporary table for swrs address data
  create temporary table temp_address(
    address_id int primary key,
    swrs_facility_id int,
    street_address text,
    municipality text,
    province text,
    postal_code text

  );

  -- Populate temporary address table
  with y as (
    select f.swrs_facility_id, max(r.id) as latest_report from swrs_facility f
    join swrs_report r
    on f.report_id = r.id
    and r.reporting_period_duration in (2023)
    and facility_type in ('IF_a', 'IF_b', 'L_c')
    and f.facility_bc_ghg_id is not null
    group by f.swrs_facility_id
    order by f.swrs_facility_id
  ),

    z as (
      select distinct on (y.swrs_facility_id)
      y.swrs_facility_id,
      a.id as address_id,
      concat_ws(' ',a.physical_address_unit_number, a.physical_address_street_number, a.physical_address_street_number_suffix, a.physical_address_street_name, a.physical_address_street_type, a.physical_address_street_direction) as street_address,
      a.physical_address_municipality,
      a.physical_address_prov_terr_state,
      a.physical_address_postal_code_zip_code
      from y
      join swrs_address a
      on a.swrs_facility_id = y.swrs_facility_id
      and a.report_id = y.latest_report
      and a.type = 'Facility'
      and a.path_context = 'RegistrationData'
      and a.physical_address_postal_code_zip_code is not null
      order by y.swrs_facility_id
    )
      insert into temp_address(
        address_id,
        swrs_facility_id,
        street_address,
        municipality,
        province,
        postal_code
      ) select address_id, swrs_facility_id, street_address, physical_address_municipality, physical_address_prov_terr_state, physical_address_postal_code_zip_code from z;

  -- Transform province values to match pattern in OBPS data
  update temp_address set province = 'BC' where province ilike 'British Columbia';
  update temp_address set province = 'AB' where province ilike 'Alberta';
  update temp_address set province = 'ON' where province ilike 'Ontario';
  update temp_address set province = 'QC' where province ilike 'Quebec';

  -- Populate facility timeline & Address data
  for temp_row in select * from erc.facility loop
      -- Create address records & update address fkey in facility data
      insert into erc.address(
        street_address,
        municipality,
        province,
        postal_code
      ) values (
        (select street_address from temp_address where swrs_facility_id = temp_row.swrs_facility_id),
        (select municipality from temp_address where swrs_facility_id = temp_row.swrs_facility_id),
        (select province from temp_address where swrs_facility_id = temp_row.swrs_facility_id),
        (select postal_code from temp_address where swrs_facility_id = temp_row.swrs_facility_id)
      ) returning id into addr_id;
      update erc.facility set address_id = addr_id where swrs_facility_id = temp_row.swrs_facility_id;

      -- Populate timeline data
      insert into erc.facility_designated_operation_timeline(
        start_date,
        facility_id,
        operation_id
      ) values (
        now(),
        temp_row.id,
        temp_row.operation_id
      );
  end loop;


end;
$function$ language plpgsql;
