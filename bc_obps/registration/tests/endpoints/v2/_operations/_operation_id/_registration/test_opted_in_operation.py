from registration.models import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationRegistrationOptedInOperationEndpoints(CommonTestSetup):
    def test_opted_in_operation_detail_endpoint_users_can_only_get_their_operation(self):
        baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation: Operation = baker.make_recipe(
            'utils.operation',
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "operation_registration_get_opted_in_operation_detail", kwargs={'operation_id': operation.id}
            ),
        )
        assert response.status_code == 401
        assert response.json()['message'] == "Unauthorized."

    def test_get_opted_in_operation_detail_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        opted_in_operation = baker.make_recipe(
            'utils.opted_in_operation_detail',
        )
        operation: Operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, opted_in_operation=opted_in_operation
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "operation_registration_get_opted_in_operation_detail", kwargs={'operation_id': operation.id}
            ),
        )
        assert response.status_code == 200
        assert response.json() == {
            "meets_section_3_emissions_requirements": True,
            "meets_electricity_import_operation_criteria": True,
            "meets_entire_operation_requirements": True,
            "meets_section_6_emissions_requirements": True,
            "meets_naics_code_11_22_562_classification_requirements": True,
            "meets_producing_gger_schedule_a1_regulated_product": False,
            "meets_reporting_and_regulated_obligations": False,
            "meets_notification_to_director_on_criteria_change": False,
        }

    # PUT
    def test_opted_in_operation_detail_endpoint_users_can_only_update_their_operation(self):
        # authorize current user
        baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'utils.operation',
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "meets_section_3_emissions_requirements": True,
                "meets_electricity_import_operation_criteria": True,
                "meets_entire_operation_requirements": True,
                "meets_section_6_emissions_requirements": True,
                "meets_naics_code_11_22_562_classification_requirements": True,
                "meets_producing_gger_schedule_a1_regulated_product": True,
                "meets_reporting_and_regulated_obligations": True,
                "meets_notification_to_director_on_criteria_change": True,
            },
            custom_reverse_lazy(
                "operation_registration_get_opted_in_operation_detail", kwargs={'operation_id': operation.id}
            ),
        )
        assert response.status_code == 401
        assert response.json()['message'] == "Unauthorized."

    def test_update_opted_in_operation_detail_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        opted_in_operation = baker.make_recipe(
            'utils.opted_in_operation_detail',
            created_by=self.user,
        )
        operation: Operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, opted_in_operation=opted_in_operation
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "meets_section_3_emissions_requirements": False,
                "meets_electricity_import_operation_criteria": False,
                "meets_entire_operation_requirements": False,
                "meets_section_6_emissions_requirements": False,
                "meets_naics_code_11_22_562_classification_requirements": False,
                "meets_producing_gger_schedule_a1_regulated_product": False,
                "meets_reporting_and_regulated_obligations": False,
                "meets_notification_to_director_on_criteria_change": False,
            },
            custom_reverse_lazy(
                "operation_registration_get_opted_in_operation_detail", kwargs={'operation_id': operation.id}
            ),
        )
        # Assert
        assert response.status_code == 200
        # Additional Assertions
        updated_operation: Operation = Operation.objects.get(id=operation.id)
        assert updated_operation.opted_in_operation is not None
        assert updated_operation.opted_in_operation.meets_section_3_emissions_requirements is False
        assert updated_operation.opted_in_operation.meets_electricity_import_operation_criteria is False
        assert updated_operation.opted_in_operation.meets_entire_operation_requirements is False
        assert updated_operation.opted_in_operation.meets_section_6_emissions_requirements is False
        assert updated_operation.opted_in_operation.meets_naics_code_11_22_562_classification_requirements is False
        assert updated_operation.opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is False
        assert updated_operation.opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert updated_operation.opted_in_operation.meets_notification_to_director_on_criteria_change is False
        assert updated_operation.opted_in_operation.updated_by == self.user
        assert updated_operation.opted_in_operation.updated_at is not None

    def test_update_opted_in_operation_detail_endpoint_malformed_data(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        opted_in_operation = baker.make_recipe(
            'utils.opted_in_operation_detail',
            created_by=self.user,
        )
        operation: Operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, opted_in_operation=opted_in_operation
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "bad data": "im bad",
            },
            custom_reverse_lazy(
                "operation_registration_get_opted_in_operation_detail", kwargs={'operation_id': operation.id}
            ),
        )
        assert response.status_code == 422
