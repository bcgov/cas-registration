from uuid import UUID
from compliance.service.compliance_summary_service import ComplianceSummaryService
from django.db.models import QuerySet, OuterRef, Subquery
from compliance.models.compliance_summary import ComplianceSummary
from compliance.models.issuance_request import IssuanceRequest
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from registration.models.operation import Operation
from typing import Optional


class ComplianceDashboardService:
    """
    Service providing data operations for the compliance dashboard
    """

    @classmethod
    def get_compliance_summaries_for_dashboard(cls, user_guid: UUID) -> QuerySet[ComplianceSummary]:
        """
        Fetches all compliance summaries for the user's operations
        """
        user = UserDataAccessService.get_by_guid(user_guid)

        # Get the latest compliance summary for each operation
        # First, get the latest submitted report version for each operation
        compliance_summary_subquery = (
            ComplianceSummary.objects.filter(
                report__operation_id=OuterRef("id"),
                current_report_version__status='Submitted',
            )
            .select_related('report', 'report__operation', 'compliance_period', 'obligation')
            .order_by('-compliance_period__end_date')
            .values('id')[:1]  # Take only the first one (most recent compliance period)
        )

        operations = (
            OperationDataAccessService.get_all_operations_for_user(user)
            .filter(status=Operation.Statuses.REGISTERED)
            .annotate(compliance_summary_id=Subquery(compliance_summary_subquery))
        )

        # Get all compliance summaries for the filtered operations
        summaries = (
            ComplianceSummary.objects.select_related('report', 'report__operation', 'compliance_period', 'obligation')
            .filter(id__in=[op.compliance_summary_id for op in operations if hasattr(op, 'compliance_summary_id')])
            .order_by('-compliance_period__end_date', 'report__operation__name')
        )

        # Calculate and attach the outstanding balance to each summary
        for summary in summaries:
            summary.outstanding_balance = ComplianceSummaryService.calculate_outstanding_balance(summary)  # type: ignore[attr-defined]

        return summaries

    @classmethod
    def get_compliance_summary_by_id(cls, user_guid: UUID, summary_id: int) -> Optional[ComplianceSummary]:
        """
        Fetches a specific compliance summary by ID if it belongs to one of the user's operations

        Args:
            user_guid: The GUID of the user requesting the summary
            summary_id: The ID of the compliance summary to retrieve

        Returns:
            The requested ComplianceSummary object or None if not found
        """
        user = UserDataAccessService.get_by_guid(user_guid)

        # Get all operations the user has access to
        operations = OperationDataAccessService.get_all_operations_for_user(user).filter(
            status=Operation.Statuses.REGISTERED
        )

        # Get the compliance summary if it belongs to one of the user's operations
        summary = (
            ComplianceSummary.objects.select_related(
                'report', 'report__operation', 'current_report_version', 'compliance_period', 'obligation'
            )
            .filter(id=summary_id, report__operation__in=operations)
            .first()
        )

        # Calculate and attach the outstanding balance
        if summary:
            summary.outstanding_balance = ComplianceSummaryService.calculate_outstanding_balance(summary)  # type: ignore[attr-defined]

        return summary

    @classmethod
    def get_compliance_summary_issuance_data(cls, user_guid: UUID, summary_id: int) -> Optional[ComplianceSummary]:
        """
        Fetches issuance data for a specific compliance summary

        Args:
            user_guid: The GUID of the user requesting the issuance data
            summary_id: The ID of the compliance summary to retrieve issuance data for

        Returns:
            The ComplianceSummary object augmented with issuance data or None if not found
        """
        summary = cls.get_compliance_summary_by_id(user_guid, summary_id)

        if not summary:
            return None

        earned_credits: int = 100
        earned_credits_issued = False
        issuance_status = "Issuance not requested"

        if summary.excess_emissions < 0:
            # Convert Decimal to int
            earned_credits = int(abs(summary.excess_emissions))

            earned_credits_issued = False

        excess_emissions_percentage = None
        if summary.emission_limit and summary.emission_limit > 0:
            excess_emissions_percentage = round(
                (summary.emissions_attributable_for_compliance / summary.emission_limit) * 100, 2
            )

        setattr(summary, "earned_credits", earned_credits)
        setattr(summary, "earned_credits_issued", earned_credits_issued)
        setattr(summary, "issuance_status", issuance_status)
        setattr(summary, "excess_emissions_percentage", excess_emissions_percentage)

        return summary

    @classmethod
    def get_compliance_summary_request_issuance_data(
        cls, user_guid: UUID, summary_id: int
    ) -> Optional[ComplianceSummary]:
        """
        Fetches request issuance data for a specific compliance summary

        Args:
            user_guid: The GUID of the user requesting the issuance data
            summary_id: The ID of the compliance summary to retrieve issuance data for

        Returns:
            The ComplianceSummary object augmented with request issuance data or None if not found
        """
        summary = cls.get_compliance_summary_by_id(user_guid, summary_id)

        if not summary:
            return None

        setattr(summary, "bccr_holding_account_id", "123456789012345")
        setattr(summary, "bccr_trading_name", "Colour Co.")

        return summary

    @classmethod
    def get_request_issuance_track_status(cls, user_guid: UUID, summary_id: int) -> Optional[ComplianceSummary]:
        """
        Returns a ComplianceSummary instance with request issuance track status data

        Raises:
            NotFoundError: If no issuance request is found for the given compliance summary
        """
        try:
            summary = ComplianceSummary.objects.select_related(
                'report', 'report__operation', 'compliance_period', 'issuance_request'
            ).get(id=summary_id)

            if hasattr(summary, 'issuance_request') and summary.issuance_request is not None:
                setattr(summary, 'bccr_trading_name', summary.issuance_request.bccr_trading_name)
                setattr(summary, 'issuance_status', summary.issuance_request.status)
                setattr(summary, 'directors_comments', summary.issuance_request.directors_comments)
                setattr(summary, 'earned_credits', summary.issuance_request.earned_credits)
            else:
                raise Exception(f"Issuance request status not found for compliance summary {summary_id}")

            return summary

        except IssuanceRequest.DoesNotExist:
            return None
