from itertools import cycle

import pytest
from model_bakery import baker
from registration.models.user_operator import UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessUserOperatorService:
    @staticmethod
    def test_get_user_operator_requests_for_irc_users():

        # Declined user_operator (should not be included in results)
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.PENDING,
            status=UserOperator.Statuses.DECLINED,
            _quantity=5,
        )

        # Approved admin user operators (should be included in final result)
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )

        # Approved reporter user operators (should be included in final result)
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )

        # Pending user operators (should be included in final result)

        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.PENDING,
            status=UserOperator.Statuses.PENDING,
            _quantity=5,
        )

        # Run the service method under test
        user_operator_requests = UserOperatorDataAccessService.get_user_operator_requests_for_irc_users()

        # Assertions
        expected_valid_count = 15
        assert (
            len(user_operator_requests) == expected_valid_count
        ), f"Expected {expected_valid_count} user operators, but got {len(user_operator_requests)}."
