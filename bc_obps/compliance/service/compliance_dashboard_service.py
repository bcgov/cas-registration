from uuid import UUID
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from django.db.models import QuerySet
from compliance.models import ComplianceReportVersion, ElicensingPayment
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from registration.models import Operation
from typing import Optional
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.dataclass import PaymentDataWithFreshnessFlag
from service.user_operator_service import UserOperatorService
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from compliance.enums import ComplianceInvoiceTypes
from service.reporting_year_service import ReportingYearService


class ComplianceDashboardService:
    """
    Service providing data operations for the compliance dashboard
    """

    @classmethod
    def get_compliance_report_versions_for_dashboard(cls, user_guid: UUID) -> QuerySet[ComplianceReportVersion]:
        """
        Fetches all compliance summaries for the user's operations
        """
        user = UserDataAccessService.get_by_guid(user_guid)
        # Get current reporting
        reporting_year: int = ReportingYearService.get_current_reporting_year().reporting_year

        compliance_report_version_queryset = (
            ComplianceReportVersion.objects.select_related(
                "compliance_report__report__operation",
                "compliance_report__compliance_period",  # Still needed for charge rate calculation
                "compliance_report__report",
                "compliance_report__compliance_period__reporting_year",
                "compliance_report__report__operator",
                "obligation",
                "obligation__elicensing_invoice",
                "compliance_earned_credit",
                "report_compliance_summary",
                "report_compliance_summary__report_version__report__operator",
                "report_compliance_summary__report_version__report__operation",
                "report_compliance_summary__report_version__report__reporting_year",
            )
            .prefetch_related(
                "obligation__elicensing_invoice__elicensing_line_items",
            )
            .exclude(
                # Exclude compliance report versions that are supplementary and have no obligation or earned credits. We don't need to show users these versions because there are no actions to take
                is_supplementary=True,
                status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            )
            # filter for current reporting year
            .filter(report_compliance_summary__report_version__report__reporting_year=reporting_year)
        )

        if user.is_irc_user():
            # Get all compliance report versions for Internal Users
            compliance_report_versions = compliance_report_version_queryset.all()
        else:
            operations = (
                OperationDataAccessService.get_all_current_operations_for_user(user)
                .select_related('operator')
                .filter(status=Operation.Statuses.REGISTERED)
                .values_list('id')
            )
            # Get all compliance report versions for the filtered operations
            compliance_report_versions = compliance_report_version_queryset.filter(
                report_compliance_summary__report_version__report__operation_id__in=operations,
                report_compliance_summary__report_version__report__operator=UserOperatorService.get_current_user_approved_user_operator_or_raise(
                    user
                ).operator,
            )
            compliance_report_versions = (
                compliance_report_versions
                | ComplianceReportVersionService.get_compliance_report_versions_for_previously_owned_operations(
                    user_guid=user_guid
                ).exclude(
                    is_supplementary=True,
                    status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
                )
            )

        for version in compliance_report_versions:
            version.outstanding_balance_tco2e = ComplianceReportVersionService.calculate_outstanding_balance_tco2e(version)  # type: ignore[attr-defined]
            summary = version.report_compliance_summary
            if summary and summary.excess_emissions is not None:
                summary.excess_emissions = ComplianceReportVersionService.calculate_computed_value_excess_emissions(
                    version
                )
        return compliance_report_versions

    @classmethod
    def get_compliance_report_version_by_id(
        cls, user_guid: UUID, compliance_report_version_id: int
    ) -> Optional[ComplianceReportVersion]:
        """
        Fetches a specific compliance report version by ID if it belongs to one of the user's operations

        Args:
            user_guid: The GUID of the user requesting the compliance_report_version
            compliance_report_version_id: The ID of the compliance compliance_report_version to retrieve

        Returns:
            The requested ComplianceReportVersion object or None if not found
        """
        user = UserDataAccessService.get_by_guid(user_guid)
        compliance_report_version_queryset = ComplianceReportVersion.objects.select_related(
            'compliance_report',
            'compliance_report__report__operation',
            'compliance_report__compliance_period',
            'compliance_report__compliance_period__reporting_year',
            'compliance_report__report__operator',
            'obligation',
            'obligation__elicensing_invoice',
            'report_compliance_summary',
            'report_compliance_summary__report_version__report__operator',
            'report_compliance_summary__report_version__report__operation',
            'report_compliance_summary__report_version__report__reporting_year',
        ).prefetch_related(
            'obligation__elicensing_invoice__elicensing_line_items',
        )

        if user.is_irc_user():
            compliance_report_version = compliance_report_version_queryset.get(id=compliance_report_version_id)
        else:
            compliance_report_version = compliance_report_version_queryset.get(
                id=compliance_report_version_id,
                report_compliance_summary__report_version__report__operator=UserOperatorService.get_current_user_approved_user_operator_or_raise(
                    user
                ).operator,
            )

        # Calculated values
        if compliance_report_version:
            report = compliance_report_version.compliance_report
            if report and report.compliance_period:
                reporting_year = report.compliance_period.reporting_year
                charge_rate = ComplianceChargeRateService.get_rate_for_year(reporting_year)
                compliance_report_version.compliance_charge_rate = charge_rate  # type: ignore[attr-defined]

            summary = compliance_report_version.report_compliance_summary
            if summary and summary.excess_emissions is not None:
                computed_excess_emissions = ComplianceReportVersionService.calculate_computed_value_excess_emissions(
                    compliance_report_version
                )
                compliance_report_version.equivalent_value = computed_excess_emissions * charge_rate  # type: ignore[attr-defined]

            obligation = getattr(compliance_report_version, "obligation", None)
            if (
                obligation
                and obligation.elicensing_invoice
                and obligation.elicensing_invoice.outstanding_balance is not None
            ):
                ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
                    compliance_report_version_id=compliance_report_version_id
                )
                compliance_report_version.outstanding_balance_tco2e = ComplianceReportVersionService.calculate_outstanding_balance_tco2e(compliance_report_version)  # type: ignore[attr-defined]
                compliance_report_version.outstanding_balance_equivalent_value = obligation.elicensing_invoice.outstanding_balance  # type: ignore[attr-defined]

        return compliance_report_version

    @classmethod
    def get_compliance_obligation_payments_by_compliance_report_version_id(
        cls, compliance_report_version_id: int
    ) -> PaymentDataWithFreshnessFlag:
        """
        Fetches the monetary payments made towards a compliance obligation

        Args:
            compliance_report_version_id: The ID of the compliance report version the obligation belongs to

        Returns:
            The set of payment records that relate to the compliance obligation via the elicensing invoice
        """

        refreshed_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id
        )
        payments = ElicensingPayment.objects.select_related('elicensing_line_item').filter(
            elicensing_line_item__elicensing_invoice=refreshed_data.invoice
        )

        return PaymentDataWithFreshnessFlag(data_is_fresh=refreshed_data.data_is_fresh, data=payments)

    @classmethod
    def get_penalty_payments_by_compliance_report_version_id(
        cls, compliance_report_version_id: int
    ) -> PaymentDataWithFreshnessFlag:
        """
        Fetches the monetary payments made towards a compliance penalty

        Args:
            compliance_report_version_id: The ID of the compliance report version the penalty belongs to
        Returns:
            The set of payment records that relate to the compliance penalty via the elicensing invoice
        """

        refreshed_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id,
            invoice_type=ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY,
        )

        payments = ElicensingPayment.objects.filter(elicensing_line_item__elicensing_invoice=refreshed_data.invoice)

        return PaymentDataWithFreshnessFlag(data_is_fresh=refreshed_data.data_is_fresh, data=payments)
