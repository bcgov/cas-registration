from django.utils import timezone
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.facility import Facility
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
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

        # 10 active facilities for selected operation
        facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=10)
        selected_operation = baker.make_recipe('registration.tests.utils.operation')
        for facility in facilities:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=facility,
                end_date=None,
                operation=selected_operation,
            )

        # timelines for 10 active facilities for other random operation
        for _ in range(10):
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=baker.make_recipe('registration.tests.utils.facility'),
                end_date=None,
            )

        expected_facilities = FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
            cas_admin, selected_operation.id
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
        for _ in range(10):
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                operation=users_operation,
                facility=baker.make_recipe('registration.tests.utils.facility', operation=users_operation),
                end_date=None,
            )
        # mimic transferred facilities
        # end_date will be not None, so system infers that these facilities have been transferred
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', operation=users_operation, _quantity=5
        )

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
                end_date=None,
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
                end_date=None,
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
            'registration.tests.utils.facility_designated_operation_timeline', end_date=timezone.now()
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
        end_date = timezone.now()

        updated_timeline = FacilityDesignatedOperationTimelineService.set_timeline_end_date(timeline, end_date)

        assert updated_timeline.end_date == end_date
        assert updated_timeline.facility_id == timeline.facility_id
        assert updated_timeline.operation_id == timeline.operation_id

        # Verify the changes are saved in the database
        timeline.refresh_from_db()
        assert timeline.end_date == end_date


class TestDeleteFacilitiesByOperationId:
    @staticmethod
    def test_delete_facilities_by_operation_id_for_unapproved_user():
        industry_user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        operation = baker.make_recipe('registration.tests.utils.operation')

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id(
                industry_user.user_guid, operation.id
            )

    @staticmethod
    def test_delete_facilities_by_operation_id():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        random_operation = baker.make_recipe('registration.tests.utils.operation')
        # 10 facilities for operation
        facilities = baker.make_recipe('registration.tests.utils.facility', operation=operation, _quantity=10)
        for facility in facilities:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=facility,
                end_date=None,
                operation=operation,
            )

        # timelines for 5 active facilities for other random operation
        for _ in range(5):
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=baker.make_recipe('registration.tests.utils.facility', operation=random_operation),
                end_date=None,
                operation=random_operation,
            )

        FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id(
            approved_user_operator.user.user_guid, operation.id
        )

        # Verify that the facilities have been deleted
        assert FacilityDesignatedOperationTimeline.objects.filter(operation_id=operation.id).count() == 0
        assert Facility.objects.filter(operation_id=operation.id).count() == 0
        # Verify that the other facilities are still present and attached to  random operation
        assert FacilityDesignatedOperationTimeline.objects.count() == 5
        assert Facility.objects.count() == 5
        assert Facility.objects.filter(operation_id=random_operation.id).count() == 5
