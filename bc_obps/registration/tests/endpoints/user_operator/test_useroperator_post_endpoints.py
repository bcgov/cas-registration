from typing import List
from common.enums import AccessRequestStates, AccessRequestTypes
from common.service.email.email_service import EmailService
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    BusinessStructure,
    Operator,
    ParentOperator,
    User,
    UserOperator,
)
from registration.tests.utils.bakers import (
    operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestUserOperatorPostEndpoint(CommonTestSetup):
    def test_request_admin_access_with_valid_payload(self, mocker):
        operator = operator_baker()
        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, 'send_operator_access_request_email'
        )
        response = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {"operator_id": operator.id},
            custom_reverse_lazy('request_admin_access'),
        )

        # Assert that the email notification was sent
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.CONFIRMATION,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            self.user.get_full_name(),
            self.user.email,
        )

        response_json = response.json()

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.PENDING,
            role=UserOperator.Roles.PENDING,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

    def test_request_access_with_invalid_payload(self):
        invalid_payload = {"operator_id": 99999}  # Invalid operator ID

        response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', self.content_type, invalid_payload, custom_reverse_lazy('request_admin_access')
        )
        assert response.status_code == 422
        assert response.json().get('detail')[0].get('msg') == 'UUID input should be a string, bytes or UUID object'

    def test_request_subsequent_access_with_valid_payload(self):
        operator = operator_baker()
        admin_user = baker.make(User, business_guid=self.user.business_guid)
        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        response = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {"operator_id": operator.id},
            custom_reverse_lazy('request_access'),
        )
        response_json = response.json()

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.PENDING,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

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
            'industry_user',
            self.content_type,
            payload_with_duplicate_cra_business_number,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert post_response_duplicate_cra_business_number.status_code == 400
        assert post_response_duplicate_cra_business_number.json() == {
            'message': 'Operator with this CRA Business Number already exists.'
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
            'industry_user',
            self.content_type,
            payload_with_duplicate_legal_name,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert post_response_duplicate_legal_name.status_code == 422
        assert post_response_duplicate_legal_name.json() == {
            'message': 'Legal Name: Operator with this Legal name already exists.'
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
            'industry_user',
            self.content_type,
            payload_with_duplicate_bc_corporate_registry_number,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert post_response_duplicate_bc_corporate_registry_number.status_code == 422
        assert post_response_duplicate_bc_corporate_registry_number.json() == {
            'message': 'Bc Corporate Registry Number: Operator with this Bc corporate registry number already exists.'
        }

    # PARENT OPERATORS
    def test_create_operator_and_user_operator_with_parent_operators(self):
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

        post_response_2 = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload_2,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert post_response_2.status_code == 200

        user_operator_id = post_response_2.json().get("user_operator_id")
        assert user_operator_id is not None

        user_operator = UserOperator.objects.get(id=user_operator_id)
        assert user_operator.operator is not None
        assert user_operator.user == self.user
        assert user_operator.role == UserOperator.Roles.PENDING
        assert user_operator.status == UserOperator.Statuses.PENDING

        operator: Operator = user_operator.operator
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
