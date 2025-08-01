import pytest
from django.utils import timezone
from model_bakery import baker
from service.operation_designated_operator_timeline_service import OperationDesignatedOperatorTimelineService

pytestmark = pytest.mark.django_db


class TestOperationDesignatedOperatorTimelineService:
    @staticmethod
    def test_get_current_timeline():
        timeline_with_no_end_date = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline', end_date=None
        )
        # another timeline for the same operation to make sure it is not returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=timeline_with_no_end_date.operation,
        )
        result_found = OperationDesignatedOperatorTimelineService.get_current_timeline(
            timeline_with_no_end_date.operator_id, timeline_with_no_end_date.operation_id
        )
        assert result_found == timeline_with_no_end_date

        timeline_with_end_date = baker.make_recipe('registration.tests.utils.operation_designated_operator_timeline')
        result_not_found = OperationDesignatedOperatorTimelineService.get_current_timeline(
            timeline_with_end_date.operator_id, timeline_with_end_date.operation_id
        )
        assert result_not_found is None

    @staticmethod
    def test_set_timeline_end_date():
        timeline = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
        )
        end_date = timezone.now()

        updated_timeline = OperationDesignatedOperatorTimelineService.set_timeline_end_date(timeline, end_date)

        assert updated_timeline.end_date == end_date
        assert updated_timeline.operator_id == timeline.operator_id
        assert updated_timeline.operation_id == timeline.operation_id

        # Verify the changes are saved in the database
        timeline.refresh_from_db()
        assert timeline.end_date == end_date
