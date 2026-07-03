from typing import Any
from django.contrib import admin, messages
from django.http import HttpRequest, HttpResponse, HttpResponseNotAllowed
from django.db.models import QuerySet
from django.urls import path, reverse
from django.shortcuts import redirect
from compliance.models import (
    CompliancePeriod,
    ComplianceReportVersion,
    ComplianceObligation,
    ElicensingInvoice,
    ElicensingInterestRate,
)
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.service.elicensing.elicensing_interest_rate_service import ElicensingInterestRateService
from compliance.service.automated_process.compliance_handlers import ComplianceHandlerManager


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


@admin.register(ComplianceReportVersion)
class ComplianceReportVersionAdmin(admin.ModelAdmin):
    list_display = ('id', 'operation_name', 'status', 'is_supplementary', 'compliance_report_id')
    list_filter = ('status', 'is_supplementary')
    search_fields = (
        'id',
        'report_compliance_summary__report_version__report_operation__operation_name',
    )

    @staticmethod
    def operation_name(obj: ComplianceReportVersion) -> str:
        return obj.report_compliance_summary.report_version.report_operation.operation_name


@admin.register(ComplianceObligation)
class ComplianceObligationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'obligation_id',
        'compliance_report_version_id',
        'elicensing_invoice_id',
        'penalty_status',
        'fee_amount_dollars',
        'fee_date',
    )
    list_filter = ('penalty_status',)
    search_fields = ('obligation_id', 'invoice_number')


@admin.register(ElicensingInterestRate)
class ElicensingInterestRateAdmin(admin.ModelAdmin):
    list_display = ('id', 'start_date', 'end_date', 'interest_rate', 'is_current_rate')
    list_filter = ('is_current_rate',)
    change_list_template = 'admin/compliance/elicensinginterestrate/change_list.html'

    def get_urls(self) -> list[Any]:
        custom_urls = [
            path(
                'sync/',
                self.admin_site.admin_view(self.sync_interest_rates_view),
                name='compliance_elicensinginterestrate_sync',
            ),
        ]
        return custom_urls + super().get_urls()

    def sync_interest_rates_view(self, request: HttpRequest) -> HttpResponse:
        if request.method != 'POST':
            return HttpResponseNotAllowed(['POST'])

        if not self.has_change_permission(request):
            self.message_user(request, "You do not have permission to sync interest rates.", level=messages.ERROR)
            return redirect(reverse('admin:compliance_elicensinginterestrate_changelist'))

        try:
            ElicensingInterestRateService.refresh_interest_rates()
        except Exception as e:
            self.message_user(request, f"Failed to refresh interest rates: {e}", level=messages.ERROR)
        else:
            self.message_user(request, "Refreshed eLicensing interest rates.")
        return redirect(reverse('admin:compliance_elicensinginterestrate_changelist'))


@admin.register(ElicensingInvoice)
class ElicensingInvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'invoice_number',
        'invoice_fee_balance',
        'invoice_interest_balance',
        'outstanding_balance',
        'is_void',
        'due_date',
    )
    list_filter = ('is_void',)
    search_fields = ('invoice_number', 'compliance_obligation__obligation_id')
    actions = ['refresh_and_process_compliance_updates']

    @admin.action(description='Refresh from eLicensing and process compliance updates')
    def refresh_and_process_compliance_updates(
        self, request: HttpRequest, queryset: QuerySet[ElicensingInvoice]
    ) -> None:
        """
        Runs the same refresh-and-handle logic as the daily run_scheduled_compliance_sync task,
        scoped to the selected invoice(s) (select one or many).
        """
        handler_manager = ComplianceHandlerManager()
        for invoice in queryset:
            try:
                ElicensingDataRefreshService.refresh_data_by_invoice(
                    client_operator_id=invoice.elicensing_client_operator_id,
                    invoice_number=invoice.invoice_number,
                )
                invoice.refresh_from_db()
                handler_manager.process_compliance_updates(invoice)
            except Exception as e:
                self.message_user(
                    request, f"Failed to process invoice {invoice.invoice_number}: {e}", level=messages.ERROR
                )
                continue
            self.message_user(request, f"Processed invoice {invoice.invoice_number}")
