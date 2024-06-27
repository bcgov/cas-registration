import pytest
from registration.models import (
    UserOperator,
    Facility,
    Operation,
    FacilityOwnershipTimeline,
    User,
    WellAuthorizationNumber,
    AppRole,
    Address,
)
from registration.tests.utils.bakers import (
    facility_baker,
    facility_ownership_timeline_baker,
    operation_baker,
    user_baker,
    user_operator_baker,
)
from service.data_access_service.facility_service import FacilityDataAccessService
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.tests.utils.bakers import operator_baker
from service.facility_service import FacilityService
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestFacilityService:
    @staticmethod
    def test_list_facilities_for_irc_user():
        facility_baker(_quantity=10)
        irc_user = user_baker({'app_role': AppRole.objects.get(role_name='cas_admin')})
        assert FacilityDataAccessService.get_all_facilities_for_user(irc_user).count() == 10

    @staticmethod
    def test_list_facilities_for_industry_user():
        industry_user = user_baker({'app_role': AppRole.objects.get(role_name='industry_user')})
        users_operation = operation_baker()
        random_operation = operation_baker()
        baked_users_facilities = facility_baker(_quantity=10)  # facilities for users operation
        random_facilities = facility_baker(_quantity=10)  # facilities for random operation
        facility_timelines = []
        for u_f in baked_users_facilities:
            facility_timelines.extend(
                facility_ownership_timeline_baker(
                    operation_id=users_operation.id, facility_id=u_f.id, _quantity=2
                )  # ownership history for each facility in users operation
            )
        for r_f in random_facilities:
            facility_timelines.extend(
                facility_ownership_timeline_baker(
                    operation_id=random_operation.id, facility_id=r_f.id, _quantity=2
                )  # ownership history for each facility in random operation
            )
        # Approved user operator for industry user
        user_operator_baker(
            {"user": industry_user, "operator": users_operation.operator, "status": UserOperator.Statuses.APPROVED}
        )
        users_facilities = FacilityDataAccessService.get_all_facilities_for_user(industry_user)
        assert users_facilities.count() == 10
        # make sure user's facilities are only from their operation
        users_facilities_ids = users_facilities.values_list('id', flat=True)
        assert all([facility.id in users_facilities_ids for facility in users_facilities])


class TestGetIfAuthorized:
    @staticmethod
    def test_get_if_authorized_cas_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_analyst"))

        facility = baker.make(Facility, latitude_of_largest_emissions=5, longitude_of_largest_emissions=5)
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
        facility = baker.make(Facility, latitude_of_largest_emissions=5, longitude_of_largest_emissions=5)
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
        payload = {
            'facility_data': {
                'name': 'zip',
                'type': 'Single Facility',
                'latitude_of_largest_emissions': 5,
                'longitude_of_largest_emissions': 5,
            },
            'operation_id': operation_baker().id,
        }

        FacilityService.create_facility_with_ownership(user.user_guid, payload)
        assert len(Facility.objects.all()) == 1

        assert Address.objects.count() == 1  # operation_baker() creates an address (mandatory for the operator)
        assert len(FacilityOwnershipTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None

    @staticmethod
    def test_create_lfo_facility_with_ownership_with_address():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        payload = {
            'address_data': {
                'street_address': '123 street',
                'municipality': 'city',
                'province': 'AB',
                'postal_code': 'H0H0H0',
            },
            'facility_data': {
                'name': 'zip',
                'type': 'Large Facility',
                'latitude_of_largest_emissions': 5,
                'longitude_of_largest_emissions': 5,
            },
            'operation_id': operation_baker().id,
            'well_data': [12345, 654321],
        }

        FacilityService.create_facility_with_ownership(user.user_guid, payload)
        assert len(Facility.objects.all()) == 1
        assert Address.objects.count() == 2  # operation_baker() creates an address (mandatory for the operator)
        assert WellAuthorizationNumber.objects.count() == 2
        assert len(FacilityOwnershipTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None
