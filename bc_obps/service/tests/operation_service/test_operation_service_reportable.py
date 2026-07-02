import pytest
from uuid import uuid4
from unittest.mock import patch, MagicMock
from model_bakery import baker
from registration.models import Operation
from service.operation_service import OperationService

pytestmark = pytest.mark.django_db


class TestOperationServiceReportable:
    @staticmethod
    def test_is_reportable_operation_year():
        op_id = uuid4()
        operation_year = (op_id, 2023)

        assert OperationService._is_reportable_operation_year(operation_year, set(), set()) is True
        assert OperationService._is_reportable_operation_year(operation_year, {operation_year}, set()) is False
        assert OperationService._is_reportable_operation_year(operation_year, set(), {operation_year}) is False

    @staticmethod
    @patch("service.reporting_year_service.ReportingYearService.get_current_reporting_year")
    def test_get_previous_reporting_years(mock_get_current_reporting_year: MagicMock):
        baker.make_recipe("reporting.tests.utils.reporting_year", reporting_year=2091)
        baker.make_recipe("reporting.tests.utils.reporting_year", reporting_year=2092)
        current_year = baker.make_recipe(
            "reporting.tests.utils.reporting_year",
            reporting_year=2093,
        )

        mock_get_current_reporting_year.return_value = current_year

        results = OperationService._get_previous_reporting_years().filter(
            reporting_year__in=[2091, 2092, 2093],
        )

        assert results.count() == 2
        assert results[0].reporting_year == 2092
        assert results[1].reporting_year == 2091

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

        mock_reporting_year = MagicMock()
        mock_reporting_year.reporting_year = 2022

        result = OperationService._build_reportable_operation_row(
            operation,
            mock_reporting_year,
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
    @patch(
        "service.operation_designated_operator_timeline_service."
        "OperationDesignatedOperatorTimelineService.get_operation_designated_operators_for_reporting_years"
    )
    @patch.object(OperationService, "_get_previous_reporting_years")
    def test_list_previous_reportable_operations(
        mock_get_previous_reporting_years: MagicMock,
        mock_get_designations: MagicMock,
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
        )

        fallback_op = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.LFO,
            name="Fallback Op",
        )

        reporting_year_2092 = baker.make_recipe(
            "reporting.tests.utils.reporting_year",
            reporting_year=2092,
        )

        baker.make_recipe(
            "reporting.tests.utils.report",
            operation=designated_op,
            reporting_year=reporting_year_2092,
        )

        mock_timeline_match = MagicMock()
        mock_timeline_match.operator.id = user_operator.operator_id

        mock_get_designations.return_value = {
            (designated_op.id, 2091): mock_timeline_match,
            (designated_op.id, 2092): mock_timeline_match,
        }

        results = OperationService.list_previous_reportable_operations(user_guid)

        assert len(results) == 3

        designated_results = [result for result in results if result["operation_id"] == designated_op.id]
        assert len(designated_results) == 1
        assert designated_results[0]["reporting_year"] == 2091
        assert designated_results[0]["is_current_registered_fallback"] is False
        assert designated_results[0]["registration_purposes"] == [
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
            Operation.Purposes.REPORTING_OPERATION,
        ]

        fallback_results = [result for result in results if result["operation_id"] == fallback_op.id]
        assert len(fallback_results) == 2
        assert any(result["reporting_year"] == 2092 for result in fallback_results)
        assert any(result["reporting_year"] == 2091 for result in fallback_results)
        assert all(result["is_current_registered_fallback"] is True for result in fallback_results)

        mock_get_user_operator.assert_called_once_with(user_guid)
        mock_get_designations.assert_called_once()
