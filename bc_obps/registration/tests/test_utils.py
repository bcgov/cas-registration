from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.facility import Facility
from registration.models.operation import Operation
import pytest
import base64
from model_bakery import baker
from common.permissions import raise_401_if_user_not_authorized
from registration.models import User, UserOperator, AppRole
from registration.utils import (
    file_to_data_url,
    data_url_to_file,
    update_model_instance,
    generate_useful_error,
)
from django.core.exceptions import ValidationError
from ninja.errors import HttpError
from django.test import RequestFactory, TestCase
from registration.tests.utils.bakers import document_baker, user_operator_baker
import requests

pytestmark = pytest.mark.django_db


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


class TestCheckIfRoleAuthorized(TestCase):
    def setup_method(self, *args, **kwargs):
        # Every test needs access to the request factory.
        self.factory = RequestFactory()
        self.request = self.factory.get("/not/important")

    def test_raises_when_no_authorized_role_argument_is_provided(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        user_operator_instance = user_operator_baker()
        user_operator_instance.user = self.request.current_user
        user_operator_instance.save(update_fields=['user'])
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(self.request, ['industry_user'])

    def test_does_not_raise_when_app_role_is_authorized(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_admin"))

        assert raise_401_if_user_not_authorized(self.request, ['cas_admin']) is None

    def test_raises_when_app_role_is_not_authorized(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_admin"))
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(
                self.request,
                [
                    'role_that_is_not_cas_admin',
                ],
            )

    def test_raises_when_industry_user_role_is_not_approved(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        user_operator_instance = user_operator_baker()
        user_operator_instance.user = self.request.current_user
        user_operator_instance.role = 'reporter'
        user_operator_instance.save(update_fields=['user', 'role'])
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(self.request, ['industry_user'], ['admin'])

    def test_does_not_raise_when_industry_user_role_does_not_require_approval(self):
        self.request.current_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        # note: I haven't added baker.make(UserOperator) because when a user first logs in, they haven't selected an operator yet and and they don't have a UserOperator record

        assert (
            raise_401_if_user_not_authorized(
                self.request, ['cas_admin', 'industry_user'], ['reporter', 'admin', 'pending'], False
            )
            is None
        )

    def test_does_not_raise_when_approved_industry_user_is_authorized_and_approved(self):
        self.request.current_user = baker.make(
            User,
            app_role=AppRole.objects.get(role_name="industry_user"),
        )
        user_operator_instance = user_operator_baker()
        user_operator_instance.user = self.request.current_user
        user_operator_instance.role = 'reporter'
        user_operator_instance.status = UserOperator.Statuses.APPROVED

        user_operator_instance.save(update_fields=['user', 'role', 'status'])

        assert raise_401_if_user_not_authorized(self.request, ['industry_user'], ['reporter', 'admin']) is None

    def test_raises_when_user_operator_does_not_exist_and_approval_is_required(self):
        self.request.current_user = baker.make(
            User,
            app_role=AppRole.objects.get(role_name="industry_user"),
        )

        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(self.request, ['industry_user'], ['admin'])

    def test_raises_when_current_user_does_not_exist(self):
        # note there is no baker.make(User) here
        with pytest.raises(HttpError):
            raise_401_if_user_not_authorized(self.request, ['industry_user'])


class TestFileTODataURL:
    @staticmethod
    def test_file_to_data_url_returns_data_url(mocker, monkeypatch):
        monkeypatch.setenv("CI", "false")

        # Mock the document object
        document = document_baker()

        # Mock the response of requests.get
        mock_response = mocker.MagicMock()
        mock_response.status_code = 200
        mock_response.content = b"PDF content"

        mocker.patch("requests.get", return_value=mock_response)

        # Call the function
        result = file_to_data_url(document)

        # Check the expected result
        encoded_content = base64.b64encode(b"PDF content").decode("utf-8")
        expected_result = f"data:application/pdf;name=test.pdf;scanstatus=Unscanned;base64,{encoded_content}"
        assert result == expected_result

    @staticmethod
    def test_file_to_data_url_handles_timeout(mocker, caplog, monkeypatch):
        monkeypatch.setenv("CI", "false")

        # Mock the document object
        document = document_baker()

        # Mock the response of requests.get to raise a timeout exception
        mocker.patch("requests.get", side_effect=requests.exceptions.Timeout)

        # Call the function
        result = file_to_data_url(document)

        # Check the result is None
        assert result is None

        # Check that the timeout was logged
        assert "Request timed out" in caplog.text

    @staticmethod
    def test_file_to_data_url_handles_request_exception(mocker, caplog, monkeypatch):
        monkeypatch.setenv("CI", "false")

        # Mock the document object
        document = document_baker()

        # Mock the response of requests.get to raise a request exception
        mocker.patch("requests.get", side_effect=requests.exceptions.RequestException("An error occurred"))

        # Call the function
        result = file_to_data_url(document)

        # Check the result is None
        assert result is None

        # Check that the exception was logged
        assert "An error occurred" in caplog.text


class TestDataUrlToFile:
    @staticmethod
    def test_data_url_to_file():
        data_url = "data:application/pdf;name=test.pdf;base64,UERGIENvbnRlbnQ="
        content_file = data_url_to_file(data_url)

        assert content_file.name == "test.pdf"
        assert content_file.read() == b"PDF Content"

    @staticmethod
    def test_data_url_to_file_no_name():
        data_url = "data:application/pdf;base64,UERGIENvbnRlbnQ="
        content_file = data_url_to_file(data_url)

        assert content_file.name is None
        assert content_file.read() == b"PDF Content"

    @staticmethod
    def test_data_url_to_file_invalid_base64():
        data_url = "data:application/pdf;name=test.pdf;base64,invalidbase64data"

        with pytest.raises(base64.binascii.Error):
            data_url_to_file(data_url)


class TestGenerateUniqueBcghgIdForOperationOrFacility(TestCase):
    def test_cannot_create_operation_with_duplicate_bcghg_id(self):
        bcghg_id_instance = baker.make(BcGreenhouseGasId, id='14121100001')
        operation_instance: Operation = baker.make_recipe('registration.tests.utils.operation')
        operation_instance.bcghg_id = bcghg_id_instance
        operation_instance.save(update_fields=['bcghg_id'])
        with pytest.raises(ValidationError, match='Operation with this Bcghg id already exists.'):
            baker.make_recipe('registration.tests.utils.operation', bcghg_id=bcghg_id_instance)

    def test_cannot_create_facility_with_duplicate_bcghg_id(self):
        bcghg_id_instance = baker.make(BcGreenhouseGasId, id='14121100001')
        facility_instance: Facility = baker.make_recipe('registration.tests.utils.facility')
        facility_instance.bcghg_id = bcghg_id_instance
        facility_instance.save(update_fields=['bcghg_id'])
        with pytest.raises(ValidationError, match='Facility with this Bcghg id already exists.'):
            baker.make_recipe('registration.tests.utils.facility', bcghg_id=bcghg_id_instance)

    def test_does_not_generate_if_record_has_existing_bcghg_id(self):
        existing_id = baker.make(BcGreenhouseGasId, id='14121100001')
        operation: Operation = baker.make_recipe('registration.tests.utils.operation', bcghg_id=existing_id)
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        assert operation.bcghg_id == existing_id

    def test_generate_unique_bcghg_id_for_operation(self):
        operation: Operation = baker.make_recipe('registration.tests.utils.operation', type=Operation.Types.LFO)
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        expected_id = f'2{operation.naics_code.naics_code}0001'
        assert operation.bcghg_id.pk == expected_id

    def test_generate_unique_bcghg_id_for_facility(self):
        timeline = baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline')
        timeline.end_date = None
        timeline.save()
        timeline.operation.type = Operation.Types.LFO
        timeline.operation.save()
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        timeline.facility.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        expected_id = f'2{timeline.operation.naics_code.naics_code}0001'
        assert timeline.facility.bcghg_id.pk == expected_id
