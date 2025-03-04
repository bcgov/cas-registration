import re
import pytest
from model_bakery import baker
from registration.schema.v1.facility import FacilityIn
from registration.models import (
    Address,
    Facility,
    Operation,
    User,
    AppRole,
    FacilityDesignatedOperationTimeline,
    UserOperator,
    WellAuthorizationNumber,
)
from registration.tests.utils.helpers import TestUtils
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.tests.utils.bakers import (
    address_baker,
    operation_baker,
    operator_baker,
)
from service.facility_service import FacilityService
from unittest.mock import patch, MagicMock
from uuid import uuid4


pytestmark = pytest.mark.django_db


class TestGetIfAuthorized:
    @staticmethod
    def test_get_if_authorized_cas_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_analyst"))

        facility = baker.make_recipe('registration.tests.utils.facility')
        baker.make(FacilityDesignatedOperationTimeline, operation=operation_baker(), facility=facility)

        result = FacilityService.get_if_authorized(user.user_guid, facility.id)
        assert result == facility

    @staticmethod
    def test_get_if_authorized_industry_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = operation_baker(operator.id)
        facility = baker.make_recipe('registration.tests.utils.facility')
        baker.make(FacilityDesignatedOperationTimeline, operation=owning_operation, facility=facility)

        result = FacilityService.get_if_authorized(user.user_guid, facility.id)
        assert result == facility

    @staticmethod
    def test_get_if_authorized_industry_user_fail():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        timeline = baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline')
        timeline.end_date = None
        timeline.save()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.get_if_authorized(user.user_guid, timeline.facility.id)

    @staticmethod
    def test_create_facilities_with_designated_operations_create_single_facility():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = operation_baker(operator.id)
        payload = [
            FacilityIn(
                name='Test Facility 1',
                type=Facility.Types.SINGLE_FACILITY,
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
            )
        ]

        FacilityService.create_facilities_with_designated_operations(user.user_guid, payload)

        assert len(Facility.objects.all()) == 1

    @staticmethod
    def test_create_facilities_with_designated_operations_create_multiple_facilities():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        owning_operation: Operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.LFO,
        )
        payload = [
            FacilityIn(
                name='Test Facility 1',
                type=Facility.Types.MEDIUM_FACILITY,
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
            ),
            FacilityIn(
                street_address='123 street',
                municipality='city',
                province='AB',
                postal_code='H0H0H0',
                name='Test Facility 2',
                type=Facility.Types.MEDIUM_FACILITY,
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
                well_authorization_numbers=[12345, 654321],
            ),
            FacilityIn(
                name='Test Facility 3',
                type=Facility.Types.SMALL_AGGREGATE,
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
            ),
        ]

        FacilityService.create_facilities_with_designated_operations(approved_user_operator.user.user_guid, payload)

        assert len(Facility.objects.all()) == 3


