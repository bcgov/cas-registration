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

        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            _quantity=20,
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
        # non-registered operation - should not be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.DRAFT),
        )

        # transferred operation
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED),
        )

        # closed operations
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED),
            _quantity=20,
        )

        timeline = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
            baker.make_recipe('registration.tests.utils.cas_admin')
        )

        assert timeline.count() == 21
