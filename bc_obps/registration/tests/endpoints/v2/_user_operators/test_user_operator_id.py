from typing import List
from model_bakery import baker
from registration.models import (
    BusinessStructure,
    Operator,
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
    def test_edit_and_archive_parent_operators(self):
        child_operator = operator_baker()
        user_operator = baker.make(
            UserOperator,
            operator=child_operator,
            user=self.user,
            role="admin",
            status="Approved",
        )

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

        mock_payload = {
            "legal_name": "New Operator",
            "trade_name": "New Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": True,
            "parent_operators_array": [
                {
                    "po_legal_name": "test po legal name-EDITED",
                    "po_cra_business_number": 123456789,
                    "po_bc_corporate_registry_number": "poo7654321",
                    "po_business_structure": BusinessStructure.objects.first().pk,
                    "po_website": "https://testpo.com",
                    "po_physical_street_address": "test po physical street address",
                    "po_physical_municipality": "test po physical municipality",
                    "po_physical_province": "ON",
                    "po_physical_postal_code": "H0H0H0",
                    "po_mailing_address_same_as_physical": True,
                    "operator_index": 2,
                },
            ],
        }
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_payload,
            custom_reverse_lazy(
                "update_operator_and_user_operator",
                kwargs={"user_operator_id": user_operator.id},
            ),
        )
        assert response.status_code == 200

        parent_operators: List[ParentOperator] = child_operator.parent_operators.all()

        assert len(parent_operators) == 1  # archived records are not pulled

        # parent_operator_1 has been archived
        parent_operator_1.refresh_from_db()
        assert parent_operator_1.operator_index == 1
        assert parent_operator_1.archived_by is not None
        assert parent_operator_1.archived_at is not None

        # parent_operator_2 has been edited
        assert parent_operators[0].legal_name == "test po legal name-EDITED"
        assert parent_operators[0].operator_index == 2
        assert parent_operators[0].archived_by is None
        assert parent_operators[0].archived_at is None

        # unrelated_parent_operator has the same id as parent_operator_1 and should be left alone as it doesn't belong to the child operator
        unrelated_parent_operator.refresh_from_db()
        assert unrelated_parent_operator.legal_name == "i should not be deleted"

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

    ## STATUS
    def test_draft_status_changes_to_pending(self):
        operator = operator_baker()
        operator.created_by = self.user
        operator.status = "Draft"
        operator.save(update_fields=["created_by", "status"])
        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
        )

        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            TestUtils.create_mock_operator_payload(BusinessStructure.objects.first()),
            custom_reverse_lazy(
                "update_operator_and_user_operator",
                kwargs={"user_operator_id": user_operator.id},
            ),
        )

        assert put_response.status_code == 200
        operator.refresh_from_db()
        assert operator.status == "Pending"

    def test_put_user_operator_operator(self):
        operator = operator_baker()
        operator.created_by = self.user
        operator.save(update_fields=["created_by"])
        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        mock_payload = TestUtils.create_mock_operator_payload(BusinessStructure.objects.first())
        mock_payload["operator_has_parent_operators"] = False
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_payload,
            custom_reverse_lazy(
                "update_operator_and_user_operator",
                kwargs={"user_operator_id": user_operator.id},
            ),
        )

        response_json = put_response.json()
        assert put_response.status_code == 200
        assert "user_operator_id" in response_json
        user_operator_id = response_json["user_operator_id"]
        user_operator = UserOperator.objects.get(id=user_operator_id)
        assert user_operator.user == self.user

        operator: Operator = user_operator.operator
        assert operator is not None
        assert operator.updated_by == self.user
        assert operator.updated_at is not None
        assert mock_payload == {
            "legal_name": operator.legal_name,
            "trade_name": operator.trade_name,
            "cra_business_number": operator.cra_business_number,
            "bc_corporate_registry_number": operator.bc_corporate_registry_number,
            "business_structure": operator.business_structure.pk,
            "physical_street_address": operator.physical_address.street_address,
            "physical_municipality": operator.physical_address.municipality,
            "physical_province": operator.physical_address.province,
            "physical_postal_code": operator.physical_address.postal_code,
            "mailing_address_same_as_physical": operator.mailing_address_id == operator.physical_address_id,
            "mailing_street_address": operator.mailing_address.street_address,
            "mailing_municipality": operator.mailing_address.municipality,
            "mailing_province": operator.mailing_address.province,
            "mailing_postal_code": operator.mailing_address.postal_code,
            "operator_has_parent_operators": operator.parent_operators.exists(),
            "parent_operators_array": list(operator.parent_operators.all()),
        }

    def test_put_user_operator_operator_with_an_existing_cra_business_number(self):
        self.user.role = "industry_user"
        existing_operator = operator_baker()
        new_operator = operator_baker({"created_by": self.user})
        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=new_operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        mock_payload = {
            "legal_name": "Put Operator Legal Name",
            "trade_name": "Put Operator Trade Name",
            "cra_business_number": existing_operator.cra_business_number,
            "bc_corporate_registry_number": "abc1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "V0V0V0",
            "operator_has_parent_operators": False,
            "parent_operators_array": [],
        }
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_payload,
            custom_reverse_lazy(
                "update_operator_and_user_operator",
                kwargs={"user_operator_id": user_operator.id},
            ),
        )

        response_json = put_response.json()
        assert put_response.status_code == 400
        assert response_json == {"message": "Operator with this CRA Business Number already exists."}

    def test_put_user_operator_operator_malformed_data(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {"junk_data": "junk"},
            custom_reverse_lazy(
                "update_operator_and_user_operator",
                kwargs={"user_operator_id": operator.id},
            ),
        )

        assert put_response.status_code == 422

    def test_put_duplicates_not_allowed(self):
        operator_1 = operator_baker()
        operator_2 = operator_baker()

        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=operator_2,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        # duplicate legal name
        payload_with_duplicate_legal_name = {
            "legal_name": operator_1.legal_name,
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        put_response_duplicate_legal_name = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload_with_duplicate_legal_name,
            custom_reverse_lazy(
                "update_operator_and_user_operator",
                kwargs={"user_operator_id": user_operator.id},
            ),
        )
        assert put_response_duplicate_legal_name.status_code == 422
        assert put_response_duplicate_legal_name.json() == {
            "message": "Legal Name: Operator with this Legal name already exists."
        }

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
        assert response.json()['operator_id'] == str(operator.id)  # String representation of the UUID
