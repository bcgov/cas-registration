create or replace function imp.import_swrs_data(
  swrs_host text,
  swrs_dbname text,
  swrs_port text,
  swrs_user text,
  swrs_pword text
)
returns void as
$function$
  begin

    -- Create fdw server
    execute format('create server import_server foreign data wrapper postgres_fdw options (host %s, dbname %s, port %s)', quote_literal($1), quote_literal($2), quote_literal($3));
    -- Create fdw user mapping
    execute format('create user mapping for current_user server import_server options (user %s, password %s)', quote_literal($4), quote_literal($5));

    -- Create report foreign table
    create foreign table swrs_report (
      id                        integer,
      swrs_report_id            integer,
      swrs_facility_id          integer,
      swrs_organisation_id      integer,
      reporting_period_duration integer
    ) server import_server options (schema_name 'swrs', table_name 'report');

    create foreign table swrs_address (
      id                                                  integer,
      report_id                                           integer,
      facility_id                                         integer,
      organisation_id                                     integer,
      swrs_facility_id                                    integer,
      swrs_organisation_id                                integer,
      path_context                                        varchar(1000),
      type                                                varchar(1000),
      physical_address_municipality                       varchar(1000),
      physical_address_unit_number                        varchar(1000),
      physical_address_street_number                      varchar(1000),
      physical_address_street_number_suffix               varchar(1000),
      physical_address_street_name                        varchar(1000),
      physical_address_street_type                        varchar(1000),
      physical_address_street_direction                   varchar(1000),
      physical_address_prov_terr_state                    varchar(1000),
      physical_address_postal_code_zip_code               varchar(1000),
      physical_address_country                            varchar(1000),
      physical_address_national_topographical_description varchar(1000),
      physical_address_additional_information             varchar(10000),
      physical_address_land_survey_description            varchar(1000),

      mailing_address_delivery_mode                       varchar(1000),
      mailing_address_po_box_number                       varchar(1000),
      mailing_address_unit_number                         varchar(1000),
      mailing_address_rural_route_number                  varchar(1000),
      mailing_address_street_number                       varchar(1000),
      mailing_address_street_number_suffix                varchar(1000),
      mailing_address_street_name                         varchar(1000),
      mailing_address_street_type                         varchar(1000),
      mailing_address_street_direction                    varchar(1000),
      mailing_address_municipality                        varchar(1000),
      mailing_address_prov_terr_state                     varchar(1000),
      mailing_address_postal_code_zip_code                varchar(1000),
      mailing_address_country                             varchar(1000),
      mailing_address_additional_information              varchar(10000)
    ) server import_server options (schema_name 'swrs', table_name 'address');

    create foreign table swrs_facility (
      id                        integer,
      report_id                 integer,
      organisation_id           integer,
      swrs_facility_id          integer,
      parent_facility_id        integer,
      facility_name             varchar(1000),
      facility_type             varchar(1000),
      facility_bc_ghg_id        varchar(1000),
      latitude                  numeric,
      longitude                 numeric
    ) server import_server options (schema_name 'swrs', table_name 'facility');

    perform imp.import_swrs_data_from_fdw();

    drop server import_server cascade;
    drop schema imp cascade;

  end;

$function$ language plpgsql volatile;
