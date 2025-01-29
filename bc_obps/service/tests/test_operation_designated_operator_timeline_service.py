from zoneinfo import ZoneInfo
import pytest
from datetime import datetime
from uuid import uuid4
from model_bakery import baker
from service.operation_designated_operator_timeline_service import OperationDesignatedOperatorTimelineService
from registration.models import OperationDesignatedOperatorTimeline

pytestmark = pytest.mark.django_db


class TestOperationDesignatedOperatorTimelineService:
    @staticmethod
    def test_get_current_timeline():
        timeline_with_no_end_date = baker.make_recipe('utils.operation_designated_operator_timeline', end_date=None)
        # another timeline for the same operation to make sure it is not returned
        baker.make_recipe('utils.operation_designated_operator_timeline', operation=timeline_with_no_end_date.operation)
        result_found = OperationDesignatedOperatorTimelineService.get_current_timeline(
            timeline_with_no_end_date.operator_id, timeline_with_no_end_date.operation_id
        )
        assert result_found == timeline_with_no_end_date

        timeline_with_end_date = baker.make_recipe('utils.operation_designated_operator_timeline')
        result_not_found = OperationDesignatedOperatorTimelineService.get_current_timeline(
            timeline_with_end_date.operator_id, timeline_with_end_date.operation_id
        )
        assert result_not_found is None

    @staticmethod
    def test_set_timeline_status_and_end_date():
        timeline = baker.make_recipe(
            'utils.operation_designated_operator_timeline', status=OperationDesignatedOperatorTimeline.Statuses.ACTIVE
        )
        new_status = OperationDesignatedOperatorTimeline.Statuses.TRANSFERRED
        end_date = datetime.now(ZoneInfo("UTC"))
        user_guid = uuid4()

        updated_timeline = OperationDesignatedOperatorTimelineService.set_timeline_status_and_end_date(
            user_guid, timeline, new_status, end_date
        )

        assert updated_timeline.status == new_status
        assert updated_timeline.end_date == end_date
        assert updated_timeline.operator_id == timeline.operator_id
        assert updated_timeline.operation_id == timeline.operation_id

        # Verify the changes are saved in the database
        timeline.refresh_from_db()
        assert timeline.status == new_status
        assert timeline.end_date == end_date
