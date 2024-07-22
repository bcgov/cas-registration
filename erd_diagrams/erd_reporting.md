---
Django ER Diagram
---
erDiagram
ReportingYear {
    IntegerField reporting_year
    DateTimeField reporting_window_start
    DateTimeField reporting_window_end
    CharField description
}
Report {
    BigAutoField id
    ForeignKey operator
    ForeignKey operation
    ForeignKey reporting_year
}
ReportVersion {
    BigAutoField id
    ForeignKey report
    BooleanField is_latest_submitted
    CharField status
}
SourceType {
    BigAutoField id
    CharField name
    CharField json_key
}
ReportOperation {
    BigAutoField id
    OneToOneField report_version
    CharField operator_legal_name
    CharField operator_trade_name
    CharField operation_name
    CharField operation_type
    CharField operation_bcghgid
    CharField bc_obps_regulated_operation_id
    CharField operation_representative_name
    ManyToManyField reporting_activities
    ManyToManyField regulated_products
}
ReportFacility {
    BigAutoField id
    ForeignKey report_version
    CharField facility_name
    CharField facility_type
    CharField facility_bcghgid
    ManyToManyField activities
    ManyToManyField products
}
GasType {
    BigAutoField id
    CharField name
    CharField chemical_formula
}
FuelType {
    BigAutoField id
    CharField name
    CharField unit
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
ConfigurationElement {
    BigAutoField id
    ForeignKey reporting_activity
    ForeignKey source_type
    ForeignKey gas_type
    ForeignKey methodology
    ForeignKey valid_from
    ForeignKey valid_to
    ManyToManyField reporting_fields
}
ActivityJsonSchema {
    BigAutoField id
    ForeignKey reporting_activity
    JSONField json_schema
    ForeignKey valid_from
    ForeignKey valid_to
}
ActivitySourceTypeJsonSchema {
    BigAutoField id
    ForeignKey reporting_activity
    ForeignKey source_type
    JSONField json_schema
    BooleanField has_unit
    BooleanField has_fuel
    ForeignKey valid_from
    ForeignKey valid_to
}
ReportActivity {
    BigAutoField id
    JSONField json_data
    ForeignKey report_version_id
    ForeignKey activity_base_schema
    ForeignKey activity
}
ReportSourceType {
    BigAutoField id
    JSONField json_data
    ForeignKey report_version_id
    ForeignKey activity_source_type_base_schema
    ForeignKey report_activity
    ForeignKey source_type
}
ReportUnit {
    BigAutoField id
    JSONField json_data
    ForeignKey report_version_id
    ForeignKey report_source_type
}
ReportFuel {
    BigAutoField id
    JSONField json_data
    ForeignKey report_version_id
    ForeignKey report_source_type
    ForeignKey report_unit
    ForeignKey fuel_type
}
ReportEmission {
    BigAutoField id
    JSONField json_data
    ForeignKey report_version_id
    ForeignKey gas_type
    ForeignKey report_source_type
    ForeignKey fuel_form_data
}
ReportMethodology {
    BigAutoField id
    JSONField json_data
    ForeignKey report_version_id
    OneToOneField report_emission
}
Report }|--|| Operator : operator
Report }|--|| Operation : operation
Report }|--|| ReportingYear : reporting_year
ReportVersion }|--|| Report : report
ReportOperation ||--|| ReportVersion : report_version
ReportOperation }|--|{ ReportingActivity : reporting_activities
ReportOperation }|--|{ RegulatedProduct : regulated_products
ReportFacility }|--|| ReportVersion : report_version
ReportFacility }|--|{ ReportingActivity : activities
ReportFacility }|--|{ RegulatedProduct : products
ConfigurationElement }|--|| ReportingActivity : reporting_activity
ConfigurationElement }|--|| SourceType : source_type
ConfigurationElement }|--|| GasType : gas_type
ConfigurationElement }|--|| Methodology : methodology
ConfigurationElement }|--|| Configuration : valid_from
ConfigurationElement }|--|| Configuration : valid_to
ConfigurationElement }|--|{ ReportingField : reporting_fields
ActivityJsonSchema }|--|| ReportingActivity : reporting_activity
ActivityJsonSchema }|--|| Configuration : valid_from
ActivityJsonSchema }|--|| Configuration : valid_to
ActivitySourceTypeJsonSchema }|--|| ReportingActivity : reporting_activity
ActivitySourceTypeJsonSchema }|--|| SourceType : source_type
ActivitySourceTypeJsonSchema }|--|| Configuration : valid_from
ActivitySourceTypeJsonSchema }|--|| Configuration : valid_to
ReportActivity }|--|| ReportVersion : report_version_id
ReportActivity }|--|| ActivityJsonSchema : activity_base_schema
ReportActivity }|--|| ReportingActivity : activity
ReportSourceType }|--|| ReportVersion : report_version_id
ReportSourceType }|--|| ActivitySourceTypeJsonSchema : activity_source_type_base_schema
ReportSourceType }|--|| ReportActivity : report_activity
ReportSourceType }|--|| SourceType : source_type
ReportUnit }|--|| ReportVersion : report_version_id
ReportUnit }|--|| ReportSourceType : report_source_type
ReportFuel }|--|| ReportVersion : report_version_id
ReportFuel }|--|| ReportSourceType : report_source_type
ReportFuel }|--|| ReportUnit : report_unit
ReportFuel }|--|| FuelType : fuel_type
ReportEmission }|--|| ReportVersion : report_version_id
ReportEmission }|--|| GasType : gas_type
ReportEmission }|--|| ReportSourceType : report_source_type
ReportEmission }|--|| ReportFuel : fuel_form_data
ReportMethodology }|--|| ReportVersion : report_version_id
ReportMethodology ||--|| ReportEmission : report_emission