class TestCreateFacilityWithDesignatedOperation:
    @staticmethod
    def test_create_sfo_facility_with_designated_operation_without_address():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        owning_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )

        FacilityService.create_facility_with_designated_operation(approved_user_operator.user.user_guid, payload)
        assert Facility.objects.count() == 1
        assert Address.objects.count() == 1  # operation_baker() creates an address (mandatory for the operator)
        assert len(FacilityDesignatedOperationTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None

    @staticmethod
    def test_create_second_sfo_facility_error():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        owning_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.SFO,
        )

        payload = FacilityIn(
            name='doraemon',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        payload2 = FacilityIn(
            name='shinchan',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )

        FacilityService.create_facility_with_designated_operation(approved_user_operator.user.user_guid, payload)
        assert Facility.objects.count() == 1
        assert Facility.objects.get(name="doraemon") is not None

        # test if second facility raises proper exception
        with pytest.raises(
            Exception,
            match=re.escape(
                "This type of operation (SFO or EIO) can only have one facility, this page should not be accessible"
            ),
        ):
            FacilityService.create_facility_with_designated_operation(approved_user_operator.user.user_guid, payload2)

    @staticmethod
    def test_create_lfo_facility_with_designated_operation_with_address():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        owning_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )

        payload = FacilityIn(
            street_address='123 street',
            municipality='city',
            province='AB',
            postal_code='H0H0H0',
            name='zip',
            type=Facility.Types.LARGE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            well_authorization_numbers=[12345, 654321],
        )

        FacilityService.create_facility_with_designated_operation(approved_user_operator.user.user_guid, payload)
        assert len(Facility.objects.all()) == 1
        assert (
            Address.objects.count() == 2
        )  # 2 because operation_baker() created an address (mandatory) for the operator
        assert WellAuthorizationNumber.objects.count() == 2
        assert len(FacilityDesignatedOperationTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None


class TestUpdateFacility:
    @staticmethod
    def _setup_facility(user_role="industry_user", with_address=False, facility_well_authorization_numbers=None):
        """
        Helper function to set up a test environment with a User, Operator, Operation, and Facility.

        This function creates and returns instances of a User, Owning Operation, and Facility.
        It allows optional inclusion of a facility address and well authorization numbers.

        Args:
            user_role (str): The role assigned to the User. Defaults to "industry_user".
                            If set to "unauthorized_user", the user will not be authorized for the operator.
            with_address (bool): If True, a Facility with an associated address will be created. Defaults to False.
            facility_well_authorization_numbers (list, optional): A list of well authorization numbers to associate with the Facility.
                                                                If None, no well authorization numbers will be created. Defaults to None.

        Returns:
            tuple: A tuple containing the User instance, Owning Operation instance, and Facility instance.
                (user, owning_operation, facility)
        """
        # Create a new instance of User model
        user = baker.make(User, app_role=AppRole.objects.get(role_name=user_role))

        # Create a new instance of the Operator model
        operator = baker.make_recipe('registration.tests.utils.operator')

        # Authorize the Operator User if required
        if user_role == "industry_user":
            baker.make_recipe('registration.tests.utils.approved_user_operator', user=user, operator=operator)

        # Create an Owning Operation
        owning_operation = baker.make_recipe('registration.tests.utils.operation', operator=operator)

        # Create Well Authorization Numbers if provided
        well_auth_objs = []
        if facility_well_authorization_numbers:
            well_auth_objs = [
                WellAuthorizationNumber.objects.create(well_authorization_number=num)
                for num in facility_well_authorization_numbers
            ]

        # Create a new instance of the Facility model
        address = address_baker() if with_address else None
        facility = baker.make_recipe('registration.tests.utils.facility', address=address, operation=owning_operation)

        # Set Well Authorization Numbers if they were created
        if well_auth_objs:
            facility.well_authorization_numbers.set(well_auth_objs)

        # Link the created facility with an operation
        baker.make(FacilityDesignatedOperationTimeline, operation=owning_operation, facility=facility)

        return user, owning_operation, facility

    @staticmethod
    def _assert_updated_mandatory_fields(facility, payload):
        """
        Asserts that the fields in the response data match the expected values from the payload.

        Args:
            response_data (dict): The data returned from the response, typically a JSON object.
            payload (dict): The expected data values to compare against.

        Asserts:
            - The 'name' field in response_data matches the 'name' field in payload.
            - The 'type' field in response_data matches the 'type' field in payload.
            - The 'latitude_of_largest_emissions' field in response_data is close to the corresponding value in payload.
            - The 'longitude_of_largest_emissions' field in response_data is close to the corresponding value in payload.

        Raises:
            AssertionError: If any of the assertions fail.
        """
        assert facility.name == payload.name
        assert facility.type == payload.type
        assert facility.latitude_of_largest_emissions == payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == payload.longitude_of_largest_emissions

    @staticmethod
    def test_update_facility_unauthorized():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(user_role="cas_pending")
        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.update_facility(user.user_guid, facility.id, payload)

    @staticmethod
    def test_update_facility_with_mandatory_data():
        user, owning_operation, facility = TestUpdateFacility._setup_facility()

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Non-Updated Optional Fields
        assert facility.is_current_year is None
        assert facility.starting_date is None
        assert facility.well_authorization_numbers.count() == 0
        assert facility.address is None

        # Assert Updated State
        TestUtils.assert_facility_db_state(facility)

    @staticmethod
    def test_update_facility_with_all_data():
        user, owning_operation, facility = TestUpdateFacility._setup_facility()

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.LARGE_FACILITY,
            well_authorization_numbers=[1, 2, 3],
            is_current_year=True,
            starting_date="2024-07-07T09:00:00.000Z",
            street_address="1234 Test St",
            municipality="Test City",
            province="ON",
            postal_code="T3S T1N",
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated Optional Fields
        assert facility.is_current_year == payload.is_current_year
        assert facility.starting_date == payload.starting_date
        assert sorted(
            list(facility.well_authorization_numbers.values_list('well_authorization_number', flat=True))
        ) == sorted(payload.well_authorization_numbers)
        assert facility.address.street_address == payload.street_address
        assert facility.address.municipality == payload.municipality
        assert facility.address.province == payload.province
        assert facility.address.postal_code == payload.postal_code

        # Assert Updated State
        TestUtils.assert_facility_db_state(
            facility,
            expect_address=facility.address,
            expect_well_authorization_numbers=len(payload.well_authorization_numbers),
        )

    @staticmethod
    def test_update_facility_update_address():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(with_address=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_address=facility.address)

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            street_address="1234 Test St",
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated Optional Fields
        assert facility.address.street_address == payload.street_address
        assert facility.address.municipality is None
        assert facility.address.province is None
        assert facility.address.postal_code is None

        # Assert Updated State
        TestUtils.assert_facility_db_state(facility, expect_address=facility.address)

    @staticmethod
    def test_update_facility_remove_address():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(with_address=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_address=facility.address)

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated State
        TestUtils.assert_facility_db_state(facility, expect_address=None)

    @staticmethod
    def test_update_facility_update_well_authorization_numbers():
        well_auth_numbers = [123, 9876]
        user, owning_operation, facility = TestUpdateFacility._setup_facility(
            facility_well_authorization_numbers=well_auth_numbers
        )

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_well_authorization_numbers=len(well_auth_numbers))

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            well_authorization_numbers=[1, 2, 3],
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated Optional Fields
        assert len(facility.well_authorization_numbers.all()) == len(payload.well_authorization_numbers)

        # Assert Updated State
        TestUtils.assert_facility_db_state(
            facility, expect_well_authorization_numbers=len(payload.well_authorization_numbers)
        )

    @staticmethod
    def test_update_facility_remove_well_authorization_numbers():
        well_auth_numbers = [123, 9876]
        user, owning_operation, facility = TestUpdateFacility._setup_facility(
            facility_well_authorization_numbers=well_auth_numbers
        )

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_well_authorization_numbers=len(well_auth_numbers))

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated Optional Fields
        assert len(facility.well_authorization_numbers.all()) == 0

        # Assert Updated State
        TestUtils.assert_facility_db_state(facility, expect_well_authorization_numbers=0)


