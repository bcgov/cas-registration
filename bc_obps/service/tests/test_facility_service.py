from registration.schema.v1.facility import FacilityIn
import pytest
from registration.models.app_role import AppRole
from registration.tests.utils.bakers import (
    facility_baker,
    operation_baker,
)
from registration.models.well_authorization_number import WellAuthorizationNumber
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.facility_ownership_timeline import FacilityOwnershipTimeline
from registration.models.facility import Facility
from registration.models.operation import Operation
from registration.models.user import User
from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import operator_baker
from service.facility_service import FacilityService
from model_bakery import baker
from registration.models import Address

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

    @staticmethod
    def test_create_facilities_with_ownership_create_single_facility():
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
                type='Single Facility',
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
            )
        ]

        FacilityService.create_facilities_with_ownership(user.user_guid, payload)

        assert len(Facility.objects.all()) == 1

    @staticmethod
    def test_create_facilities_with_ownership_create_multiple_facilities():
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
                type='Single Facility',
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
                type='Large Facility',
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
                well_authorization_numbers=[12345, 654321],
            ),
            FacilityIn(
                name='Test Facility 3',
                type='Single Facility',
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
            ),
        ]

        FacilityService.create_facilities_with_ownership(user.user_guid, payload)

        assert len(Facility.objects.all()) == 3


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
