import pytest
from registration.models import Activity
from service.activity_service import ActivityService

pytestmark = pytest.mark.django_db


class TestAddressService:
    @staticmethod
    def test_get_all_activities():
        all_activities_sorted = Activity.objects.all().order_by('weight', 'name')
        from_service = ActivityService.get_all_activities()
        for i in range(len(all_activities_sorted)):
            assert all_activities_sorted[i].name == from_service[i]['name']
