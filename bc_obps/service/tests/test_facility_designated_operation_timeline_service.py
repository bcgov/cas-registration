from datetime import datetime
from zoneinfo import ZoneInfo
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models import FacilityDesignatedOperationTimeline
from registration.schema import (
    FacilityDesignatedOperationTimelineFilterSchema,
)
from service.facility_designated_operation_timeline_service import FacilityDesignatedOperationTimelineService
import pytest
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestGetTimeline:
    @staticmethod
    def test_get_timeline_by_operation_id_for_irc_user():
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')

        timeline_for_selected_operation = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', _quantity=10
        )
        # timeline for random operation's facilities
        baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline', _quantity=10)

        expected_facilities = FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
            cas_admin, timeline_for_selected_operation[0].operation.id
        )

        assert expected_facilities.count() == 10

    @staticmethod
    def test_get_timeline_by_operation_id_for_unapproved_user_industry_user():
        industry_user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        facility_designated_operation_timeline = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline'
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
                industry_user, facility_designated_operation_timeline.operation.id
            )

    @staticmethod
    def test_get_timeline_by_operation_id_industry_user():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )
        # user's timeline
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            operation=users_operation,
            _quantity=10,
        )
        # mimic transferred facilities

        # random timeline
        baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline')

        facilities = FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
            approved_user_operator.user, users_operation.id
        )
        # the industry user should only be able to see their one
        assert facilities.count() == 10


class TestListTimeline:
    @staticmethod
    def test_list_timeline_sort():
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=10)
        operation = baker.make_recipe('registration.tests.utils.operation')

        for facility in facilities:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=facility,
                operation=operation,
            )

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
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=10)
        operation = baker.make_recipe('registration.tests.utils.operation')

        for facility in facilities:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=facility,
                operation=operation,
            )

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
        timeline_with_no_end_date = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', end_date=None
        )
        # another timeline for the same facility to make sure it is not returned
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=timeline_with_no_end_date.facility,
        )
        result_found = FacilityDesignatedOperationTimelineService.get_current_timeline(
            timeline_with_no_end_date.operation_id, timeline_with_no_end_date.facility_id
        )
        assert result_found == timeline_with_no_end_date
        timeline_with_end_date = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', end_date=datetime.now(ZoneInfo("UTC"))
        )
        result_not_found = FacilityDesignatedOperationTimelineService.get_current_timeline(
            timeline_with_end_date.operation_id, timeline_with_end_date.facility_id
        )
        assert result_not_found is None

    @staticmethod
    def test_set_timeline_end_date():
        timeline = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
        )
        end_date = datetime.now(ZoneInfo("UTC"))

        updated_timeline = FacilityDesignatedOperationTimelineService.set_timeline_end_date(timeline, end_date)

        assert updated_timeline.end_date == end_date
        assert updated_timeline.facility_id == timeline.facility_id
        assert updated_timeline.operation_id == timeline.operation_id

        # Verify the changes are saved in the database
        timeline.refresh_from_db()
        assert timeline.end_date == end_date
