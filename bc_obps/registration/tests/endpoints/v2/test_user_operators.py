from typing import Any, Dict
from registration.models.operator import Operator
from registration.models.user_operator import UserOperator

from registration.models import (
    BusinessStructure,
)
from registration.tests.utils.bakers import (
    operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestCreateUserOperator(CommonTestSetup):
    endpoint = custom_reverse_lazy("create_operator_and_user_operator_v2")

    payload = {
        "legal_name": "Legal Name",
        "trade_name": "Trade name",
        "business_structure": "BC Corporation",
        "cra_business_number": 999999999,
        "bc_corporate_registry_number": "adh1234321",
        "street_address": "123 Updated St",
        "municipality": "Updated Municipality",
        "province": "ON",
        "postal_code": "A1A1A1",
        "operator_has_parent_operators": False,
    }

    # AUTHORIZATION
    def test_unauthorized_roles_cannot_post_useroperator(self):
        """
        Test that unauthorized roles cannot post a user operator Operator.
        """
        # List of roles that should not be authorized
        unauthorized_roles = ['cas_pending', 'cas_analyst', 'cas_admin']

        for role in unauthorized_roles:
            response = TestUtils.mock_get_with_auth_role(self, role, self.endpoint)
            assert response.status_code == 405

    # REQUIRED FIELDS
    def test_empty_payload_missing_fields(self):
        """
        Test that submitting an empty payload returns appropriate error messages for missing required fields.

        The expected response includes error messages for the following fields:

        - **Legal Name**: Required field.
        - **Business Structure**: Required field.
        - **CRA Business Number**: Required field.
        - **BC Corporate Registry Number**: Required field.
        - **Street Address**: Required field.
        - **Municipality**: Required field.
        - **Province**: Required field.
        - **Postal Code**: Required field.
        """
        payload_empty = {}
        expected_response = {
            "detail": [
                {
                    "type": "missing",
                    "loc": ["body", "payload", "business_structure"],
                    "msg": "Field required",
                },
                {
                    "type": "missing",
                    "loc": ["body", "payload", "cra_business_number"],
                    "msg": "Field required",
                },
                {
                    "type": "missing",
                    "loc": ["body", "payload", "bc_corporate_registry_number"],
                    "msg": "Field required",
                },
                {
                    "type": "missing",
                    "loc": ["body", "payload", "street_address"],
                    "msg": "Field required",
                },
                {
                    "type": "missing",
                    "loc": ["body", "payload", "municipality"],
                    "msg": "Field required",
                },
                {
                    "type": "missing",
                    "loc": ["body", "payload", "province"],
                    "msg": "Field required",
                },
                {
                    "type": "missing",
                    "loc": ["body", "payload", "postal_code"],
                    "msg": "Field required",
                },
                {
                    "type": "missing",
                    "loc": ["body", "payload", "legal_name"],
                    "msg": "Field required",
                },
            ]
        }

        # Send POST request with empty payload
        post_response = self._post_with_auth(payload_empty)

        assert post_response.status_code == 422

        # Assert the response contains all expected error messages
        assert post_response.json() == expected_response

    # DUPLICATE FIELDS
    def test_duplicates_not_allowed(self):
        """
        Test that creating an Operator with duplicate fields is not allowed.

        This test verifies that an attempt to create an Operator with the following
        duplicate fields results in error:
        - **Legal Name**: Ensures that an operator with an existing legal name cannot be created.
        - **CRA Business Number**: Ensures that an operator with an existing CRA business number cannot be created.
        - **BC Corporate Registry Number**: Ensures that an operator with an existing BC Corporate Registry Number cannot be created.
        """
        operator = operator_baker()
        status_code = 422

        # duplicate legal name
        message = "Legal Name: Operator with this Legal name already exists."
        payload_with_duplicate = {
            **self.payload,
            "legal_name": operator.legal_name,
        }
        post_response = self._post_with_auth(payload_with_duplicate)

        assert post_response.status_code == status_code
        assert post_response.json() == {"message": message}

        # duplicate CRA business number
        message = "Cra Business Number: Operator with this Cra business number already exists."
        payload_with_duplicate = {
            **self.payload,
            "cra_business_number": operator.cra_business_number,
        }
        post_response = self._post_with_auth(payload_with_duplicate)
        assert post_response.status_code == status_code
        assert post_response.json() == {"message": message}

        # duplicate Bc Corporate Registry Number
        message = "Bc Corporate Registry Number: Operator with this Bc corporate registry number already exists."
        payload_with_duplicate = {
            **self.payload,
            "bc_corporate_registry_number": operator.bc_corporate_registry_number,
        }
        post_response = self._post_with_auth(payload_with_duplicate)
        assert post_response.status_code == status_code
        assert post_response.json() == {"message": message}

    def test_payload_required_fields(self):
        """
        Test that the payload containing all required fields successfully submits
        and returns a status code of 200.
        """
        post_response = self._post_with_auth(self.payload)

        self._assert_post_success(post_response)

    def test_payload_partner_fields(self):
        """
        Test that the payload containing all required fields and partner fields
        successfully submits and returns a status code of 200.
        """
        payload_with_partner = {
            **self.payload,
            "business_structure": "General Partnership",
            "partner_operators_array": self._create_mock_partner_operators(),
        }
        post_response = self._post_with_auth(payload_with_partner)

        self._assert_post_success(post_response)

    def test_payload_parent_fields(self):
        """
        Test that the payload containing all required fields and parent operator fields
        successfully submits and returns a status code of 200.
        """
        payload_with_parent = {
            **self.payload,
            "operator_has_parent_operators": True,
            "parent_operators_array": self._create_mock_parent_operators(),
        }
        post_response = self._post_with_auth(payload_with_parent)

        self._assert_post_success(post_response)

    def test_payload_partner_and_parent_fields(self):
        """
        Test that the payload containing all required fields, partner, and partner fields
        successfully submits and returns a status code of 200.
        """
        payload_with_partner = {
            **self.payload,
            "business_structure": "General Partnership",
            "partner_operators_array": self._create_mock_partner_operators(),
            "operator_has_parent_operators": True,
            "parent_operators_array": self._create_mock_parent_operators(),
        }
        post_response = self._post_with_auth(payload_with_partner)

        self._assert_post_success(post_response)

    # HELPERS

    def _post_with_auth(self, payload: Dict[str, Any]) -> Any:
        """Send a POST request with authentication and return the response."""
        return TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload,
            self.endpoint,
        )

    def _create_mock_parent_operators(self):
        """Creates mock parent operators."""
        return [
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
        ]

    def _create_mock_partner_operators(self):
        """Creates mock partner operators."""
        return [
            {
                "partner_legal_name": "Partner Operator Legal Name",
                "partner_trade_name": "Partner Operator Trade Name",
                "partner_business_structure": "General Partnership",
                "partner_cra_business_number": 123456780,
                "partner_bc_corporate_registry_number": "zzz1212121",
            },
        ]

    def _assert_post_success(self, post_response):
        """Asserts post success and the created Operator and UserOperator."""

        assert post_response.status_code == 200
        assert post_response.json().get("operator_id") is not None
        assert post_response.json().get("user_operator_id") is not None

        operator = Operator.objects.get(id=post_response.json().get("operator_id"))
        assert operator is not None
        assert operator.status == Operator.Statuses.APPROVED

        user_operator = UserOperator.objects.get(id=post_response.json().get("user_operator_id"))
        assert user_operator is not None
        assert user_operator.role == UserOperator.Roles.ADMIN
        assert user_operator.status == UserOperator.Statuses.APPROVED
