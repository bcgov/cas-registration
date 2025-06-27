from registration.models.operation import Operation
from service.data_access_service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineDataAccessService,
)
import pytest
from model_bakery import baker
from registration.constants import UNAUTHORIZED_MESSAGE

pytestmark = pytest.mark.django_db


class TestDataAccessOperationDesignatedOperatorTimelineService:
    @staticmethod
    def test_unapproved_user_exception():
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
                baker.make_recipe('registration.tests.utils.industry_operator_user')
            )

    @staticmethod
    def test_get_operations_for_industry_user():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # simulating a transferred operation - should not be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            end_date="2024-12-25 01:00:00-08",
            operator=approved_user_operator.operator,
        )

        # active, registered operations
        registered_operations = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            _quantity=20,
        )
        for operation in registered_operations:
            baker.make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operation=operation,
                operator=approved_user_operator.operator,
                end_date=None,
            )

        # someone else's operations - should not be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            _quantity=5,
        )

        timeline = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
            approved_user_operator.user
        )

        assert timeline.count() == 20

    @staticmethod
    def test_get_operations_for_internal_user():
        # non-registered operation - should be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                status=Operation.Statuses.DRAFT,
            ),
            end_date=None,
        )

        # transferred operation - should not be returned, has an end date
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                status=Operation.Statuses.REGISTERED,
            ),
            end_date="2024-02-27 01:46:20.789146+00:00",
        )

        # active operations
        registered_operations = baker.make_recipe(
            'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, _quantity=20
        )
        for operation in registered_operations:
            baker.make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operation=operation,
                end_date=None,
            )

        timeline = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
            baker.make_recipe('registration.tests.utils.cas_admin')
        )

        assert timeline.count() == 21

    @staticmethod
    def get_previously_owned_operations_by_operator():

        operator = baker.make_recipe('registration.tests.utils.operator')

        # transferred operation
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe(
                'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, operator=operator
            ),
            end_date="2024-02-27 01:46:20.789146+00:00",
        )

        # active operation - should not be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe(
                'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, operator=operator
            ),
            end_date=None,
        )

        result = OperationDesignatedOperatorTimelineDataAccessService.get_previously_owned_operations_by_operator(
            operator_id=operator.id
        )
        assert result.count() == 1
        assert result.first().end_date == "2024-02-27 01:46:20.789146+00:00"
