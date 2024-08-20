from registration.models.operation import Operation
from registration.models.registration_purpose import RegistrationPurpose
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationRegistrationInformationEndpoint(CommonTestSetup):
    def test_register_operation_information_endpoint_unauthorized_roles_cannot_put(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        # cas users and unapproved industry users can't put
        roles = ["cas_pending", "cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                {
                    'registration_purpose': RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
                },
                custom_reverse_lazy("register_operation_information", kwargs={'operation_id': operation.id}),
            )
            assert response.status_code == 401
            assert response.json()['detail'] == "Unauthorized"

    def test_users_cannot_update_other_users_operations(self):
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
                'registration_purpose': RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
            },
            custom_reverse_lazy("register_operation_information", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401

    def test_register_operation_information_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'registration_purpose': RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
            },
            custom_reverse_lazy("register_operation_information", kwargs={'operation_id': operation.id}),
        )
        response_json = response.json()

        # Assert
        assert response.status_code == 200
        # Additional Assertions
        assert response_json['id'] == str(operation.id)

    def test_register_operation_information_endpoint_fail(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'bad data': 'im bad',
            },
            custom_reverse_lazy("register_operation_information", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 422


class TestOperationRegistrationSubmissionEndpoint(CommonTestSetup):
    def test_submission_endpoint_unauthorized_roles_cannot_patch(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        roles = ["cas_pending", "cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_patch_with_auth_role(
                self,
                role,
                self.content_type,
                {},
                custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
            )
            assert response.status_code == 401
            assert response.json()['detail'] == "Unauthorized"

    def test_submission_endpoint_users_can_only_update_their_operations(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'acknowledgement_of_review': True,
                'acknowledgement_of_information': True,
                'acknowledgement_of_records': True,
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401

    def test_submission_endpoint_raises_exception_if_not_all_checkboxes_are_checked(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'acknowledgement_of_review': True,
                'acknowledgement_of_information': True,
                'acknowledgement_of_records': False,
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 400
        assert response.json()['message'] == "All checkboxes must be checked to submit the registration."

    def test_submission_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'acknowledgement_of_review': True,
                'acknowledgement_of_information': True,
                'acknowledgement_of_records': True,
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
        )
        # Assert
        assert response.status_code == 200
        # Additional Assertions
        response_operation: Operation = Operation.objects.get(id=operation.id)
        assert response_operation.status == Operation.Statuses.REGISTERED

    def test_submission_endpoint_malformed_data(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'bad data': 'im bad',
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 422


class TestOperationRegistrationOptedInOperationEndpoints(CommonTestSetup):
    # GET
    def test_opted_in_operation_detail_endpoint_unauthorized_roles_cannot_get(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        roles = ["cas_pending", "cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(
                self,
                role,
                custom_reverse_lazy(
                    "operation_registration_get_opted_in_operation_detail", kwargs={'operation_id': operation.id}
                ),
            )
            assert response.status_code == 401
            assert response.json()['detail'] == "Unauthorized"

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
    def test_opted_in_operation_detail_endpoint_unauthorized_roles_cannot_put(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        roles = ["cas_pending", "cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                {},
                custom_reverse_lazy(
                    "operation_registration_update_opted_in_operation_detail", kwargs={'operation_id': operation.id}
                ),
            )
            assert response.status_code == 401
            assert response.json()['detail'] == "Unauthorized"

    def test_opted_in_operation_detail_endpoint_users_can_only_update_their_operation(self):
        # authorize current user
        baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'utils.operation',
        )
        # TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
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
                "operation_registration_update_opted_in_operation_detail", kwargs={'operation_id': operation.id}
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
                "operation_registration_update_opted_in_operation_detail", kwargs={'operation_id': operation.id}
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
                "operation_registration_update_opted_in_operation_detail", kwargs={'operation_id': operation.id}
            ),
        )
        assert response.status_code == 422
