from registration.api.user_operator import save_operator
from registration.schema.parent_operator import ParentOperatorIn
from registration.schema.user_operator import UserOperatorOperatorIn
from registration.api.utils.handle_operator_addresses import handle_operator_addresses
import pytest
import tempfile
from model_bakery import baker
from registration.models import Address, BusinessStructure, Operator, ParentOperator, User, UserOperator, AppRole
from registration.utils import (
    check_users_admin_request_eligibility,
    file_to_data_url,
    data_url_to_file,
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
from registration.tests.utils.helpers import TestUtils, MOCK_DATA_URL


pytestmark = pytest.mark.django_db

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)
from registration.tests.utils.bakers import operator_baker, user_operator_baker


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
    def test_user_eligible_for_admin_request():
        user = baker.make(User)
        operator = operator_baker()
        status_code, message = check_users_admin_request_eligibility(user, operator)

        assert status_code == 200
        assert message is None

    @staticmethod
    def test_user_already_admin_for_operator():
        user = baker.make(User)
        operator = operator_baker()
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
        operator = operator_baker()
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
        operator = operator_baker()
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

    @staticmethod
    def test_user_business_guid_matches_admin():
        admin_user = baker.make(User)
        user = baker.make(
            User,
            business_guid=admin_user.business_guid,
        )
        operator = operator_baker()

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
        operator = operator_baker()

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
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_admin"))

        assert raise_401_if_user_not_authorized(self.request, ['cas_admin']) == None

    def test_app_role_is_not_authorized(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_admin"))
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(
                self.request,
                [
                    'role_that_is_not_cas_admin',
                ],
            )

    def test_all_user_operator_roles_are_authorized(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        # note: I haven't added baker.make(UserOperator) because when a user first logs in, they haven't selected an operator yet and and they don't have a UserOperator record

        assert (
            raise_401_if_user_not_authorized(
                self.request, ['cas_admin', 'industry_user'], ['reporter', 'admin', 'pending']
            )
            == None
        )

    def test_some_user_operator_roles_are_authorized(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        user_operator_instance = user_operator_baker()
        user_operator_instance.user = self.request.current_user
        user_operator_instance.role = 'reporter'
        user_operator_instance.save(update_fields=['user', 'role'])

        assert raise_401_if_user_not_authorized(self.request, ['industry_user'], ['reporter', 'admin']) == None

    def test_user_operator_role_is_not_authorized(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        user_operator_instance = user_operator_baker()
        user_operator_instance.user = self.request.current_user
        user_operator_instance.role = 'reporter'
        user_operator_instance.save(update_fields=['user', 'role'])
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(self.request, ['industry_user'], ['admin'])

    def test_no_authorized_role_argument_is_provided(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        user_operator_instance = user_operator_baker()
        user_operator_instance.user = self.request.current_user
        user_operator_instance.save(update_fields=['user'])
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

        operator1 = operator_baker()
        operator2 = operator_baker()

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
        get_an_operators_approved_users(operator1.pk)

        result = User.objects.filter(user_guid=approved_user.user_guid)
        assert result.exists() and result.count() == 1


class TestFileHelpers:
    @staticmethod
    def file_to_data_url_returns_data_url():

        # Create a temporary file
        temp_pdf_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")

        result = file_to_data_url(temp_pdf_file)
        assert isinstance(result, str)
        assert result.startswith('data:application/pdf;name=')

    @staticmethod
    def data_url_to_file_returns_file():
        result = data_url_to_file(MOCK_DATA_URL)
        assert result.exists() and result.is_file()


class TestUserOperatorHelpers:
    @staticmethod
    def test_handle_operator_addresses_create_without_prefix():

        address_data = {
            "physical_street_address": "123 Main St",
            "physical_municipality": "Anytown",
            "physical_province": "MB",
            "physical_postal_code": "A1B 2C3",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "456 Secondary St",
            "mailing_municipality": "Othertown",
            "mailing_province": "BC",
            "mailing_postal_code": "X1Y 2Z3",
        }

        result = handle_operator_addresses(address_data, None, None)

        assert len(Address.objects.all()) == 2
        assert Address.objects.all()[0] == result['physical_address']
        assert Address.objects.all()[0].street_address == "123 Main St"
        assert Address.objects.all()[1] == result['mailing_address']
        assert Address.objects.all()[1].postal_code == "X1Y 2Z3"

    @staticmethod
    def test_handle_operator_addresses_update_with_prefix():

        existing_physical_address = baker.make(Address)
        existing_mailing_address = baker.make(Address)

        address_data = {
            "po_physical_street_address": "123 Main St",
            "po_physical_municipality": "Anytown",
            "po_physical_province": "MB",
            "po_physical_postal_code": "A1B 2C3",
            "po_mailing_address_same_as_physical": False,
            "po_mailing_street_address": "456 Secondary St",
            "po_mailing_municipality": "Othertown",
            "po_mailing_province": "BC",
            "po_mailing_postal_code": "X1Y 2Z3",
        }

        handle_operator_addresses(address_data, existing_physical_address.id, existing_mailing_address.id, 'po_')

        assert len(Address.objects.all()) == 2
        assert Address.objects.get(id=existing_physical_address.id).street_address == "123 Main St"
        assert Address.objects.get(id=existing_mailing_address.id).postal_code == "X1Y 2Z3"

    @staticmethod
    def test_save_operator():
        user = baker.make(User)
        operator_instance: Operator = Operator(
            cra_business_number=1234321,
            bc_corporate_registry_number="aaa1111111",
            business_structure=BusinessStructure.objects.first(),
            status=Operator.Statuses.PENDING,
        )
        payload = UserOperatorOperatorIn(
            legal_name="Example Legal Name",
            trade_name="Example Trade Name",
            cra_business_number=123456789,
            bc_corporate_registry_number="aaa1111111",
            business_structure='BC Corporation',
            physical_street_address="Example Physical Street Address",
            physical_municipality="Example Physical Municipality",
            physical_province="AB",
            physical_postal_code="H0H 0H0",
            mailing_street_address="Example Mailing Street Address",
            mailing_municipality="Example Mailing Municipality",
            mailing_province="BC",
            mailing_postal_code="H0H 0H0",
            mailing_address_same_as_physical=False,
            operator_has_parent_operators=True,
            parent_operators_array=[
                ParentOperatorIn(
                    po_legal_name="Example Parent Legal Name",
                    po_trade_name="Example Parent Trade Name",
                    po_cra_business_number=987654321,
                    po_bc_corporate_registry_number="bbb2222222",
                    po_business_structure='BC Corporation',
                    po_physical_street_address="Example Parent Physical Street Address",
                    po_physical_municipality="Example Parent Physical Municipality",
                    po_physical_province="BC",
                    po_physical_postal_code="H0H 0H0",
                    po_mailing_address_same_as_physical=False,
                    mailing_street_address="Example Parent Mailing Street Address",
                    po_mailing_municipality="Example Parent Mailing Municipality",
                    po_mailing_province="ON",
                    po_mailing_postal_code="H0H 0H0",
                    operator_index=1,
                )
            ],
        )
        save_operator(payload, operator_instance, user)
        assert len(UserOperator.objects.all()) == 1
        assert len(Operator.objects.all()) == 1
        assert Operator.objects.first().legal_name == "Example Legal Name"
        assert len(ParentOperator.objects.all()) == 1
        assert ParentOperator.objects.first().legal_name == "Example Parent Legal Name"
        assert len(Address.objects.all()) == 4
