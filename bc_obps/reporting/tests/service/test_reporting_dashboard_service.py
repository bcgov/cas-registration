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
        self, mock_get_by_guid: MagicMock | AsyncMock, mock_get_all_operations_for_user: MagicMock | AsyncMock
    ):
        user = user_baker()
        mock_get_by_guid.return_value = user
        mock_get_all_operations_for_user.side_effect = lambda user: Operation.objects.all()

        year = reporting_year_baker(reporting_year=5091)
        operator = operator_baker()
        operations = operation_baker(operator_id=operator.id, _quantity=3)

        r0_version1_id = ReportService.create_report(operations[0].id, year.reporting_year)
        r0 = ReportVersion.objects.get(pk=r0_version1_id).report
        latest_r0_revision = report_version_baker(report=r0)

        r1_version1_id = ReportService.create_report(operations[1].id, year.reporting_year)
        r1 = ReportVersion.objects.get(pk=r1_version1_id).report

        result = ReportingDashboardService.get_operations_for_reporting_dashboard(user.user_guid, 5091).values()

        print(r0.id, result[0]["report_id"])
        print(operations[0].id, result[0]["id"])
        print(r1.id, result[1]["report_id"])
        print(operations[1].id, result[1]["id"])
        print(result[2]["report_id"])
        print(operations[2].id, result[2]["id"])

        assert len(result) == 3

        # Returns the latest version info if there are multiple versions
        assert result[0]["id"] == operations[0].id
        assert result[0]["name"] == operations[0].name
        assert result[0]["bcghg_id"] == operations[0].bcghg_id
        assert result[0]["report_id"] == r0.id
        assert result[0]["report_version_id"] == latest_r0_revision.id
        assert result[0]["report_status"] == latest_r0_revision.status

        # Returns the only version info if there is only a single version
        assert result[1]["id"] == operations[1].id
        assert result[1]["name"] == operations[1].name
        assert result[1]["bcghg_id"] == operations[1].bcghg_id
        assert result[1]["report_id"] == r1.id
        assert result[1]["report_version_id"] == r1.report_versions.first().id
        assert result[1]["report_status"] == r1.report_versions.first().status

        # Returns None if there is no report associated to that operation/year
        assert result[2]["id"] == operations[2].id
        assert result[2]["name"] == operations[2].name
        assert result[2]["bcghg_id"] == operations[2].bcghg_id
        assert result[2]["report_id"] is None
        assert result[2]["report_version_id"] is None
        assert result[2]["report_status"] is None
