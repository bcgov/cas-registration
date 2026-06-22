from unittest.mock import patch
from registration.models import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestOperationsPreviousReportableEndpoint(CommonTestSetup):
    @patch("service.operation_service.OperationService.list_previous_reportable_operations")
    def test_list_previous_reportable_operations(
        self,
        mock_list_previous_reportable_operations,
    ):
        # Arrange: Mock service data
        mock_list_previous_reportable_operations.return_value = [
            {
                "operation_id": "123",
                "operation_name": "Test Operation",
                "reporting_year": 2023,
                "registration_purposes": [
                    Operation.Purposes.REPORTING_OPERATION,
                ],
            }
        ]

        # Act: Authorize user and perform GET request
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("list_previous_reportable_operations"),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called
        mock_list_previous_reportable_operations.assert_called_once()
