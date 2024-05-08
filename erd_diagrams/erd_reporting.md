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
Configuration {
    BigAutoField id
    CharField slug
    DateField valid_from
    DateField valid_to
}
ConfigurationElement {
    BigAutoField id
    ForeignKey reporting_activity
    ForeignKey reporting_source_type
    ForeignKey reporting_gas_type
    ForeignKey reporting_methodology
    ForeignKey valid_from
    ForeignKey valid_to
}
ConfigurationElement }|--|| ReportingActivity : reporting_activity
ConfigurationElement }|--|| ReportingSourceType : reporting_source_type
ConfigurationElement }|--|| ReportingGasType : reporting_gas_type
ConfigurationElement }|--|| ReportingMethodology : reporting_methodology
ConfigurationElement }|--|| Configuration : valid_from
ConfigurationElement }|--|| Configuration : valid_to