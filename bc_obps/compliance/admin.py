from django.contrib import admin
from compliance.models import CompliancePeriod


@admin.register(CompliancePeriod)
class CompliancePeriodAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'reporting_year',
        'start_date',
        'end_date',
        'compliance_deadline',
        'invoice_generation_date',
        'max_credit_usage_percentage',
    )
