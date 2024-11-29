from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.tests.utils.bakers import operator_baker, user_operator_baker
from common.constants import AUDIT_FIELDS
from registration.models import Operator, UserOperator
from registration.schema.v1.operator import OperatorOut, OperatorSearchOut, ConfirmSelectedOperatorOut
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestOperatorsEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operators"

    def setup_method(self):
        super().setup_method()
        self.operator = operator_baker()
        self.operator.legal_name = "Test Operator legal name"
        self.operator.cra_business_number = 111111111
        self.operator.save(update_fields=["legal_name", "cra_business_number"])

    def test_get_operators_no_parameters(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name')
        )

        assert response.status_code == 400
        assert response.json().get('message') == "No search value provided"

    def test_get_operators_by_legal_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name')
            + '?legal_name=Test Operator legal name',
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        assert len(response_dict) == 1
        for key in response_dict[0].keys():
            if key == "id":
                assert response_dict[0][key] == str(self.operator.id)  # String representation of UUID
            else:
                assert response_dict[0][key] == OperatorSearchOut.from_orm(self.operator).dict()[key]

    def test_get_search_operators_by_legal_name_no_value(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name') + '?legal_name='
        )
        assert response.status_code == 400
        assert response.json().get('message') == "No search value provided"

    def test_get_search_operators_by_cra_business_number_no_value(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name') + '?cra_business_number=0',
        )
        assert response.status_code == 400
        assert response.json().get('message') == "No search value provided"

    def test_get_operators_by_cra_number(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name') + '?cra_business_number=111111111',
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        assert response_dict['id'] == str(OperatorSearchOut.from_orm(self.operator).dict()['id'])

    def test_get_operators_no_matching_operator_legal_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name') + "?legal_name=No matching operator",
        )
        assert response.status_code == 200
        assert response.json() == []

    def test_get_operators_no_matching_operator_cra_number(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name') + "?cra_business_number=987654321",
        )
        assert response.status_code == 400
        assert response.json().get('message') == "No matching operator found. Retry or add operator."

    def test_get_operators_by_cra_number_or_legal_name_exclude_declined_operators(self):
        operator = operator_baker({'status': Operator.Statuses.DECLINED})

        # CRA number
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name')
            + f'?cra_business_number={operator.cra_business_number}',
        )
        assert response.status_code == 400
        assert response.json().get('message') == "No matching operator found. Retry or add operator."

        # Legal name
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('v1_get_operators_by_cra_number_or_legal_name') + f'?legal_name={operator.legal_name}',
        )

        assert response.status_code == 200
        assert response.json() == []

    def test_select_operator_with_valid_id(self):
        operator = operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", custom_reverse_lazy('v1_get_operator', kwargs={"operator_id": operator.id})
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        for key in response_dict.keys():
            # exclude audit fields
            if key not in AUDIT_FIELDS:
                if key == "id":
                    assert response_dict[key] == str(operator.id)  # String representation of UUID
                else:
                    assert response_dict[key] == ConfirmSelectedOperatorOut.from_orm(operator).dict()[key]

    def test_select_operator_with_invalid_id(self):
        invalid_operator_id = 99999  # Invalid operator ID
        # with pytest.raises(Exception):
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", custom_reverse_lazy('v1_get_operator', kwargs={"operator_id": invalid_operator_id})
        )
        assert response.status_code == 422
        assert (
            response.json().get('detail')[0].get('msg')
            == 'Input should be a valid UUID, invalid length: expected length 32 for simple format, found 5'
        )

    def test_put_approve_operator(self):
        operator = operator_baker({'status': Operator.Statuses.PENDING, 'is_new': True})
        user_operator = user_operator_baker({'operator': operator})
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.APPROVED, 'user_operator_id': user_operator.id},
            custom_reverse_lazy('v1_update_operator_status', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200
        response_dict = response.json()
        operator.refresh_from_db()  # refresh the operator object to get the updated status
        for key in response_dict.keys():
            if key not in AUDIT_FIELDS:
                if key == "id":
                    assert response_dict[key] == str(operator.id)  # String representation of UUID
                elif key == "verified_at":
                    # tweaking time format to match the expected format
                    assert response_dict[key] == operator.verified_at.strftime("%Y-%m-%dT%H:%M:%S.%fZ")[:-4] + "Z"
                elif key == "verified_by":
                    assert response_dict[key] == str(operator.verified_by.user_guid)
                else:
                    assert response_dict[key] == OperatorOut.from_orm(operator).dict()[key]

    def test_put_request_changes_to_operator(self):
        operator = operator_baker({'status': Operator.Statuses.PENDING})
        user_operator = user_operator_baker({'operator': operator})

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.CHANGES_REQUESTED, 'user_operator_id': user_operator.id},
            custom_reverse_lazy('v1_update_operator_status', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.CHANGES_REQUESTED
        assert response.json().get("verified_by") is None

    # declining a new operator declines the prime admin request too
    def test_put_decline_new_operator(self, mocker):
        operator = operator_baker({'status': Operator.Statuses.PENDING, 'is_new': True})
        user_operators = [
            user_operator_baker({'operator': operator}) for _ in range(3)
        ]  # Create a list of user operators

        operator.created_by = user_operators[0].user  # Set the first user operator as the creator of the operator
        operator.save(update_fields=['created_by'])
        mock_send_operator_access_request_email = mocker.patch(
            "service.operator_service.send_operator_access_request_email"
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {
                "status": Operator.Statuses.DECLINED,
                'user_operator_id': user_operators[0].id,
            },  # Setting status for the first user operator
            custom_reverse_lazy('v1_update_operator_status', kwargs={'operator_id': operator.id}),
        )
        assert response.status_code == 200
        assert response.json().get('status') == Operator.Statuses.DECLINED
        assert response.json().get('is_new') is False
        assert response.json().get("verified_by") == str(self.user.user_guid)

        assert mock_send_operator_access_request_email.call_count == 3  # one for each user operator

        expected_calls = []
        # Verify that all user operators tied to this operator are declined
        for user_operator in user_operators:
            user_operator.refresh_from_db()  # Refresh the user_operator object to get the updated status
            expected_calls.append(
                mocker.call(
                    AccessRequestStates.DECLINED,
                    AccessRequestTypes.NEW_OPERATOR_AND_ADMIN
                    if operator.created_by == user_operator.user
                    else AccessRequestTypes.ADMIN,
                    operator.legal_name,
                    user_operator.user.get_full_name(),
                    user_operator.user.email,
                )
            )
            assert user_operator.status == UserOperator.Statuses.DECLINED
            assert user_operator.verified_by == self.user
        # Assert that the send_operator_access_request_email method was called with the expected arguments
        mock_send_operator_access_request_email.assert_has_calls(expected_calls)

    # declining an existing operator only declines the operator, not the user_operator
    def test_put_decline_existing_operator(self):
        operator = operator_baker({'status': Operator.Statuses.PENDING, 'is_new': False})
        user_operator = user_operator_baker({'operator': operator, 'status': UserOperator.Statuses.PENDING})

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": Operator.Statuses.DECLINED},
            custom_reverse_lazy('v1_update_operator_status', kwargs={'operator_id': operator.id}),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.DECLINED
        assert response.json().get('is_new') is False
        assert response.json().get("verified_by") == str(self.user.user_guid)
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.PENDING
        assert user_operator.verified_by is None
