from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.tests.utils.bakers import operator_baker, user_operator_baker
from registration.constants import AUDIT_FIELDS
from registration.models import Operator, UserOperator
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
        self.operator.cra_business_number = 111111111
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
        user_operator = user_operator_baker({'operator': operator})
        for role in ['cas_pending', 'industry_user']:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                {'status': Operator.Statuses.APPROVED, 'user_operator_id': user_operator.id},
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
                if key == "id":
                    assert response_dict[key] == str(self.operator.id)  # String representation of UUID
                else:
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
                if key == "id":
                    assert response_dict[0][key] == str(self.operator.id)  # String representation of UUID
                else:
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
            custom_reverse_lazy('get_operator_by_legal_name_or_cra') + '?cra_business_number=111111111',
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        for key in response_dict.keys():
            # exclude audit fields
            if key not in AUDIT_FIELDS:
                if key == "id":
                    assert response_dict[key] == str(self.operator.id)  # String representation of UUID
                else:
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
                if key == "id":
                    assert response_dict[key] == str(operator.id)  # String representation of UUID
                else:
                    assert response_dict[key] == OperatorOut.from_orm(operator).dict()[key]

    def test_select_operator_with_invalid_id(self):
        invalid_operator_id = 99999  # Invalid operator ID

        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", custom_reverse_lazy('get_operator', kwargs={"operator_id": invalid_operator_id})
        )
        assert response.status_code == 422
        assert response.json().get('detail')[0].get('msg') == "value is not a valid uuid"

    def test_put_approve_operator(self):
        operator = operator_baker({'status': Operator.Statuses.PENDING, 'is_new': True})
        user_operator = user_operator_baker({'operator': operator})

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.APPROVED, 'user_operator_id': user_operator.id},
            custom_reverse_lazy('update_operator', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.APPROVED
        assert response.json().get('is_new') == False
        assert response.json().get("verified_by") == str(self.user.user_guid)

    def test_put_request_changes_to_operator(self):
        operator = operator_baker({'status': Operator.Statuses.PENDING})
        user_operator = user_operator_baker({'operator': operator})

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.CHANGES_REQUESTED, 'user_operator_id': user_operator.id},
            custom_reverse_lazy('update_operator', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.CHANGES_REQUESTED
        assert response.json().get("verified_by") == None

    # declining a new operator declines the prime admin request too
    def test_put_decline_new_operator(self):
        operator = operator_baker({'status': Operator.Statuses.PENDING, 'is_new': True})
        user_operator = user_operator_baker({'operator': operator})

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.DECLINED, 'user_operator_id': user_operator.id},
            custom_reverse_lazy('update_operator', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.DECLINED
        assert response.json().get('is_new') == False
        assert response.json().get("verified_by") == str(self.user.user_guid)
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.DECLINED
        assert user_operator.verified_by == self.user

    # declining an existing operator only declines the operator, not the user_operator
    def test_put_decline_existing_operator(self):
        operator = operator_baker({'status': Operator.Statuses.PENDING, 'is_new': False})
        user_operator = user_operator_baker({'operator': operator, 'status': UserOperator.Statuses.PENDING})

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.DECLINED, 'user_operator_id': user_operator.id},
            custom_reverse_lazy('update_operator', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.DECLINED
        assert response.json().get('is_new') == False
        assert response.json().get("verified_by") == str(self.user.user_guid)
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.PENDING
        assert user_operator.verified_by == None
