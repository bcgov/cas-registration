from itertools import cycle
from unittest.mock import patch, MagicMock
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
    def test_list_timeline_by_operator_id():
        operator = baker.make_recipe('utils.operator')
        # timeline records without end date
        baker.make_recipe(
            'utils.operation_designated_operator_timeline',
            operator=operator,
            operation=cycle(baker.make_recipe('utils.operation', _quantity=2)),
            _quantity=2,
        )
        # timeline records with end date
        baker.make_recipe(
            'utils.operation_designated_operator_timeline', operator=operator, end_date=datetime.now(ZoneInfo("UTC"))
        )

        timelines = OperationDesignatedOperatorTimelineService.list_timeline_by_operator_id(operator.id)
        assert timelines.count() == 2
        assert all(timeline.end_date is None for timeline in timelines)
        assert all(timeline.operator_id == operator.id for timeline in timelines)

    @staticmethod
    def test_get_current_timeline():
        timeline_with_no_end_date = baker.make_recipe('utils.operation_designated_operator_timeline')
        result_found = OperationDesignatedOperatorTimelineService.get_current_timeline(
            timeline_with_no_end_date.operator_id, timeline_with_no_end_date.operation_id
        )
        assert result_found == timeline_with_no_end_date

        timeline_with_end_date = baker.make_recipe(
            'utils.operation_designated_operator_timeline', end_date=datetime.now(ZoneInfo("UTC"))
        )
        result_not_found = OperationDesignatedOperatorTimelineService.get_current_timeline(
            timeline_with_end_date.operator_id, timeline_with_end_date.operation_id
        )
        assert result_not_found is None

    @staticmethod
    @patch("registration.models.OperationDesignatedOperatorTimeline.set_create_or_update")
    def test_set_timeline_status_and_end_date(mock_set_create_or_update: MagicMock):
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

        # Verify set_create_or_update is called with the correct user_guid
        mock_set_create_or_update.assert_called_once_with(user_guid)

        # Verify the changes are saved in the database
        timeline.refresh_from_db()
        assert timeline.status == new_status
        assert timeline.end_date == end_date
