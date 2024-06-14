---
Django ER Diagram
---
erDiagram
Report {
    BigAutoField id
    CharField title
    TextField description
    DateTimeField created_at
    ForeignKey operation
    IntegerField reporting_year
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
<<<<<<< HEAD
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
BaseSchema {
    BigAutoField id
    CharField slug
    JSONField schema
}
ActivitySourceTypeBaseSchema {
    BigAutoField id
    ForeignKey reporting_activity
    ForeignKey source_type
    ForeignKey base_schema
    ForeignKey valid_from
    ForeignKey valid_to
}
=======
Report }|--|| Operation : operation
>>>>>>> 89c4c905 (chore: updating report model with operation and year info)
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
ActivitySourceTypeBaseSchema }|--|| ReportingActivity : reporting_activity
ActivitySourceTypeBaseSchema }|--|| SourceType : source_type
ActivitySourceTypeBaseSchema }|--|| BaseSchema : base_schema
ActivitySourceTypeBaseSchema }|--|| Configuration : valid_from
ActivitySourceTypeBaseSchema }|--|| Configuration : valid_to