---
Django ER Diagram
---
erDiagram
ReportOperation {
    BigAutoField id
    CharField operator_legal_name
    CharField operator_trade_name
    CharField operation_name
    CharField operation_type
    CharField operation_bcghgid
    CharField bc_obps_regulated_operation_id
    CharField operation_representative_name
    ManyToManyField activities
}
ReportingYear {
    IntegerField reporting_year
    DateTimeField reporting_window_start
    DateTimeField reporting_window_end
    CharField description
}
Report {
    BigAutoField id
    ForeignKey operation
    ForeignKey reporting_year
    OneToOneField report_operation
}
SourceType {
    BigAutoField id
    CharField name
}
ReportFacility {
    BigAutoField id
    ForeignKey report
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
JsonSchema {
    BigAutoField id
    CharField slug
    JSONField schema
}
ActivitySourceTypeJsonSchema {
    BigAutoField id
    ForeignKey reporting_activity
    ForeignKey source_type
    ForeignKey json_schema
    ForeignKey valid_from
    ForeignKey valid_to
}
ReportOperation }|--|{ ReportingActivity : activities
Report }|--|| Operation : operation
Report }|--|| ReportingYear : reporting_year
Report ||--|| ReportOperation : report_operation
ReportFacility }|--|| Report : report
ReportFacility }|--|{ ReportingActivity : activities
ReportFacility }|--|{ RegulatedProduct : products
ConfigurationElement }|--|| ReportingActivity : reporting_activity
ConfigurationElement }|--|| SourceType : source_type
ConfigurationElement }|--|| GasType : gas_type
ConfigurationElement }|--|| Methodology : methodology
ConfigurationElement }|--|| Configuration : valid_from
ConfigurationElement }|--|| Configuration : valid_to
ConfigurationElement }|--|{ ReportingField : reporting_fields
ActivitySourceTypeJsonSchema }|--|| ReportingActivity : reporting_activity
ActivitySourceTypeJsonSchema }|--|| SourceType : source_type
ActivitySourceTypeJsonSchema }|--|| JsonSchema : json_schema
ActivitySourceTypeJsonSchema }|--|| Configuration : valid_from
ActivitySourceTypeJsonSchema }|--|| Configuration : valid_to
