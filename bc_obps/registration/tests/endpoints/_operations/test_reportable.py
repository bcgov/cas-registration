from unittest.mock import patch
from registration.models import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery.baker import make_recipe


class TestOperationsPreviousReportableEndpoint(CommonTestSetup):
    @patch("service.operation_service.OperationService.list_previous_reportable_operations")
    def test_list_previous_reportable_operations(
        self,
        mock_list_previous_reportable_operations,
    ):
        approved_user_operator = make_recipe(
            "registration.tests.utils.approved_user_operator",
            user=self.user,
        )

        operation = make_recipe(
            "registration.tests.utils.operation",
            operator=approved_user_operator.operator,
        )

        mock_list_previous_reportable_operations.return_value = [
            {
                "operation_id": operation.id,
                "operation_name": operation.name,
                "reporting_year": 2023,
                "registration_purposes": [
                    Operation.Purposes.REPORTING_OPERATION,
                ],
            }
        ]

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("list_previous_reportable_operations"),
        )

        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0].get("operation_name") == operation.name
        assert response.json()[0].get("operation_id") == str(operation.id)
        assert response.json()[0].get("reporting_year") == 2023
        assert response.json()[0].get("registration_purposes") == [
            Operation.Purposes.REPORTING_OPERATION,
        ]

        mock_list_previous_reportable_operations.assert_called_once()
