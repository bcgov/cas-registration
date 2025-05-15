from django.contrib import admin
from compliance.models import ComplianceReportVersion


@admin.register(ComplianceReportVersion)
class ComplianceReportVersionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'compliance_report',
        'report_compliance_summary',
        'excess_emissions_delta_from_previous',
        'credited_emissions_delta_from_previous',
        'status',
    )
