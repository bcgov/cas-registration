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
        irc_user = baker.make_recipe('utils.irc_user')

        timeline_for_selected_operation = baker.make_recipe(
            'utils.facility_designated_operation_timeline', _quantity=10
        )
        # timeline for random operation's facilities
        baker.make_recipe('utils.facility_designated_operation_timeline', _quantity=10)

        expected_facilities = FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
            irc_user, timeline_for_selected_operation[0].operation.id
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
        irc_user = baker.make_recipe('utils.irc_user')
        facilities = baker.make_recipe('utils.facility', _quantity=10)
        operation = baker.make_recipe('utils.operation')

        for facility in facilities:
            baker.make_recipe('utils.facility_designated_operation_timeline', facility=facility, operation=operation)

        facilities_list = FacilityDesignatedOperationTimelineService.list_timeline_by_operation_id(
            irc_user.user_guid,
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
        irc_user = baker.make_recipe('utils.irc_user')
        facilities = baker.make_recipe('utils.facility', _quantity=10)
        operation = baker.make_recipe('utils.operation')

        for facility in facilities:
            baker.make_recipe('utils.facility_designated_operation_timeline', facility=facility, operation=operation)

        facilities_list = FacilityDesignatedOperationTimelineService.list_timeline_by_operation_id(
            irc_user.user_guid,
            operation.id,
            "facility__created_at",  # default value
            "desc",  # default value
            FacilityDesignatedOperationTimelineFilterSchema(
                facility_bcghg_id=None, facility__name='8', facility__type=None, status=None
            ),
        )
        assert facilities_list.count() == 1
        assert facilities_list.first().facility.name == 'Facility 08'
