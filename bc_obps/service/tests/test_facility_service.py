import pytest
from model_bakery import baker
from registration.schema.v1.facility import FacilityIn
from registration.models import (
    Address,
    Facility,
    Operation,
    User,
    AppRole,
    FacilityOwnershipTimeline,
    UserOperator,
    WellAuthorizationNumber,
)
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.tests.utils.bakers import (
    address_baker,
    facility_baker,
    operation_baker,
    operator_baker,
)
from service.facility_service import FacilityService

pytestmark = pytest.mark.django_db


class TestGetIfAuthorized:
    @staticmethod
    def test_get_if_authorized_cas_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_analyst"))

        facility = facility_baker()
        baker.make(FacilityOwnershipTimeline, operation=operation_baker(), facility=facility)

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
        facility = facility_baker()
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)

        result = FacilityService.get_if_authorized(user.user_guid, facility.id)
        assert result == facility

    @staticmethod
    def test_get_if_authorized_industry_user_fail():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        owning_operator = operator_baker()
        random_operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=random_operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = operation_baker(owning_operator.id)
        facility = baker.make(Facility, latitude_of_largest_emissions=5, longitude_of_largest_emissions=5)
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.get_if_authorized(user.user_guid, facility.id)


class TestCreateFacilityWithOwnership:
    @staticmethod
    def test_create_sfo_facility_with_ownership_without_address():
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

        payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )

        FacilityService.create_facility_with_ownership(user.user_guid, payload)
        assert Facility.objects.count() == 1

        assert Address.objects.count() == 1  # operation_baker() creates an address (mandatory for the operator)
        assert len(FacilityOwnershipTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None

    @staticmethod
    def test_create_lfo_facility_with_ownership_with_address():
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
        payload = FacilityIn(
            street_address='123 street',
            municipality='city',
            province='AB',
            postal_code='H0H0H0',
            name='zip',
            type='Large Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            well_authorization_numbers=[12345, 654321],
        )

        FacilityService.create_facility_with_ownership(user.user_guid, payload)
        assert len(Facility.objects.all()) == 1
        assert (
            Address.objects.count() == 2
        )  # 2 because operation_baker() created an address (mandatory) for the operator
        assert WellAuthorizationNumber.objects.count() == 2
        assert len(FacilityOwnershipTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None


class TestUpdateFacility:
    @staticmethod
    def _setup_facility(user_role="industry_user", with_address=False, with_well_auth=False):
        """
        Helper function to set up a test environment with a User, Operator, Operation, and Facility.

        This function creates and returns instances of a User, Owning Operation, and Facility.
        It allows optional inclusion of a facility address and well authorization numbers.

        Args:
            user_role (str): The role assigned to the User. Defaults to "industry_user".
                            If set to "unauthorized_user", the user will not be authorized for the operator.
            with_address (bool): If True, a Facility with an associated address will be created. Defaults to False.
            with_well_auth (bool): If True, the Facility will be created with well authorization numbers. Defaults to False.

        Returns:
            tuple: A tuple containing the User instance, Owning Operation instance, and Facility instance.
                (user, owning_operation, facility)
        """
        # create a new instance of User model
        user = baker.make(User, app_role=AppRole.objects.get(role_name=user_role))
        # create a new instance of the Operator model
        operator = operator_baker()
        # authorize the Operator User if required
        if user_role == "industry_user":
            baker.make(
                UserOperator,
                user_id=user.user_guid,
                status=UserOperator.Statuses.APPROVED,
                operator=operator,
                role=UserOperator.Roles.ADMIN,
            )
        # create an Owning Operation
        owning_operation = operation_baker(operator.id)
        # create a new instance of the Facility model
        address = address_baker() if with_address else None
        well_auth_numbers = (
            [WellAuthorizationNumber.objects.create(well_authorization_number=num) for num in [123456789, 987654321]]
            if with_well_auth
            else []
        )
        facility = facility_baker(address=address, well_authorization_numbers=well_auth_numbers)
        # link the created facility with an operation
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)
        return user, owning_operation, facility

    @staticmethod
    def _assert_well_authorization_numbers(facility, expected_count=2):
        """
        Helper function to assert the well authorization numbers of a facility.

        This function checks whether the facility has well authorization numbers,
        and asserts that the count of these numbers matches the expected value both
        for the facility and in the database.

        Args:
            facility (Facility): The facility instance to check.
            expected_count (int): The expected number of well authorization numbers.

        Raises:
            AssertionError: If the facility does not have well authorization numbers
                            or the counts do not match the expected value.
        """
        # Assert the facility has well authorization numbers
        assert (
            facility.well_authorization_numbers is not None
        ), "The facility should have associated well authorization numbers."

        # Get well authorization numbers from the facility
        facility_well_auth_numbers = list(
            facility.well_authorization_numbers.values_list('well_authorization_number', flat=True)
        )

        # Assert the length matches the expected count
        actual_count = len(facility_well_auth_numbers)
        assert (
            actual_count == expected_count
        ), f"Expected {expected_count} well authorization numbers in the facility, but found {actual_count}."

        # Assert the total count of WellAuthorizationNumber in the database matches the expected count
        actual_db_count = WellAuthorizationNumber.objects.count()
        assert (
            actual_db_count == expected_count
        ), f"Expected {expected_count} well authorization numbers in the database, but found {actual_db_count}."

    @staticmethod
    def _assert_facility_address(facility, expected_count, address_expected=True):
        """
        Helper function to assert the presence or absence of an address for a facility and validate the address count in the database.

        This function checks whether the given facility has an associated address (if `address_expected` is True) and asserts
        the count of address records in the database.

        Args:
            facility (Facility): The Facility instance to check.
            expected_count (int): The expected number of address records in the database.
            address_expected (bool): Whether an address is expected for the facility. Defaults to True.

        Raises:
            AssertionError: If the facility address presence or absence does not match the expected value or if the address count
                            does not match the expected value.
        """
        if address_expected:
            # Assert that the facility has an address
            assert facility.address is not None, "The facility should have an associated address."
        else:
            # Assert that the facility does not have an address
            assert facility.address is None, "The facility should not have an associated address."

        # Assert that the address count in the database matches the expected value
        actual_address_count = Address.objects.count()
        assert (
            actual_address_count == expected_count
        ), f"Expected {expected_count} address records, found {actual_address_count}."

    @staticmethod
    def test_update_facility_unauthorized():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(user_role="cas_pending")
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.update_facility(user.user_guid, facility.id, facility_payload)

    @staticmethod
    def test_update_facility_with_mandatory_data():
        user, owning_operation, facility = TestUpdateFacility._setup_facility()
        # Before update assertions
        TestUpdateFacility._assert_well_authorization_numbers(facility, expected_count=0)
        TestUpdateFacility._assert_facility_address(
            facility, expected_count=1, address_expected=False
        )  # assert 1 for the operator; 0 for the facility

        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert facility.is_current_year is None
        assert facility.starting_date is None
        assert facility.address is None
        assert len(facility.well_authorization_numbers.all()) == 0
        # After update assertions
        TestUpdateFacility._assert_well_authorization_numbers(facility, expected_count=0)
        TestUpdateFacility._assert_facility_address(
            facility, expected_count=1, address_expected=False
        )  # assert 1 for the operator; 0 for the facility

    @staticmethod
    def test_update_facility_with_all_data():
        user, owning_operation, facility = TestUpdateFacility._setup_facility()
        # Before update assertions
        TestUpdateFacility._assert_well_authorization_numbers(facility, expected_count=0)
        TestUpdateFacility._assert_facility_address(
            facility, expected_count=1, address_expected=False
        )  # assert 1 for the operator; 0 for the facility
        facility_payload = FacilityIn(
            name='zip',
            type='Large Facility',
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
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert facility.is_current_year == facility_payload.is_current_year
        assert facility.starting_date == facility_payload.starting_date
        assert facility.address.street_address == facility_payload.street_address
        assert facility.address.municipality == facility_payload.municipality
        assert facility.address.province == facility_payload.province
        assert facility.address.postal_code == facility_payload.postal_code
        assert sorted(
            facility.well_authorization_numbers.values_list('well_authorization_number', flat=True)
        ) == sorted(facility_payload.well_authorization_numbers)
        # After update assertions
        TestUpdateFacility._assert_well_authorization_numbers(
            facility, expected_count=len(facility_payload.well_authorization_numbers)
        )
        TestUpdateFacility._assert_facility_address(
            facility, expected_count=2, address_expected=True
        )  # assert 1 for the operator; 1 for the facility

    @staticmethod
    def test_update_facility_update_address():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(with_address=True)
        # Before update assertions
        TestUpdateFacility._assert_facility_address(
            facility, expected_count=2, address_expected=True
        )  # assert 1 for the operator; 1 for the facility
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            street_address="1234 Test St",
        )
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert facility.address.street_address == facility_payload.street_address
        assert facility.address.municipality is None
        assert facility.address.province is None
        assert facility.address.postal_code is None
        # After update assertions
        TestUpdateFacility._assert_facility_address(
            facility, expected_count=2, address_expected=True
        )  # assert 1 for the operator; 1 for the facility

    @staticmethod
    def test_update_facility_remove_address():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(with_address=True)
        # Before update assertions
        TestUpdateFacility._assert_facility_address(
            facility, expected_count=2, address_expected=True
        )  # assert 1 for the operator; 1 for the facility
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert facility.address is None
        # After update assertions
        TestUpdateFacility._assert_facility_address(
            facility, expected_count=1, address_expected=False
        )  # assert 1 for the operator; 0 for the facility

    @staticmethod
    def test_update_facility_update_well_authorization_numbers():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(with_well_auth=True)
        # Before update assertions
        TestUpdateFacility._assert_well_authorization_numbers(facility, expected_count=2)
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            well_authorization_numbers=[1, 2, 3],
        )
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert len(facility.well_authorization_numbers.values_list('well_authorization_number', flat=True)) == len(
            facility_payload.well_authorization_numbers
        )
        # After update assertions
        TestUpdateFacility._assert_well_authorization_numbers(
            facility, expected_count=len(facility_payload.well_authorization_numbers)
        )

    @staticmethod
    def test_update_facility_remove_well_authorization_numbers():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(with_well_auth=True)
        # Before update assertions
        TestUpdateFacility._assert_well_authorization_numbers(facility, expected_count=2)
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert len(facility.well_authorization_numbers.all()) == 0
        # After update assertions
        TestUpdateFacility._assert_well_authorization_numbers(facility, expected_count=0)
