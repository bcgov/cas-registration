import pytest
from django.utils import timezone
from model_bakery import baker
from service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelinePlus,
    OperationDesignatedOperatorTimelineService,
)

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

    @staticmethod
    def test_get_operation_designated_operator_for_reporting_year():

        operation = baker.make_recipe('registration.tests.utils.operation')
        operator1 = baker.make_recipe('registration.tests.utils.operator')
        operator2 = baker.make_recipe('registration.tests.utils.operator')

        timeline1 = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=operator1,
            start_date=timezone.make_aware(timezone.datetime(2024, 6, 1)),
            end_date=timezone.make_aware(timezone.datetime(2025, 5, 31)),
        )
        timeline2 = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=operator2,
            start_date=timezone.make_aware(timezone.datetime(2025, 5, 31)),
            end_date=None,
        )

        # test returns correct result for given reporting years
        result1 = OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
            operation.id, 2024
        )

        assert result1.operation == timeline1.operation
        assert result1.operator == timeline1.operator
        assert result1.start_date == timeline1.start_date
        assert result1.end_date == timeline1.end_date
        assert result1.has_been_transferred is True

        result2 = OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
            operation.id, 2025
        )
        assert result2.operation == timeline2.operation
        assert result2.operator == timeline2.operator
        assert result2.start_date == timeline2.start_date
        assert result2.end_date == timeline2.end_date
        assert result2.has_been_transferred is False

        # test returns None if no timeline found
        result_none = OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
            operation.id, 2023
        )
        assert result_none is None

    @staticmethod
    def test_get_operation_designated_operators_for_reporting_years_returns_matching_timelines():
        operation = baker.make_recipe("registration.tests.utils.operation")
        operator1 = baker.make_recipe("registration.tests.utils.operator")
        operator2 = baker.make_recipe("registration.tests.utils.operator")

        timeline1 = baker.make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=operator1,
            start_date=timezone.make_aware(timezone.datetime(2024, 6, 1)),
            end_date=timezone.make_aware(timezone.datetime(2025, 5, 31)),
        )
        timeline2 = baker.make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=operator2,
            start_date=timezone.make_aware(timezone.datetime(2025, 5, 31)),
            end_date=None,
        )

        result = OperationDesignatedOperatorTimelineService.get_operation_designated_operators_for_reporting_years(
            operation_ids={operation.id},
            min_year=2023,
            max_year=2025,
        )

        assert len(result) == 2
        assert (operation.id, 2023) not in result

        assert result[(operation.id, 2024)] == OperationDesignatedOperatorTimelinePlus(
            operation=timeline1.operation,
            operator=timeline1.operator,
            start_date=timeline1.start_date,
            end_date=timeline1.end_date,
        )

        assert result[(operation.id, 2025)] == OperationDesignatedOperatorTimelinePlus(
            operation=timeline2.operation,
            operator=timeline2.operator,
            start_date=timeline2.start_date,
            end_date=timeline2.end_date,
        )

    @staticmethod
    def test_get_operation_designated_operators_for_reporting_years_returns_empty_when_operation_ids_empty():
        result = OperationDesignatedOperatorTimelineService.get_operation_designated_operators_for_reporting_years(
            operation_ids=set(),
            min_year=2024,
            max_year=2025,
        )

        assert result == {}

    @staticmethod
    def test_get_operation_designated_operators_for_reporting_years_returns_empty_when_year_range_is_empty():
        operation = baker.make_recipe("registration.tests.utils.operation")

        result = OperationDesignatedOperatorTimelineService.get_operation_designated_operators_for_reporting_years(
            operation_ids={operation.id},
            min_year=2025,
            max_year=2024,
        )

        assert result == {}
