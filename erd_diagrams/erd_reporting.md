---
Django ER Diagram
---
erDiagram
ReportingYear {
    IntegerField reporting_year
    DateTimeField reporting_window_start
    DateTimeField reporting_window_end
    DateTimeField report_due_date
    CharField description
}
Report {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey operator
    ForeignKey operation
    ForeignKey reporting_year
}
ReportVersion {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey report
    BooleanField is_latest_submitted
    CharField report_type
    CharField status
}
ReportPersonResponsible {
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    CharField first_name
    CharField last_name
    CharField position_title
    CharField email
    CharField phone_number
    OneToOneField report_version
    CharField street_address
    CharField municipality
    CharField province
    CharField postal_code
    CharField business_role
}
SourceType {
    BigAutoField id
    CharField name
    CharField json_key
}
ReportOperation {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    OneToOneField report_version
    CharField operator_legal_name
    CharField operator_trade_name
    CharField operation_name
    CharField operation_type
    CharField operation_bcghgid
    CharField bc_obps_regulated_operation_id
    CharField operation_representative_name
    ManyToManyField activities
    ManyToManyField regulated_products
}
FacilityReport {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey facility
    ForeignKey report_version
    CharField facility_name
    CharField facility_type
    CharField facility_bcghgid
    ManyToManyField activities
}
GasType {
    BigAutoField id
    CharField name
    CharField chemical_formula
    IntegerField gwp
    CharField cas_number
}
FuelType {
    BigAutoField id
    CharField name
    CharField unit
    CharField classification
}
Methodology {
    BigAutoField id
    CharField name
}
ReportingField {
    BigAutoField id
    CharField field_name
    CharField field_type
    CharField field_units
}
Configuration {
    BigAutoField id
    CharField slug
    DateField valid_from
    DateField valid_to
}
CustomMethodologySchema {
    BigAutoField id
    ForeignKey activity
    ForeignKey source_type
    ForeignKey gas_type
    ForeignKey methodology
    JSONField json_schema
    ForeignKey valid_from
    ForeignKey valid_to
}
ConfigurationElement {
    BigAutoField id
    ForeignKey activity
    ForeignKey source_type
    ForeignKey gas_type
    ForeignKey methodology
    ForeignKey custom_methodology_schema
    ForeignKey valid_from
    ForeignKey valid_to
    ManyToManyField reporting_fields
}
ActivityJsonSchema {
    BigAutoField id
    ForeignKey activity
    JSONField json_schema
    ForeignKey valid_from
    ForeignKey valid_to
}
ActivitySourceTypeJsonSchema {
    BigAutoField id
    ForeignKey activity
    ForeignKey source_type
    JSONField json_schema
    BooleanField has_unit
    BooleanField has_fuel
    ForeignKey valid_from
    ForeignKey valid_to
}
ReportActivity {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    JSONField json_data
    ForeignKey report_version
    ForeignKey facility_report
    ForeignKey activity_base_schema
    ForeignKey activity
}
ReportSourceType {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    JSONField json_data
    ForeignKey report_version
    ForeignKey activity_source_type_base_schema
    ForeignKey source_type
    ForeignKey report_activity
}
ReportUnit {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    JSONField json_data
    ForeignKey report_version
    ForeignKey report_source_type
}
ReportFuel {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    JSONField json_data
    ForeignKey report_version
    ForeignKey report_source_type
    ForeignKey report_unit
    ForeignKey fuel_type
}
EmissionCategory {
    BigAutoField id
    CharField category_name
    CharField category_type
}
ReportEmission {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    JSONField json_data
    ForeignKey report_version
    ForeignKey gas_type
    ForeignKey report_source_type
    ForeignKey report_fuel
    ManyToManyField emission_categories
}
ReportMethodology {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    JSONField json_data
    ForeignKey report_version
    ForeignKey methodology
    OneToOneField report_emission
}
ReportRawActivityData {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey facility_report
    ForeignKey activity
    JSONField json_data
}
ReportAdditionalData {
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    OneToOneField report_version
    BooleanField capture_emissions
    IntegerField emissions_on_site_use
    IntegerField emissions_on_site_sequestration
    IntegerField emissions_off_site_transfer
    IntegerField electricity_generated
}
EmissionCategoryMapping {
    BigAutoField id
    ForeignKey emission_category
    ForeignKey activity
    ForeignKey source_type
}
ReportNonAttributableEmissions {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey report_version
    ForeignKey facility_report
    CharField activity
    CharField source_type
    ForeignKey emission_category
    ManyToManyField gas_type
}
ReportProduct {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey report_version
    ForeignKey facility_report
    ForeignKey product
    FloatField annual_production
    FloatField production_data_apr_dec
    CharField production_methodology
    FloatField storage_quantity_start_of_period
    FloatField storage_quantity_end_of_period
    FloatField quantity_sold_during_period
    FloatField quantity_throughput_during_period
}
Report }|--|| User : created_by
Report }|--|| User : updated_by
Report }|--|| User : archived_by
Report }|--|| Operator : operator
Report }|--|| Operation : operation
Report }|--|| ReportingYear : reporting_year
ReportVersion }|--|| User : created_by
ReportVersion }|--|| User : updated_by
ReportVersion }|--|| User : archived_by
ReportVersion }|--|| Report : report
ReportPersonResponsible }|--|| User : created_by
ReportPersonResponsible }|--|| User : updated_by
ReportPersonResponsible }|--|| User : archived_by
ReportPersonResponsible ||--|| ReportVersion : report_version
ReportOperation }|--|| User : created_by
ReportOperation }|--|| User : updated_by
ReportOperation }|--|| User : archived_by
ReportOperation ||--|| ReportVersion : report_version
ReportOperation }|--|{ Activity : activities
ReportOperation }|--|{ RegulatedProduct : regulated_products
FacilityReport }|--|| User : created_by
FacilityReport }|--|| User : updated_by
FacilityReport }|--|| User : archived_by
FacilityReport }|--|| Facility : facility
FacilityReport }|--|| ReportVersion : report_version
FacilityReport }|--|{ Activity : activities
CustomMethodologySchema }|--|| Activity : activity
CustomMethodologySchema }|--|| SourceType : source_type
CustomMethodologySchema }|--|| GasType : gas_type
CustomMethodologySchema }|--|| Methodology : methodology
CustomMethodologySchema }|--|| Configuration : valid_from
CustomMethodologySchema }|--|| Configuration : valid_to
ConfigurationElement }|--|| Activity : activity
ConfigurationElement }|--|| SourceType : source_type
ConfigurationElement }|--|| GasType : gas_type
ConfigurationElement }|--|| Methodology : methodology
ConfigurationElement }|--|| CustomMethodologySchema : custom_methodology_schema
ConfigurationElement }|--|| Configuration : valid_from
ConfigurationElement }|--|| Configuration : valid_to
ConfigurationElement }|--|{ ReportingField : reporting_fields
ActivityJsonSchema }|--|| Activity : activity
ActivityJsonSchema }|--|| Configuration : valid_from
ActivityJsonSchema }|--|| Configuration : valid_to
ActivitySourceTypeJsonSchema }|--|| Activity : activity
ActivitySourceTypeJsonSchema }|--|| SourceType : source_type
ActivitySourceTypeJsonSchema }|--|| Configuration : valid_from
ActivitySourceTypeJsonSchema }|--|| Configuration : valid_to
ReportActivity }|--|| User : created_by
ReportActivity }|--|| User : updated_by
ReportActivity }|--|| User : archived_by
ReportActivity }|--|| ReportVersion : report_version
ReportActivity }|--|| FacilityReport : facility_report
ReportActivity }|--|| ActivityJsonSchema : activity_base_schema
ReportActivity }|--|| Activity : activity
ReportSourceType }|--|| User : created_by
ReportSourceType }|--|| User : updated_by
ReportSourceType }|--|| User : archived_by
ReportSourceType }|--|| ReportVersion : report_version
ReportSourceType }|--|| ActivitySourceTypeJsonSchema : activity_source_type_base_schema
ReportSourceType }|--|| SourceType : source_type
ReportSourceType }|--|| ReportActivity : report_activity
ReportUnit }|--|| User : created_by
ReportUnit }|--|| User : updated_by
ReportUnit }|--|| User : archived_by
ReportUnit }|--|| ReportVersion : report_version
ReportUnit }|--|| ReportSourceType : report_source_type
ReportFuel }|--|| User : created_by
ReportFuel }|--|| User : updated_by
ReportFuel }|--|| User : archived_by
ReportFuel }|--|| ReportVersion : report_version
ReportFuel }|--|| ReportSourceType : report_source_type
ReportFuel }|--|| ReportUnit : report_unit
ReportFuel }|--|| FuelType : fuel_type
ReportEmission }|--|| User : created_by
ReportEmission }|--|| User : updated_by
ReportEmission }|--|| User : archived_by
ReportEmission }|--|| ReportVersion : report_version
ReportEmission }|--|| GasType : gas_type
ReportEmission }|--|| ReportSourceType : report_source_type
ReportEmission }|--|| ReportFuel : report_fuel
ReportEmission }|--|{ EmissionCategory : emission_categories
ReportMethodology }|--|| User : created_by
ReportMethodology }|--|| User : updated_by
ReportMethodology }|--|| User : archived_by
ReportMethodology }|--|| ReportVersion : report_version
ReportMethodology }|--|| Methodology : methodology
ReportMethodology ||--|| ReportEmission : report_emission
ReportRawActivityData }|--|| User : created_by
ReportRawActivityData }|--|| User : updated_by
ReportRawActivityData }|--|| User : archived_by
ReportRawActivityData }|--|| FacilityReport : facility_report
ReportRawActivityData }|--|| Activity : activity
ReportAdditionalData }|--|| User : created_by
ReportAdditionalData }|--|| User : updated_by
ReportAdditionalData }|--|| User : archived_by
ReportAdditionalData ||--|| ReportVersion : report_version
EmissionCategoryMapping }|--|| EmissionCategory : emission_category
EmissionCategoryMapping }|--|| Activity : activity
EmissionCategoryMapping }|--|| SourceType : source_type
ReportNonAttributableEmissions }|--|| User : created_by
ReportNonAttributableEmissions }|--|| User : updated_by
ReportNonAttributableEmissions }|--|| User : archived_by
ReportNonAttributableEmissions }|--|| ReportVersion : report_version
ReportNonAttributableEmissions }|--|| FacilityReport : facility_report
ReportNonAttributableEmissions }|--|| EmissionCategory : emission_category
ReportNonAttributableEmissions }|--|{ GasType : gas_type
ReportProduct }|--|| User : created_by
ReportProduct }|--|| User : updated_by
ReportProduct }|--|| User : archived_by
ReportProduct }|--|| ReportVersion : report_version
ReportProduct }|--|| FacilityReport : facility_report
ReportProduct }|--|| RegulatedProduct : product
