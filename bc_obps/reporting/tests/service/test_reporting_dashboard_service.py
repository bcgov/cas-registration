from unittest.mock import AsyncMock, patch, MagicMock
import pytest
from registration.models.operation import Operation
from registration.tests.utils.bakers import operation_baker, operator_baker, user_baker
from reporting.service.reporting_dashboard_service import ReportingDashboardService
from reporting.tests.utils.bakers import report_version_baker, reporting_year_baker
from service.report_service import ReportService
from reporting.models.report_version import ReportVersion


@pytest.mark.django_db
class TestReportingDashboardService:
    @patch("service.data_access_service.operation_service.OperationDataAccessService.get_all_operations_for_user")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_operations_for_reporting_dashboard(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
        mock_get_all_operations_for_user: MagicMock | AsyncMock,
    ):
        user = user_baker()
        mock_get_by_guid.return_value = user
        mock_get_all_operations_for_user.side_effect = lambda user: Operation.objects.all()

        year = reporting_year_baker(reporting_year=5091)
        operator = operator_baker()
        operations = operation_baker(operator_id=operator.id, _quantity=3)

        # Create reports for first two operations
        r0_version1_id = ReportService.create_report(operations[0].id, year.reporting_year)
        r0_version1 = ReportVersion.objects.get(id=r0_version1_id)
        r0_version1.status = "Submitted"
        r0_version1.save()

        r0 = ReportVersion.objects.get(pk=r0_version1_id).report
        latest_r0_revision = report_version_baker(report=r0)

        r1_version1_id = ReportService.create_report(operations[1].id, year.reporting_year)
        r1 = ReportVersion.objects.get(pk=r1_version1_id).report

        result = ReportingDashboardService.get_operations_for_reporting_dashboard(user.user_guid, 5091).values()
        result_list = list(result)

        assert len(result_list) == 3

        # Create dictionaries for easy lookup by operation ID
        result_dict = {str(item["id"]): item for item in result_list}

        # Test operation with multiple versions
        op0_result = result_dict[str(operations[0].id)]
        assert op0_result["name"] == operations[0].name
        assert op0_result["bcghg_id_id"] == (operations[0].bcghg_id.id if operations[0].bcghg_id is not None else None)
        assert op0_result["report_id"] == r0.id
        assert op0_result["report_version_id"] == latest_r0_revision.id
        assert op0_result["report_status"] == latest_r0_revision.status

        # Test operation with single version
        op1_result = result_dict[str(operations[1].id)]
        assert op1_result["name"] == operations[1].name
        assert op1_result["bcghg_id_id"] == (operations[1].bcghg_id.id if operations[0].bcghg_id is not None else None)
        assert op1_result["report_id"] == r1.id
        assert op1_result["report_version_id"] == r1.report_versions.first().id
        assert op1_result["report_status"] == r1.report_versions.first().status

        # Test operation with no report
        op2_result = result_dict[str(operations[2].id)]
        assert op2_result["name"] == operations[2].name
        assert op2_result["bcghg_id_id"] == (operations[2].bcghg_id.id if operations[0].bcghg_id is not None else None)
        assert op2_result["report_id"] is None
        assert op2_result["report_version_id"] is None
        assert op2_result["report_status"] is None
