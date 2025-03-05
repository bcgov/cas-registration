import pytest
import json
from registration.models import (
    Address,
    AppRole,
    BusinessStructure,
    Facility,
    User,
    UserOperator,
    WellAuthorizationNumber,
)
from model_bakery import baker
from django.test import Client
from phonenumber_field.modelfields import PhoneNumberField
from registration.constants import BASE_ENDPOINT
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline


class TestUtils:
    # initialize the APIClient app
    client = Client()

    def save_app_role(self, role_name):
        self.user.app_role = AppRole.objects.filter(role_name=role_name).first() or baker.make(
            AppRole, role_name=role_name
        )
        self.user.save()

    def mock_get_with_auth_role(self, role_name, endpoint=None):
        TestUtils.save_app_role(self, role_name)
        return TestUtils.client.get(endpoint or self.endpoint, HTTP_AUTHORIZATION=self.auth_header_dumps)

    def mock_post_with_auth_role(self, role_name, content_type, data, endpoint=None):
        TestUtils.save_app_role(self, role_name)
        return TestUtils.client.post(
            endpoint or self.endpoint, content_type=content_type, data=data, HTTP_AUTHORIZATION=self.auth_header_dumps
        )

    def mock_put_with_auth_role(self, role_name, content_type, data, endpoint=None):
        TestUtils.save_app_role(self, role_name)
        return TestUtils.client.put(
            endpoint or self.endpoint, content_type=content_type, data=data, HTTP_AUTHORIZATION=self.auth_header_dumps
        )

    def mock_patch_with_auth_role(self, role_name, content_type, data, endpoint=None):
        TestUtils.save_app_role(self, role_name)
        return TestUtils.client.patch(
            endpoint or self.endpoint, content_type=content_type, data=data, HTTP_AUTHORIZATION=self.auth_header_dumps
        )

    def authorize_current_user_as_operator_user(self, operator):
        return baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

    def mock_delete_with_auth_role(self, role_name, endpoint=None):
        TestUtils.save_app_role(self, role_name)
        return TestUtils.client.delete(endpoint or self.endpoint, HTTP_AUTHORIZATION=self.auth_header_dumps)

    def create_operator_and_operation(self):
        """
        Creates operator and operation instance for testing purposes.

        This method performs the following steps:
        1. **Create an Operator**: Uses the `operator_baker` to generate a new operator instance. This instance simulates a user who has certain roles and permissions.
        2. **Create an Owning Operation**: Uses `operation_baker` to generate a new operation instance associated with the operator.

        Returns:
        - Tuple: A tuple containing two elements:
            - `operator`: The created operator instance.
            - `owning_operation`: The created operation instance associated with the operator.
        """
        # Create an operator instance
        operator = baker.make_recipe('registration.tests.utils.operator')

        # Create an operation instance associated with the operator
        owning_operation = baker.make_recipe('registration.tests.utils.operation', operator=operator)

        # Return the created operator and operation instances
        return operator, owning_operation

    def create_operator_operation_and_facility(
        self, authorize_user=False, with_address=False, facility_well_authorization_numbers=None
    ):
        """
        Sets up an operator, an associated facility, and optionally an address and well authorization numbers
        for testing purposes.

        Args:
            self (TestCase): The test instance that is using this helper. This is typically the test class
                                    instance which might be used for setting up authorization or other configurations.
            authorize_user (bool, optional): If True, authorizes the current user as the created operator. Defaults to False.
            with_address (bool, optional): If True, creates and associates an address with the facility. Defaults to False.
            facility_well_authorization_numbers (int, optional): The number of WellAuthorizationNumber instances to
                                                                create and associate with the facility. Defaults to None (creates none).

        Returns:
            tuple: A tuple containing:
                - `operator` (Operator): The created operator instance.
                - `owning_operation` (Operation): The operation associated with the operator.
                - `facility` (Facility): The created facility instance.

        Raises:
            Exception: If there is an issue creating or setting up the objects.
        """
        # Create an operator and associated operation
        operator, owning_operation = TestUtils.create_operator_and_operation(self)

        # Optionally authorize the current user as the operator user
        if authorize_user:
            TestUtils.authorize_current_user_as_operator_user(self, operator)

        # Create a facility, optionally with an address
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=owning_operation,
            address=baker.make_recipe('registration.tests.utils.address') if with_address else None,
        )

        # Link the created facility with the operation
        baker.make(FacilityDesignatedOperationTimeline, operation=owning_operation, facility=facility)

        # Optionally set facility well authorization numbers
        if facility_well_authorization_numbers:
            well_auth_objs = [
                WellAuthorizationNumber.objects.create(well_authorization_number=num)
                for num in facility_well_authorization_numbers
            ]
            facility.well_authorization_numbers.set(well_auth_objs)

        return operator, owning_operation, facility

    def assert_facility_db_state(facility, expect_address=None, expect_well_authorization_numbers=None):
        """
        Asserts the state of a Facility object and related models.

        Args:
            facility (Facility): The Facility instance to check.
            expect_address (Address, optional): The expected Address instance associated with the facility.
                                                If None, it asserts that the facility does not have an address.
            expect_well_authorization_numbers (int, optional): The expected count of WellAuthorizationNumber
                                                            instances associated with the facility.
                                                            If None, it asserts that the count is 0.

        Raises:
            AssertionError: If any of the assertions fail.
        """

        assert facility.address == expect_address
        assert facility.well_authorization_numbers.count() == (
            expect_well_authorization_numbers if expect_well_authorization_numbers is not None else 0
        )
        assert Facility.objects.count() == 1
        assert Address.objects.count() == (2 if expect_address else 1)  # 1 for the operator; 0-1 for the facility
        assert WellAuthorizationNumber.objects.count() == (
            expect_well_authorization_numbers if expect_well_authorization_numbers is not None else 0
        )

    @staticmethod
    def mock_postal_code():
        return "v8v3g1"

    @staticmethod
    def mock_phone_number():
        return "+17787777777"

    @staticmethod
    def create_mock_operator_payload(business_structure: BusinessStructure):
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


baker.generators.add(PhoneNumberField, TestUtils.mock_phone_number)


class CommonTestSetup:
    pytestmark = pytest.mark.django_db  # This is used to mark a test function as requiring the database
    base_endpoint = BASE_ENDPOINT

    def setup_method(self):
        self.content_type = "application/json"
        self.user = baker.make(
            User, app_role_id="industry_user", _fill_optional=True
        )  # Passing _fill_optional to fill all fields with random data
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)
