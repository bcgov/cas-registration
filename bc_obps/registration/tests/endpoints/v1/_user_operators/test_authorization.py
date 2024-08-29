from model_bakery import baker
from registration.models import (
    BusinessStructure,
    Operator,
    UserOperator,
)
from registration.tests.utils.bakers import (
    operator_baker,
    user_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorEndpointAuthorization(CommonTestSetup):
    def test_user_operator_unauthorized_users_cannot_get(self):
        # /user-operators/current/is-current-user-approved-admin
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            custom_reverse_lazy('is_current_user_approved_admin'),
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_admin',
            custom_reverse_lazy('is_current_user_approved_admin'),
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_analyst',
            custom_reverse_lazy('is_current_user_approved_admin'),
        )
        assert response.status_code == 401

        user_operator = user_operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            custom_reverse_lazy('get_user_operator_by_id', kwargs={'user_operator_id': user_operator.id}),
        )
        assert response.status_code == 401

        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', custom_reverse_lazy('get_pending_operator_and_user_operator')
        )
        assert response.status_code == 401

        # user-operator-status-from-user
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', custom_reverse_lazy('get_pending_operator_and_user_operator')
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_admin', custom_reverse_lazy('get_pending_operator_and_user_operator')
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_analyst', custom_reverse_lazy('get_pending_operator_and_user_operator')
        )
        assert response.status_code == 401

    def test_user_operator_unauthorized_users_cannot_post(self):
        # operators/request-access
        operator = operator_baker()
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_post_with_auth_role(
                self,
                role,
                self.content_type,
                {},
                custom_reverse_lazy('request_access', kwargs={'operator_id': operator.id}),
            )
            assert response.status_code == 401
        # /operators/{operator_id}/request-admin-access
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_post_with_auth_role(
                self,
                role,
                self.content_type,
                {},
                custom_reverse_lazy('request_admin_access', kwargs={'operator_id': operator.id}),
            )
            assert response.status_code == 401

        mock_data = TestUtils.mock_create_user_operator_operator()
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_pending',
            self.content_type,
            mock_data,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_analyst',
            self.content_type,
            mock_data,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            mock_data,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert response.status_code == 401

    def test_unauthorized_users_cannot_put(self):
        # user-operators/{id}/update-status
        user_operator_1 = user_operator_baker()
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_pending',
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                'status': UserOperator.Statuses.APPROVED,
            },
            custom_reverse_lazy('update_user_operator_status', kwargs={"user_operator_id": user_operator_1.id}),
        )
        assert response.status_code == 401
        # only industry_user admins can change statuses
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        user_operator_2 = TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        user_operator_2.role = UserOperator.Roles.REPORTER
        user_operator_2.save()

        subsequent_user_operator = baker.make(UserOperator, operator=operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {"role": UserOperator.Roles.REPORTER, "status": UserOperator.Statuses.APPROVED},
            custom_reverse_lazy(
                'update_user_operator_status', kwargs={"user_operator_id": subsequent_user_operator.id}
            ),
        )
        assert response.status_code == 401

        mock_payload = {
            "legal_name": "Operation 1 Legal Name",
            "cra_business_number": 987654321,
            "bc_corporate_registry_number": "abc1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "test physical province",
            "physical_postal_code": "test physical postal code",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
            "parent_operators_array": [],
        }
        user_operator = user_operator_baker()
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                mock_payload,
                custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
            )
            assert response.status_code == 401
