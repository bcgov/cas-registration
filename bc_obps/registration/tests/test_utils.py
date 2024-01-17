import pytest
from model_bakery import baker
from registration.models import User, Operator, UserOperator, AppRole
from registration.utils import (
    check_users_admin_request_eligibility,
    update_model_instance,
    generate_useful_error,
    check_access_request_matches_business_guid,
    raise_401_if_user_not_authorized,
    get_an_operators_approved_users,
)
from localflavor.ca.models import CAPostalCodeField
from django.core.exceptions import ValidationError
from ninja.errors import HttpError
from django.test import RequestFactory, TestCase
from registration.tests.utils.helpers import TestUtils


pytestmark = pytest.mark.django_db

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


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


class TestCheckIfRoleAuthorized(TestCase):
    def setUp(self):
        # Every test needs access to the request factory.
        self.factory = RequestFactory()
        self.request = self.factory.get("/not/important")

    def test_app_role_is_authorized(self):

        self.request.current_user = baker.make(User, app_role=baker.make(AppRole, role_name="cas_admin"))

        assert raise_401_if_user_not_authorized(self.request, ['cas_admin']) == None

    def test_app_role_is_not_authorized(self):

        self.request.current_user = baker.make(User, app_role=baker.make(AppRole, role_name="cas_admin"))
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(
                self.request,
                [
                    'role_that_is_not_cas_admin',
                ],
            )

    def test_all_user_operator_roles_are_authorized(self):

        self.request.current_user = baker.make(User, app_role=baker.make(AppRole, role_name="industry_user"))
        # note: I haven't added baker.make(UserOperator) because when a user first logs in, they haven't selected an operator yet and and they don't have a UserOperator record

        assert (
            raise_401_if_user_not_authorized(self.request, ['cas_admin', 'industry_user'], [None, 'reporter', 'admin'])
            == None
        )

    def test_some_user_operator_roles_are_authorized(self):

        self.request.current_user = baker.make(User, app_role=baker.make(AppRole, role_name="industry_user"))
        baker.make(UserOperator, user=self.request.current_user, role='reporter')

        assert raise_401_if_user_not_authorized(self.request, ['industry_user'], ['reporter', 'admin']) == None

    def test_user_operator_role_is_not_authorized(self):

        self.request.current_user = baker.make(User, app_role=baker.make(AppRole, role_name="industry_user"))
        baker.make(UserOperator, user=self.request.current_user, role='reporter')
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(self.request, ['industry_user'], ['admin'])

    def test_no_authorized_role_argument_is_provided(self):

        self.request.current_user = baker.make(User, app_role=baker.make(AppRole, role_name="industry_user"))
        baker.make(UserOperator, user=self.request.current_user)
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(self.request, ['industry_user'])

    def test_current_user_does_not_exist(self):
        # note there is no baker.make(User) here
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(self.request, ['industry_user'])


class TestGetAnOperatorsUsers:
    @staticmethod
    def test_operator_has_approved_users():
        approved_user = baker.make(User)
        unapproved_user = baker.make(User)
        other_operator_user = baker.make(User)
        # creating a user that's not in the user operator table
        baker.make(User)

        operator1 = baker.make(Operator)
        operator2 = baker.make(Operator)

        baker.make(
            UserOperator,
            user=approved_user,
            operator=operator1,
            status=UserOperator.Statuses.APPROVED,
        )
        baker.make(
            UserOperator,
            user=unapproved_user,
            operator=operator1,
            status=UserOperator.Statuses.PENDING,
        )
        baker.make(
            UserOperator,
            user=other_operator_user,
            operator=operator2,
            status=UserOperator.Statuses.APPROVED,
        )
        get_an_operators_approved_users(operator1)

        result = User.objects.filter(user_guid=approved_user.user_guid)
        assert result.exists() and result.count() == 1
