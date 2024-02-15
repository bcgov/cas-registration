import pytest
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.tests.utils.bakers import operator_baker
from registration.constants import AUDIT_FIELDS
from registration.models import Operator
from registration.schema.operator import OperatorOut
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestOperatorsEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operators"

    def setup(self):
        super().setup()
        self.operator = operator_baker()
        self.operator.legal_name = "Test Operator legal name"
        self.operator.cra_business_number = "123456789"
        self.operator.save(update_fields=["legal_name", "cra_business_number"])

    def test_operator_unauthorized_users_cannot_get(self):
        # operators/operator_id
        operator = operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', custom_reverse_lazy('get_operator', kwargs={'operator_id': operator.id})
        )
        assert response.status_code == 401

    def test_operator_unauthorized_users_cannot_put(self):
        # /operators/{operator_id}

        operator = operator_baker()
        for role in ['cas_pending', 'industry_user']:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                {'status': Operator.Statuses.APPROVED},
                custom_reverse_lazy('update_operator', kwargs={'operator_id': operator.id}),
            )
            assert response.status_code == 401

    def test_get_operators_no_parameters(self):
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user')
        assert response.status_code == 404
        assert response.json() == {"message": "No parameters provided"}

    def test_get_operators_by_legal_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_operator_by_legal_name_or_cra') + '?legal_name=Test Operator legal name',
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        for key in response_dict.keys():
            # exclude audit fields
            if key not in AUDIT_FIELDS:
                assert response_dict[key] == OperatorOut.from_orm(self.operator).dict()[key]

    def test_get_search_operators_by_legal_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy('get_operators_by_legal_name') + '?search_value=Test Operator legal name',
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        assert len(response_dict) == 1
        for key in response_dict[0].keys():
            # exclude audit fields
            if key not in AUDIT_FIELDS:
                assert response_dict[0][key] == OperatorOut.from_orm(self.operator).dict()[key]

    def test_get_search_operators_by_legal_name_no_value(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_operators_by_legal_name') + '?search_value='
        )
        assert response.status_code == 404
        assert response.json() == {"message": "No parameters provided"}

    def test_get_operators_by_cra_number(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_operator_by_legal_name_or_cra') + '?cra_business_number=123456789',
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        for key in response_dict.keys():
            # exclude audit fields
            if key not in AUDIT_FIELDS:
                assert response_dict[key] == OperatorOut.from_orm(self.operator).dict()[key]

    def test_get_operators_no_matching_operator_legal_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_operator_by_legal_name_or_cra') + "?legal_name=No matching operator",
        )
        assert response.status_code == 404

    def test_get_operators_no_matching_operator_cra_number(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_operator_by_legal_name_or_cra') + "?cra_business_number=987654321",
        )
        assert response.status_code == 404

    def test_select_operator_with_valid_id(self):
        operator = operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", custom_reverse_lazy('update_operator', kwargs={"operator_id": operator.id})
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        for key in response_dict.keys():
            # exclude audit fields
            if key not in AUDIT_FIELDS:
                assert response_dict[key] == OperatorOut.from_orm(operator).dict()[key]

    def test_select_operator_with_invalid_id(self):
        invalid_operator_id = 99999  # Invalid operator ID

        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", custom_reverse_lazy('get_operator', kwargs={"operator_id": invalid_operator_id})
        )
        assert response.status_code == 404
        assert response.json() == {'message': 'No matching operator found'}

    def test_put_approve_operator(self):
        operator = operator_baker()
        operator.status = Operator.Statuses.PENDING
        operator.is_new = True
        operator.save(update_fields=["status", "is_new"])

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.APPROVED},
            custom_reverse_lazy('update_operator', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.APPROVED
        assert response.json().get('is_new') == False
        assert response.json().get("verified_by") == str(self.user.user_guid)

    def test_put_request_changes_to_operator(self):
        operator = operator_baker()
        operator.status = Operator.Statuses.PENDING
        operator.save(update_fields=["status"])

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.CHANGES_REQUESTED},
            custom_reverse_lazy('update_operator', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.CHANGES_REQUESTED
        assert response.json().get('is_new') == True
        assert response.json().get("verified_by") == None
