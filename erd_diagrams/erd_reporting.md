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
    UUIDField id
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
ReportOperation ||--|| Report : report
ReportOperation }|--|{ ReportingActivity : activities
ReportFacility }|--|| Report : report
ReportFacility }|--|{ ReportingActivity : activities
ReportFacility }|--|{ RegulatedProduct : products