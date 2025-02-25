from typing import List
from model_bakery import baker
from registration.models import (
    BusinessStructure,
    ParentOperator,
    UserOperator,
)
from registration.tests.utils.bakers import (
    operator_baker,
    parent_operator_baker,
    user_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorIdEndpoint(CommonTestSetup):
    def remove_all_parent_operators(self):
        child_operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=child_operator, user=self.user)

        parent_operator_1 = parent_operator_baker()
        parent_operator_1.child_operator_id = child_operator.id
        parent_operator_1.operator_index = 1
        parent_operator_1.save(update_fields=["child_operator_id", "operator_index"])

        parent_operator_2 = parent_operator_baker()
        parent_operator_2.child_operator_id = child_operator.id
        parent_operator_2.operator_index = 2
        parent_operator_2.save(update_fields=["child_operator_id", "operator_index"])

        unrelated_parent_operator = parent_operator_baker()
        unrelated_parent_operator.legal_name = "i should not be deleted"
        unrelated_parent_operator.operator_index = 1
        unrelated_parent_operator.save(update_fields=["legal_name", "operator_index"])

        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            TestUtils.create_mock_operator_payload(BusinessStructure.objects.first()),
            f"{self.user_operator_endpoint}/operator/{user_operator.id}",
        )
        assert response.status_code == 200

        parent_operators: List[ParentOperator] = child_operator.parent_operators.all()

        assert len(parent_operators) == 0  # archived records are not pulled

        # parent_operator_1 has been archived
        parent_operator_1.refresh_from_db()
        assert parent_operator_1.operator_index == 1
        assert parent_operator_1.archived_by is not None
        assert parent_operator_1.archived_at is not None

        # parent_operator_2 has been archived
        parent_operator_2.refresh_from_db()
        assert parent_operator_2.operator_index == 2
        assert parent_operator_2.archived_by is not None
        assert parent_operator_2.archived_at is not None

        # unrelated_parent_operator has the same id as parent_operator_1 and should be left alone as it doesn't belong to the child operator
        unrelated_parent_operator.refresh_from_db()
        assert unrelated_parent_operator.archived_by is None
        assert unrelated_parent_operator.archived_at is None

    def test_get_user_operator_data_industry_user_invalid_request(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        random_user_operator = user_operator_baker()

        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_user_operator_by_id', kwargs={'user_operator_id': random_user_operator.id}),
        )
        # returns 401 because the user_operator does not belong to the current user
        assert response.status_code == 403

    def test_get_user_operator_data_internal_user(self):
        operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_admin',
            custom_reverse_lazy('get_user_operator_by_id', kwargs={'user_operator_id': user_operator.id}),
        )
        assert response.status_code == 200

        expected_keys = [
            "role",
            "status",
            "legal_name",
            "trade_name",
            "cra_business_number",
            "bc_corporate_registry_number",
            "business_structure",
            "street_address",
            "municipality",
            "province",
            "postal_code",
            "operator_has_parent_operators",
            "parent_operators_array",
            "operator_has_partner_operators",
            "partner_operators_array",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "position_title",
            "bceid_business_name",
        ]
        assert sorted(response.json().keys()) == sorted(expected_keys)
