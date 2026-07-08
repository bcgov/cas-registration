import pytest
from unittest import mock
from common.exceptions import UserError
from model_bakery.baker import make_recipe
from registration.models import Operation
from registration.tests.utils.bakers import (
    bc_obps_regulated_operation_baker,
    operation_baker,
    operator_baker,
)
from reporting.models import ReportVersion
from service.report_service import ReportService


USER_GUID = "00000000-0000-0000-0000-000000000000"
REPORTING_YEAR = 2024


def make_past_report_data(
    operation_id,
    registration_purpose=Operation.Purposes.REPORTING_OPERATION,
):
    data = mock.Mock()
    data.operation_id = operation_id
    data.reporting_year = REPORTING_YEAR
    data.registration_purpose = registration_purpose
    return data


def mock_user_operator(mock_get_user_operator, operator):
    mock_get_user_operator.return_value.operator_id = operator.id
    mock_get_user_operator.return_value.operator = operator


@pytest.mark.django_db
class TestReportServicePastReport:
    @pytest.mark.parametrize(
        "operation_type, selected_registration_purpose, has_boro",
        [
            (
                Operation.Types.LFO,
                Operation.Purposes.REPORTING_OPERATION,
                True,
            ),
            (
                Operation.Types.EIO,
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
                False,
            ),
        ],
    )
    def test_create_report_for_reporting_year_uses_selected_registration_purpose(
        self,
        operation_type,
        selected_registration_purpose,
        has_boro,
    ):
        operator = operator_baker()
        operation = operation_baker(
            operator_id=operator.id,
            type=operation_type,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
            bc_obps_regulated_operation=(bc_obps_regulated_operation_baker() if has_boro else None),
        )

        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operator=operator,
            operation=operation,
            start_date="2024-01-01",
            end_date=None,
        )

        data = make_past_report_data(
            operation.id,
            selected_registration_purpose,
        )

        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists",
                return_value=False,
            ),
            mock.patch(
                "service.data_access_service.user_service.UserDataAccessService.get_user_operator_by_user",
            ) as mock_get_user_operator,
        ):
            mock_user_operator(mock_get_user_operator, operator)

            report_version_id = ReportService.create_report_for_reporting_year(
                user_guid=USER_GUID,
                data=data,
            )

        report_version = ReportVersion.objects.get(id=report_version_id)
        operation.refresh_from_db()

        assert operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert report_version.report_operation.registration_purpose == selected_registration_purpose

    def test_create_report_for_reporting_year_fallback_rejects_unregistered_operation(
        self,
    ):
        operator = operator_baker()
        operation = operation_baker(
            operator_id=operator.id,
            type=Operation.Types.LFO,
            status=Operation.Statuses.DRAFT,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            bc_obps_regulated_operation=None,
        )

        data = make_past_report_data(operation.id)

        with (
            mock.patch(
                "service.report_service.OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year",
                return_value=None,
            ),
            mock.patch(
                "service.data_access_service.user_service.UserDataAccessService.get_user_operator_by_user",
            ) as mock_get_user_operator,
        ):
            mock_user_operator(mock_get_user_operator, operator)

            with pytest.raises(UserError) as exception_context:
                ReportService.create_report_for_reporting_year(
                    user_guid=USER_GUID,
                    data=data,
                )

        assert (
            str(exception_context.value)
            == "Only currently registered operations can be used to create a report for this reporting year."
        )

    def test_create_report_for_reporting_year_rejects_existing_report(self):
        operator = operator_baker()
        operation = operation_baker(
            operator_id=operator.id,
            type=Operation.Types.LFO,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            bc_obps_regulated_operation=bc_obps_regulated_operation_baker(),
        )

        data = make_past_report_data(operation.id)

        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists",
                return_value=True,
            ),
            mock.patch(
                "service.report_service.OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year",
                return_value=None,
            ),
            mock.patch(
                "service.data_access_service.user_service.UserDataAccessService.get_user_operator_by_user",
            ) as mock_get_user_operator,
        ):
            mock_user_operator(mock_get_user_operator, operator)

            with pytest.raises(UserError) as exception_context:
                ReportService.create_report_for_reporting_year(
                    user_guid=USER_GUID,
                    data=data,
                )

        assert (
            str(exception_context.value)
            == "A report already exists for this operation and year, unable to create a new one."
        )
