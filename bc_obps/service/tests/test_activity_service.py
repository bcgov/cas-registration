from model_bakery import baker
import pytest
from registration.models import Activity
from service.activity_service import ActivityService

pytestmark = pytest.mark.django_db


class TestActivityService:
    @staticmethod
    def test_get_all_activities():
        all_activities_sorted = Activity.objects.all().order_by('weight', 'name')
        from_service = ActivityService.get_all_activities()
        for i in range(len(all_activities_sorted)):
            assert all_activities_sorted[i].name == from_service[i]['name']

    @staticmethod
    def test_get_applicable_activities():
        # Create a report for a Linear Facilities Operation
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=operator,
            type='Linear Facilities Operation',
        )
        report = baker.make_recipe(
            'reporting.tests.utils.report',
            operation=operation,
        )
        report_version = baker.make_recipe(
            'reporting.tests.utils.report_version',
            report=report,
        )
        sfo_activities = Activity.objects.filter(applicable_to="Single Facility Operation").values_list(
            'name', flat=True
        )
        lfo_activities = Activity.objects.filter(applicable_to="Linear Facilities Operation").values_list(
            'name', flat=True
        )
        both_activities = Activity.objects.filter(applicable_to="all").values_list('name', flat=True)
        expected_activity_names = set(both_activities).union(set(lfo_activities))

        activities_from_service = ActivityService.get_applicable_activities(report_version.id)
        activity_names_from_service = {activity['name'] for activity in activities_from_service}
        # Assert that activities applicable to LFO and both are included, and SFO-only activities are excluded
        for name in expected_activity_names:
            assert name in activity_names_from_service

        for name in sfo_activities:
            assert name not in activity_names_from_service
