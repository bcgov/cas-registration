from datetime import datetime
from unittest.mock import MagicMock, patch
from uuid import uuid4
from zoneinfo import ZoneInfo
from registration.models import FacilityDesignatedOperationTimeline
from registration.schema.v1.facility_designated_operation_timeline import (
    FacilityDesignatedOperationTimelineFilterSchema,
)
from service.facility_designated_operation_timeline_service import FacilityDesignatedOperationTimelineService
import pytest
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestGetTimeline:
    @staticmethod
    def test_get_timeline_by_operation_id_for_irc_user():
        cas_admin = baker.make_recipe('utils.cas_admin')

        timeline_for_selected_operation = baker.make_recipe(
            'utils.facility_designated_operation_timeline', _quantity=10
        )
        # timeline for random operation's facilities
        baker.make_recipe('utils.facility_designated_operation_timeline', _quantity=10)

        expected_facilities = FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
            cas_admin, timeline_for_selected_operation[0].operation.id
        )

        assert expected_facilities.count() == 10

    @staticmethod
    def test_get_timeline_by_operation_id_for_unapproved_user_industry_user():
        industry_user = baker.make_recipe('utils.industry_operator_user')
        facility_designated_operation_timeline = baker.make_recipe('utils.facility_designated_operation_timeline')
        with pytest.raises(Exception, match="Unauthorized."):
            FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
                industry_user, facility_designated_operation_timeline.operation.id
            )

    @staticmethod
    def test_get_timeline_by_operation_id_industry_user():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        # user's timeline - 5 transferred, 10 active to make sure the filter is working
        baker.make_recipe(
            'utils.facility_designated_operation_timeline',
            operation=users_operation,
            _quantity=5,
            status=FacilityDesignatedOperationTimeline.Statuses.TRANSFERRED,
        )
        baker.make_recipe(
            'utils.facility_designated_operation_timeline',
            operation=users_operation,
            _quantity=10,
            status=FacilityDesignatedOperationTimeline.Statuses.ACTIVE,
        )
        # random timeline
        baker.make_recipe('utils.facility_designated_operation_timeline')

        facilities = FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
            approved_user_operator.user, users_operation.id
        )
        # the industry user should only be able to see their one
        assert facilities.count() == 10
        # Make sure the status filter is working
        assert all(facility.status == FacilityDesignatedOperationTimeline.Statuses.ACTIVE for facility in facilities)


class TestListTimeline:
    @staticmethod
    def test_list_timeline_sort():
        cas_admin = baker.make_recipe('utils.cas_admin')
        facilities = baker.make_recipe('utils.facility', _quantity=10)
        operation = baker.make_recipe('utils.operation')

        for facility in facilities:
            baker.make_recipe('utils.facility_designated_operation_timeline', facility=facility, operation=operation)

        facilities_list = FacilityDesignatedOperationTimelineService.list_timeline_by_operation_id(
            cas_admin.user_guid,
            operation.id,
            'facility__name',
            'asc',
            FacilityDesignatedOperationTimelineFilterSchema(
                facility_bcghg_id=None, facility__name=None, facility__type=None, status=None
            ),
        )
        assert facilities_list.first().facility.name == 'Facility 01'
        assert facilities_list.last().facility.name == 'Facility 09'

    @staticmethod
    def test_list_timeline_filter():
        cas_admin = baker.make_recipe('utils.cas_admin')
        facilities = baker.make_recipe('utils.facility', _quantity=10)
        operation = baker.make_recipe('utils.operation')

        for facility in facilities:
            baker.make_recipe('utils.facility_designated_operation_timeline', facility=facility, operation=operation)

        facilities_list = FacilityDesignatedOperationTimelineService.list_timeline_by_operation_id(
            cas_admin.user_guid,
            operation.id,
            "facility__created_at",  # default value
            "desc",  # default value
            FacilityDesignatedOperationTimelineFilterSchema(
                facility_bcghg_id=None, facility__name='8', facility__type=None, status=None
            ),
        )
        assert facilities_list.count() == 1
        assert facilities_list.first().facility.name == 'Facility 08'


class TestFacilityDesignatedOperationTimelineService:
    @staticmethod
    def test_get_current_timeline():
        timeline_with_no_end_date = baker.make_recipe('utils.facility_designated_operation_timeline', end_date=None)
        result_found = FacilityDesignatedOperationTimelineService.get_current_timeline(
            timeline_with_no_end_date.operation_id, timeline_with_no_end_date.facility_id
        )
        assert result_found == timeline_with_no_end_date
        timeline_with_end_date = baker.make_recipe(
            'utils.facility_designated_operation_timeline', end_date=datetime.now(ZoneInfo("UTC"))
        )
        result_not_found = FacilityDesignatedOperationTimelineService.get_current_timeline(
            timeline_with_end_date.operation_id, timeline_with_end_date.facility_id
        )
        assert result_not_found is None

    @staticmethod
    @patch("registration.models.FacilityDesignatedOperationTimeline.set_create_or_update")
    def test_set_timeline_status_and_end_date(mock_set_create_or_update: MagicMock):
        timeline = baker.make_recipe(
            'utils.facility_designated_operation_timeline', status=FacilityDesignatedOperationTimeline.Statuses.ACTIVE
        )
        new_status = FacilityDesignatedOperationTimeline.Statuses.CLOSED
        end_date = datetime.now(ZoneInfo("UTC"))
        user_guid = uuid4()

        updated_timeline = FacilityDesignatedOperationTimelineService.set_timeline_status_and_end_date(
            user_guid, timeline, new_status, end_date
        )

        assert updated_timeline.status == new_status
        assert updated_timeline.end_date == end_date
        assert updated_timeline.facility_id == timeline.facility_id
        assert updated_timeline.operation_id == timeline.operation_id

        # Verify set_create_or_update is called with the correct user_guid
        mock_set_create_or_update.assert_called_once_with(user_guid)

        # Verify the changes are saved in the database
        timeline.refresh_from_db()
        assert timeline.status == new_status
        assert timeline.end_date == end_date
