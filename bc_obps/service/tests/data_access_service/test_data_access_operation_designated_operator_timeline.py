from registration.models.operation import Operation
from service.data_access_service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineDataAccessService,
)
import pytest
from model_bakery import baker
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from registration.constants import UNAUTHORIZED_MESSAGE

pytestmark = pytest.mark.django_db


class TestDataAccessOperationDesignatedOperatorTimelineService:
    @staticmethod
    def test_unapproved_user_exception():
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
                baker.make_recipe('utils.industry_operator_user')
            )

    @staticmethod
    def test_get_operations_for_industry_user():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')

        # transferred operation - should not be returned
        baker.make_recipe(
            'utils.operation_designated_operator_timeline',
            status=OperationDesignatedOperatorTimeline.Statuses.TRANSFERRED,
            operator=approved_user_operator.operator,
        )

        # closed operations
        baker.make_recipe(
            'utils.operation_designated_operator_timeline',
            status=OperationDesignatedOperatorTimeline.Statuses.CLOSED,
            operator=approved_user_operator.operator,
            _quantity=20,
        )

        # someone else's operations - should not be returned
        baker.make_recipe(
            'utils.operation_designated_operator_timeline',
            status=OperationDesignatedOperatorTimeline.Statuses.CLOSED,
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
            'utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('utils.operation', status=Operation.Statuses.DRAFT),
        )

        # transferred operation
        baker.make_recipe(
            'utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('utils.operation', status=Operation.Statuses.REGISTERED),
            status=OperationDesignatedOperatorTimeline.Statuses.TRANSFERRED,
        )

        # closed operations
        baker.make_recipe(
            'utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('utils.operation', status=Operation.Statuses.REGISTERED),
            status=OperationDesignatedOperatorTimeline.Statuses.CLOSED,
            _quantity=20,
        )

        timeline = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
            baker.make_recipe('utils.cas_admin')
        )

        assert timeline.count() == 21
