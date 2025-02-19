from uuid import UUID
from django.db.models import QuerySet, OuterRef, Subquery
from compliance.models.compliance_summary import ComplianceSummary
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from registration.models.operation import Operation


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
        compliance_summary_subquery = (
            ComplianceSummary.objects.filter(report__operation_id=OuterRef("id"))
            .select_related('report', 'report__operation', 'compliance_period', 'obligation')
            .order_by('-compliance_period__end_date')
        )

        operations = (
            OperationDataAccessService.get_all_operations_for_user(user)
            .filter(status=Operation.Statuses.REGISTERED)
            .annotate(compliance_summary_id=Subquery(compliance_summary_subquery.values('id')[:1]))
        )

        # Get all compliance summaries for the filtered operations
        return (
            ComplianceSummary.objects.select_related('report', 'report__operation', 'compliance_period', 'obligation')
            .filter(id__in=[op.compliance_summary_id for op in operations if op.compliance_summary_id])
            .order_by('-compliance_period__end_date', 'report__operation__name')
        )