class TestGenerateBcghgId:
    @staticmethod
    def test_generates_bcghg_id():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        timeline = baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline')
        timeline.operation.operator = approved_user_operator.operator
        timeline.operation.save()
        timeline.end_date = None
        timeline.save()

        FacilityService.generate_bcghg_id(approved_user_operator.user.user_guid, timeline.facility.id)
        timeline.facility.refresh_from_db()
        assert timeline.facility.bcghg_id is not None
        assert timeline.facility.bcghg_id.issued_by == approved_user_operator.user


class TestUpdateFacilitysOperation:
    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_unauthorized_user_cannot_update(mock_get_by_guid):
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        mock_get_by_guid.return_value = cas_admin
        operation = MagicMock()
        operation_id = uuid4()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.update_operation_for_facility(cas_admin.user_guid, operation, operation_id)

    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_update_operation_for_facility_success(mock_get_by_guid):
        cas_analyst = baker.make_recipe('registration.tests.utils.cas_analyst')
        mock_get_by_guid.return_value = cas_analyst
        operation = baker.make_recipe('registration.tests.utils.operation')
        facility = baker.make_recipe('registration.tests.utils.facility')
        FacilityService.update_operation_for_facility(cas_analyst.user_guid, facility, operation.id)
        assert facility.operation == operation
