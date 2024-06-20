import pytest
from registration.models import UserOperator
from registration.models.app_role import AppRole
from registration.tests.utils.bakers import (
    facility_baker,
    facility_ownership_timeline_baker,
    operation_baker,
    user_baker,
    user_operator_baker,
)
from service.data_access_service.facility_service import FacilityDataAccessService

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
        users_facility_ownerships = facility_ownership_timeline_baker(
            operation_id=users_operation.id, _quantity=10
        )  # facilities for users operation
        facility_ownership_timeline_baker(
            operation_id=random_operation.id, _quantity=10
        )  # facilities for random operation
        # Approved user operator for industry user
        user_operator_baker(
            {"user": industry_user, "operator": users_operation.operator, "status": UserOperator.Statuses.APPROVED}
        )
        users_facilities = FacilityDataAccessService.get_all_facilities_for_user(industry_user)
        assert users_facilities.count() == 10
        # make sure user's facilities are only from their operation
        users_facilities_ids = users_facilities.values_list('id', flat=True)
        assert all(
            [facility_ownership.facility_id in users_facilities_ids for facility_ownership in users_facility_ownerships]
        )
