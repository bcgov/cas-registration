import pytest
from model_bakery import baker
from registration.models import User, Operator, UserOperator
from registration.utils import (
    check_users_admin_request_eligibility,
    update_model_instance,
    generate_useful_error,
    check_access_request_matches_business_guid,
)
from localflavor.ca.models import CAPostalCodeField
from django.core.exceptions import ValidationError


pytestmark = pytest.mark.django_db


def mock_postal_code():
    return "v8v3g1"


baker.generators.add(CAPostalCodeField, mock_postal_code)


class TestCheckUserAdminRequestEligibility:
    @staticmethod
    def test_user_eligible_for_admin_request():
        user = baker.make(User)
        operator = baker.make(Operator)

        status_code, message = check_users_admin_request_eligibility(user, operator)

        assert status_code == 200
        assert message is None

    @staticmethod
    def test_user_already_admin_for_operator():
        user = baker.make(User)
        operator = baker.make(Operator)
        baker.make(
            UserOperator,
            user=user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        status_code, message = check_users_admin_request_eligibility(user, operator)

        assert status_code == 400
        assert message == {"message": "You are already an admin for this Operator!"}

    @staticmethod
    def test_operator_already_has_admin():
        user = baker.make(User)
        operator = baker.make(Operator)
        baker.make(
            UserOperator,
            user=user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        status_code, message = check_users_admin_request_eligibility(None, operator)

        assert status_code == 400
        assert message == {"message": "This Operator already has an admin user!"}

    @staticmethod
    def test_user_already_has_pending_request():
        user = baker.make(User)
        operator = baker.make(Operator)
        baker.make(
            UserOperator,
            user=user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
        )

        status_code, message = check_users_admin_request_eligibility(user, operator)

        assert status_code == 400
        assert message == {"message": "You already have a pending request for this Operator!"}


class TestUpdateModelInstance:
    def test_update_with_dict_mapping(self):
        class TestModel:
            def __init__(self):
                self.field1 = ''
                self.field2 = ''

            # this method is mandatory for django models but we don't need it for this test
            def full_clean(self):
                pass

        instance = TestModel()
        data_dict = {'data_field1': 'value1', 'data_field2': 'value2'}
        fields_to_update = {'data_field1': 'field1', 'data_field2': 'field2'}

        updated_instance = update_model_instance(instance, fields_to_update, data_dict)

        assert updated_instance.field1 == 'value1'
        assert updated_instance.field2 == 'value2'

    def test_update_with_field_list(self):
        class TestModel:
            def __init__(self):
                self.field1 = ''
                self.field2 = ''

            # this method is mandatory for django models but we don't need it for this test
            def full_clean(self):
                pass

        instance = TestModel()
        data_dict = {'field1': 'value1', 'field2': 'value2'}
        fields_to_update = ['field1', 'field2']

        updated_instance = update_model_instance(instance, fields_to_update, data_dict)

        assert updated_instance.field1 == 'value1'
        assert updated_instance.field2 == 'value2'

    def test_validation_error(self):
        class TestModel:
            def __init__(self):
                self.field1 = ''
                self.field2 = ''

            def full_clean(self):
                raise ValidationError("Validation error occurred")

        instance = TestModel()
        data_dict = {'field1': 'value1', 'field2': 'value2'}
        fields_to_update = ['field1', 'field2']

        with pytest.raises(ValidationError):
            update_model_instance(instance, fields_to_update, data_dict)

    def test_attribute_error(self):
        class TestModel:
            def __init__(self):
                self.field1 = ''
                self.field2 = ''

            # this method is mandatory for django models but we don't need it for this test
            def full_clean(self):
                pass

        instance = TestModel()
        data_dict = {'field1': 'value1', 'field2': 'value2'}
        fields_to_update = ['field1', 'field3']  # 'field3' does not exist in TestModel

        updated_instance = update_model_instance(instance, fields_to_update, data_dict)

        assert updated_instance.field1 == 'value1'
        assert not hasattr(updated_instance, 'field3')


class TestGenerateUsefulError:
    def test_generate_useful_error_formatting(self):
        error = ValidationError(
            {
                'long_field_name_with_underscores': ['Error message 1 for field'],
                'another_field': ['Another error message for field'],
            }
        )

        useful_error = generate_useful_error(error)

        expected_error = "Long Field Name With Underscores: Error message 1 for field"
        assert useful_error == expected_error

    def test_generate_useful_error_single_error(self):
        error = ValidationError(
            {
                'field1': ['Error message 1 for field1', 'Error message 2 for field1'],
                'field2': ['Error message for field2'],
            }
        )

        useful_error = generate_useful_error(error)

        expected_error = "Field1: Error message 1 for field1"
        assert useful_error == expected_error


class TestCheckUserAdminRequestEligibility:
    @staticmethod
    def test_user_business_guid_matches_admin():

        admin_user = baker.make(User)
        user = baker.make(
            User,
            business_guid=admin_user.business_guid,
        )

        operator = baker.make(Operator)

        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        status_code, message = check_access_request_matches_business_guid(user.user_guid, operator)

        assert status_code == 200
        assert message is None

    @staticmethod
    def test_user_business_guid_not_match_admin():
        admin_user = baker.make(User)
        user = baker.make(User)

        operator = baker.make(Operator)

        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        status_code, message = check_access_request_matches_business_guid(user.user_guid, operator)

        assert status_code == 403
        assert message == {"message": "Your business bceid does not match that of the approved admin."}
