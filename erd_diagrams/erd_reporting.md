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
HistoricalReportingGasType {
    BigIntegerField id
    CharField name
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
ReportingGasType {
    BigAutoField id
    CharField name
}
HistoricalReportingMethodology {
    BigIntegerField id
    CharField name
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
ReportingMethodology {
    BigAutoField id
    CharField name
}
HistoricalReportingSourceType {
    BigIntegerField id
    CharField name
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
ReportingSourceType {
    BigAutoField id
    CharField name
}