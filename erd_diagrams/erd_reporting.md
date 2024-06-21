---
Django ER Diagram
---
erDiagram
Report {
    BigAutoField id
    CharField title
    TextField description
    DateTimeField created_at
}
SourceType {
    BigAutoField id
    CharField name
}
ReportOperation {
    BigAutoField id
    OneToOneField report
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
ReportOperation ||--|| Report : report
ReportOperation }|--|{ ReportingActivity : activities
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
