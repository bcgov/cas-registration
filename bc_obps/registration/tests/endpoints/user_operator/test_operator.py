from typing import List
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from common.service.email.email_service import EmailService
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
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorOperatorEndpoint(CommonTestSetup):
    def create_mock_operator_payload(self, business_structure: BusinessStructure):
        return {
            "legal_name": "Put Operator Legal Name",
            "trade_name": "Put Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "abc1234321",
            "business_structure": business_structure.pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "V0V0V0",
            "operator_has_parent_operators": True,
            "parent_operators_array": [],
        }

    def test_duplicates_not_allowed(self):
        operator = operator_baker()

        # duplicate CRA business number
        payload_with_duplicate_cra_business_number = {
            "legal_name": "a Legal Name",
            "trade_name": "test trade name",
            "cra_business_number": operator.cra_business_number,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        post_response_duplicate_cra_business_number = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload_with_duplicate_cra_business_number,
            custom_reverse_lazy("create_operator_and_user_operator"),
        )
        assert post_response_duplicate_cra_business_number.status_code == 400
        assert post_response_duplicate_cra_business_number.json() == {
            "message": "Operator with this CRA Business Number already exists."
        }

        # duplicate legal name
        payload_with_duplicate_legal_name = {
            "legal_name": operator.legal_name,
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
        post_response_duplicate_legal_name = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload_with_duplicate_legal_name,
            custom_reverse_lazy("create_operator_and_user_operator"),
        )
        assert post_response_duplicate_legal_name.status_code == 422
        assert post_response_duplicate_legal_name.json() == {
            "message": "Legal Name: Operator with this Legal name already exists."
        }
        # duplicate BC corporate registry number
        payload_with_duplicate_bc_corporate_registry_number = {
            "legal_name": "a name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": operator.bc_corporate_registry_number,
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        post_response_duplicate_bc_corporate_registry_number = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload_with_duplicate_bc_corporate_registry_number,
            custom_reverse_lazy("create_operator_and_user_operator"),
        )
        assert post_response_duplicate_bc_corporate_registry_number.status_code == 422
        assert post_response_duplicate_bc_corporate_registry_number.json() == {
            "message": "Bc Corporate Registry Number: Operator with this Bc corporate registry number already exists."
        }

    # PARENT OPERATORS
    def test_create_operator_and_user_operator_with_parent_operators(self, mocker):
        mock_payload_2 = {
            "legal_name": "New Operator",
            "trade_name": "New Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "H0H0H0",
            "operator_has_parent_operators": True,
            "parent_operators_array": [
                {
                    "po_legal_name": "test po legal name",
                    "po_trade_name": "test po trade name",
                    "po_cra_business_number": 123456789,
                    "po_bc_corporate_registry_number": "poo7654321",
                    "po_business_structure": BusinessStructure.objects.first().pk,
                    "po_website": "https://testpo.com",
                    "po_physical_street_address": "test po physical street address",
                    "po_physical_municipality": "test po physical municipality",
                    "po_physical_province": "ON",
                    "po_physical_postal_code": "H0H0H0",
                    "po_mailing_address_same_as_physical": True,
                },
                {
                    "po_legal_name": "test po legal name 2",
                    "po_trade_name": "test po trade name 2",
                    "po_cra_business_number": 123456789,
                    "po_bc_corporate_registry_number": "opo7654321",
                    "po_business_structure": BusinessStructure.objects.first().pk,
                    "po_physical_street_address": "test po physical street address 2",
                    "po_physical_municipality": "test po physical municipality 2",
                    "po_physical_province": "ON",
                    "po_physical_postal_code": "H0H0H0",
                    "po_mailing_address_same_as_physical": False,
                    "po_mailing_street_address": "test po mailing street address 2",
                    "po_mailing_municipality": "test po mailing municipality 2",
                    "po_mailing_province": "ON",
                    "po_mailing_postal_code": "H0H0H0",
                },
            ],
        }

        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, "send_operator_access_request_email"
        )

        post_response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_payload_2,
            custom_reverse_lazy("create_operator_and_user_operator"),
        )
        assert post_response.status_code == 200

        user_operator_id = post_response.json().get("user_operator_id")
        assert user_operator_id is not None

        user_operator = UserOperator.objects.get(id=user_operator_id)
        assert user_operator.operator is not None
        assert user_operator.user == self.user
        assert user_operator.role == UserOperator.Roles.PENDING
        assert user_operator.status == UserOperator.Statuses.PENDING

        operator: Operator = user_operator.operator
        # Assert that the email notification was sent
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.CONFIRMATION,
            AccessRequestTypes.NEW_OPERATOR_AND_ADMIN,
            operator.legal_name,
            self.user.get_full_name(),
            self.user.email,
        )
        assert {
            "legal_name": operator.legal_name,
            "cra_business_number": operator.cra_business_number,
            "bc_corporate_registry_number": operator.bc_corporate_registry_number,
            "business_structure": operator.business_structure.pk,
            "website": None,
            "physical_street_address": operator.physical_address.street_address,
            "physical_municipality": operator.physical_address.municipality,
            "physical_province": operator.physical_address.province,
            "physical_postal_code": operator.physical_address.postal_code,
            "mailing_street_address": operator.mailing_address.street_address,
            "mailing_municipality": operator.mailing_address.municipality,
            "mailing_province": operator.mailing_address.province,
            "mailing_postal_code": operator.mailing_address.postal_code,
        } == {
            "legal_name": "New Operator",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "website": None,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "H0H0H0",
        }

        parent_operators: List[ParentOperator] = operator.parent_operators.all()
        assert len(parent_operators) == 2

        # Assert that the parent operator 1 is the same as the first object in the parent_operators_array
        assert {
            "legal_name": parent_operators[0].legal_name,
            "trade_name": parent_operators[0].trade_name,
            "cra_business_number": parent_operators[0].cra_business_number,
            "bc_corporate_registry_number": parent_operators[0].bc_corporate_registry_number,
            "business_structure": parent_operators[0].business_structure.pk,
            "website": parent_operators[0].website,
            "physical_street_address": parent_operators[0].physical_address.street_address,
            "physical_municipality": parent_operators[0].physical_address.municipality,
            "physical_province": parent_operators[0].physical_address.province,
            "physical_postal_code": parent_operators[0].physical_address.postal_code,
            "mailing_street_address": parent_operators[0].mailing_address.street_address,
            "mailing_municipality": parent_operators[0].mailing_address.municipality,
            "mailing_province": parent_operators[0].mailing_address.province,
            "mailing_postal_code": parent_operators[0].mailing_address.postal_code,
        } == {
            "legal_name": "test po legal name",
            "trade_name": "test po trade name",
            "cra_business_number": 123456789,
            "bc_corporate_registry_number": "poo7654321",
            "business_structure": BusinessStructure.objects.first().pk,
            "website": "https://testpo.com",
            "physical_street_address": "test po physical street address",
            "physical_municipality": "test po physical municipality",
            "physical_province": "ON",
            "physical_postal_code": "H0H0H0",
            "mailing_street_address": "test po physical street address",
            "mailing_municipality": "test po physical municipality",
            "mailing_province": "ON",
            "mailing_postal_code": "H0H0H0",
        }

        # Assert that the parent operator 2 is the same as the second object in the parent_operators_array
        assert {
            "legal_name": parent_operators[1].legal_name,
            "trade_name": parent_operators[1].trade_name,
            "cra_business_number": parent_operators[1].cra_business_number,
            "bc_corporate_registry_number": parent_operators[1].bc_corporate_registry_number,
            "business_structure": parent_operators[1].business_structure.pk,
            "website": None,
            "physical_street_address": parent_operators[1].physical_address.street_address,
            "physical_municipality": parent_operators[1].physical_address.municipality,
            "physical_province": parent_operators[1].physical_address.province,
            "physical_postal_code": parent_operators[1].physical_address.postal_code,
            "mailing_street_address": parent_operators[1].mailing_address.street_address,
            "mailing_municipality": parent_operators[1].mailing_address.municipality,
            "mailing_province": parent_operators[1].mailing_address.province,
            "mailing_postal_code": parent_operators[1].mailing_address.postal_code,
        } == {
            "legal_name": "test po legal name 2",
            "trade_name": "test po trade name 2",
            "cra_business_number": 123456789,
            "bc_corporate_registry_number": "opo7654321",
            "business_structure": BusinessStructure.objects.first().pk,
            "website": None,
            "physical_street_address": "test po physical street address 2",
            "physical_municipality": "test po physical municipality 2",
            "physical_province": "ON",
            "physical_postal_code": "H0H0H0",
            "mailing_street_address": "test po mailing street address 2",
            "mailing_municipality": "test po mailing municipality 2",
            "mailing_province": "ON",
            "mailing_postal_code": "H0H0H0",
        }

        # Assert that the parent operator 1 and 2 have the correct operator index
        assert parent_operators[0].operator_index == 1
        assert parent_operators[1].operator_index == 2

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
            self.create_mock_operator_payload(BusinessStructure.objects.first()),
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
            self.create_mock_operator_payload(BusinessStructure.objects.first()),
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
        mock_payload = self.create_mock_operator_payload(BusinessStructure.objects.first())
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

    def test_put_user_operator_operator_unauthorized(self):
        operator = operator_baker()
        operator.created_by = self.user
        operator.save(update_fields=["created_by"])
        mock_payload = {
            "legal_name": "Unauthorized",
            "trade_name": "Unauthorized",
            "cra_business_number": 678123654,
            "bc_corporate_registry_number": "jkl1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "add",
            "physical_municipality": "add",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.REPORTER,
            created_by=self.user,
        )
        # Test REPORTER 401
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
        user_operator.role = UserOperator.Roles.PENDING
        user_operator.save(update_fields=["role"])
        # Test PENDING 401
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

        assert put_response.status_code == 401

    def test_put_user_operator_operator_malformed_data(self):
        operator = operator_baker()
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
