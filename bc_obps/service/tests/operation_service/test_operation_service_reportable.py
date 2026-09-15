import pytest
from uuid import uuid4
from unittest.mock import patch, MagicMock
from model_bakery import baker
from registration.models import Operation
from service.operation_service import OperationService

pytestmark = pytest.mark.django_db


class TestOperationServiceReportable:
    @staticmethod
    def test_get_registration_purposes_for_operation_type_sfo_lfo():
        expected_purposes = [
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
            Operation.Purposes.REPORTING_OPERATION,
        ]

        assert OperationService._get_registration_purposes_for_operation_type(Operation.Types.SFO) == expected_purposes
        assert OperationService._get_registration_purposes_for_operation_type(Operation.Types.LFO) == expected_purposes

    @staticmethod
    def test_get_registration_purposes_for_operation_type_eio():
        assert OperationService._get_registration_purposes_for_operation_type(Operation.Types.EIO) == [
            Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
        ]

    @staticmethod
    @patch.object(OperationService, "_get_registration_purposes_for_operation_type")
    def test_build_reportable_operation_row(mock_get_purposes: MagicMock):
        mock_purposes = [Operation.Purposes.REPORTING_OPERATION]
        mock_get_purposes.return_value = mock_purposes

        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            type=Operation.Types.SFO,
            name="Test Row Operation",
        )

        result = OperationService._build_reportable_operation_row(
            operation,
            2022,
        )

        assert result == {
            "operation_id": operation.id,
            "operation_name": "Test Row Operation",
            "reporting_year": 2022,
            "registration_purposes": mock_purposes,
        }
        mock_get_purposes.assert_called_once_with(Operation.Types.SFO)

    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_user_operator_by_user")
    @patch("service.reporting_year_service.ReportingYearService.get_previous_reporting_years")
    def test_list_previous_reportable_operations(
        mock_get_previous_reporting_years: MagicMock,
        mock_get_user_operator: MagicMock,
    ):
        user_guid = uuid4()

        user_operator = baker.make_recipe(
            "registration.tests.utils.approved_user_operator",
        )
        mock_get_user_operator.return_value = user_operator

        year_2091 = MagicMock(reporting_year=2091)
        year_2092 = MagicMock(reporting_year=2092)
        mock_get_previous_reporting_years.return_value = [year_2092, year_2091]

        # Designated operation with no existing reports, should result in 2 records being returned
        designated_op = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.SFO,
            name="Designated Op",
        )

        baker.make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=designated_op,
            operator=user_operator.operator,
            start_date='2090-01-01',
            end_date=None,
        )

        # Designated operation, but should only result in 1 record returned due to the existing 2091 report
        op_with_report_2091 = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.SFO,
            name="Op With 2021 Report",
        )

        baker.make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=op_with_report_2091,
            operator=user_operator.operator,
            start_date='2090-01-01',
            end_date='2099-01-01',
        )

        # Operation that is not designated to the operator via a timeline record, should not be included in the results
        baker.make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.LFO,
            name="Ignored Op",
        )

        reporting_year_2092 = baker.make_recipe(
            "reporting.tests.utils.reporting_year",
            reporting_year=2092,
        )

        baker.make_recipe(
            "reporting.tests.utils.report",
            operation=op_with_report_2091,
            reporting_year=reporting_year_2092,
        )

        results = OperationService.list_previous_reportable_operations(user_guid)
        print(results)
        assert len(results) == 3
        # Two results from the designated operation with no reports for the 2 reporting years
        assert len([x for x in results if x.get("operation_name") == "Designated Op"]) == 2
        # One result from the designated operation with a report for the 2091 reporting year
        assert len([x for x in results if x.get("operation_name") == "Op With 2021 Report"]) == 1
        # No results for operation that should be ignored
        assert len([x for x in results if x.get("operation_name") == "Ignored Op"]) == 0
