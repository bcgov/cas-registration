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
            OperationDesignatedOperatorTimelineDataAccessService.get_operations_for_industry_user(
                baker.make_recipe('utils.industry_user')
            )

    @staticmethod
    def test_get_operations_for_industry_user():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')

        # transferred operation
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

        # someone else's operations
        baker.make_recipe(
            'utils.operation_designated_operator_timeline',
            status=OperationDesignatedOperatorTimeline.Statuses.CLOSED,
            _quantity=5,
        )

        timeline = OperationDesignatedOperatorTimelineDataAccessService.get_operations_for_industry_user(
            approved_user_operator.user
        )

        assert timeline.count() == 20
