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
    ManyToManyField activities
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
Report }|--|| Operator : operator
Report }|--|| Operation : operation
Report }|--|| ReportingYear : reporting_year
ReportVersion }|--|| Report : report
ReportOperation ||--|| ReportVersion : report_version
ReportOperation }|--|{ ReportingActivity : activities
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