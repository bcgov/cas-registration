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
        compliance_report_version_queryset = ComplianceReportVersion.objects.select_related(
            'compliance_report__report__operation',
            'compliance_report__compliance_period',
            'compliance_report__report__operator',
            'obligation',
            'compliance_earned_credit',
            'report_compliance_summary',
        )

        if user.is_irc_user():
            # Get all compliance report versions for Internal Users
            compliance_report_versions = compliance_report_version_queryset.all()
        else:
            operations = (
                OperationDataAccessService.get_all_operations_for_user(user)
                .filter(status=Operation.Statuses.REGISTERED)
                .values_list('id')
            )
            # Get all compliance report versions for the filtered operations
            compliance_report_versions = compliance_report_version_queryset.filter(
                compliance_report__report__operation_id__in=operations,
                compliance_report__report__operator=UserOperatorService.get_current_user_approved_user_operator_or_raise(
                    user
                ).operator,
            )
            compliance_report_versions = (
                compliance_report_versions
                | ComplianceReportVersionService.get_compliance_report_versions_for_previously_owned_operations(
                    user_guid=user_guid
                )
            )

        for version in compliance_report_versions:
            version.outstanding_balance = ComplianceReportVersionService.calculate_outstanding_balance(version)  # type: ignore[attr-defined]

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
            'compliance_report__report__operation',
            'compliance_report__compliance_period',
            'obligation',
            'report_compliance_summary',
        )

        if user.is_irc_user():
            compliance_report_version = compliance_report_version_queryset.get(id=compliance_report_version_id)
        else:
            compliance_report_version = compliance_report_version_queryset.get(
                id=compliance_report_version_id,
                compliance_report__report__operator=UserOperatorService.get_current_user_approved_user_operator_or_raise(
                    user
                ).operator,
            )

        # Calculate and attach the outstanding balance
        if compliance_report_version:
            compliance_report_version.outstanding_balance = ComplianceReportVersionService.calculate_outstanding_balance(compliance_report_version)  # type: ignore[attr-defined]

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
        payments = ElicensingPayment.objects.filter(elicensing_line_item__elicensing_invoice=refreshed_data.invoice)

        return PaymentDataWithFreshnessFlag(data_is_fresh=refreshed_data.data_is_fresh, data=payments)
