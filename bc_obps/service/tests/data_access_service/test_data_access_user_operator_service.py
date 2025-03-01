from itertools import cycle

import pytest
from model_bakery import baker
from registration.models import Operator
from registration.models.user_operator import UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessUserOperatorService:
    @staticmethod
    def test_get_admin_user_operator_requests_for_irc_users():
        # Prepare operators
        declined_operator = baker.make_recipe('registration.tests.utils.operator', status=Operator.Statuses.DECLINED)
        approved_operator = baker.make_recipe('registration.tests.utils.operator', status=Operator.Statuses.APPROVED)

        user_operators_with_declined_operator = []
        approved_admin_user_operators = []
        pending_admin_user_operators_for_approved_operator = []
        declined_admin_user_operators = []
        declined_pending_user_operators = []
        pending_user_operators_with_pending_status = []

        # Prepare user operators for various roles and statuses
        # Declined operator with user operators (should be excluded in final result)
        user_operators_with_declined_operator.extend(
            baker.make_recipe(
                'registration.tests.utils.user_operator',
                user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
                role=UserOperator.Roles.ADMIN,
                status=UserOperator.Statuses.PENDING,
                operator=declined_operator,
                _quantity=5,
            )
        )

        # Approved admin user operators (should be included in final result)
        approved_admin_user_operators.extend(
            baker.make_recipe(
                'registration.tests.utils.user_operator',
                user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
                role=UserOperator.Roles.ADMIN,
                status=UserOperator.Statuses.APPROVED,
                _quantity=5,
            )
        )

        # Pending(status) admin user operators for approved operator (should be included in final result)
        pending_admin_user_operators_for_approved_operator.extend(
            baker.make_recipe(
                'registration.tests.utils.user_operator',
                user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
                operator=approved_operator,
                role=UserOperator.Roles.ADMIN,
                status=UserOperator.Statuses.PENDING,
                _quantity=5,
            )
        )

        # Declined admin user operators (should be included in final result)
        declined_admin_user_operators.extend(
            baker.make_recipe(
                'registration.tests.utils.user_operator',
                user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
                role=UserOperator.Roles.ADMIN,
                status=UserOperator.Statuses.DECLINED,
                _quantity=5,
            )
        )

        # Declined pending (role) user operators (should be included in final result only if no approved admin exists)
        declined_pending_user_operators.extend(
            baker.make_recipe(
                'registration.tests.utils.user_operator',
                user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
                role=UserOperator.Roles.PENDING,
                status=UserOperator.Statuses.DECLINED,
                _quantity=5,
            )
        )

        # Pending (role/status) user operators for the approved operator(should be excluded due to approved admin user)
        pending_user_operators_with_pending_status.extend(
            baker.make_recipe(
                'registration.tests.utils.user_operator',
                user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
                role=UserOperator.Roles.PENDING,
                status=UserOperator.Statuses.PENDING,
                operator=approved_operator,
                _quantity=5,
            )
        )

        # Add approved admin user for the approved operator (to prevent showing pending(status) user operators for this operator)
        approved_user_operator_for_approved_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            operator=approved_operator,
        )

        # Run the service method under test
        user_operator_requests = UserOperatorDataAccessService.get_admin_user_operator_requests_for_irc_users()

        # Assertions
        # Assert that the number of user operators returned is valid
        # 5 approved_admin_user_operators +
        # 5 pending_admin_user_operators_for_approved_operator +
        # 5 declined_admin_user_operators +
        # 5 declined_pending_user_operators +
        # 1 approved admin user operator
        expected_valid_count = 21
        assert (
            len(user_operator_requests) == expected_valid_count
        ), f"Expected {expected_valid_count} user operators, but got {len(user_operator_requests)}."

        # Check that user operators with a declined operator are excluded
        for user_operator in user_operators_with_declined_operator:
            assert user_operator not in user_operator_requests

        # Check that approved admin user operators are included
        for user_operator in approved_admin_user_operators:
            assert user_operator in user_operator_requests

        # Check that pending admin user operators are included for approved operator
        for user_operator in pending_admin_user_operators_for_approved_operator:
            assert user_operator in user_operator_requests

        # Check that declined admin user operators are included
        for user_operator in declined_admin_user_operators:
            assert user_operator in user_operator_requests

        # Check that declined pending user operators are included if no approved admin exists
        for user_operator in declined_pending_user_operators:
            assert user_operator in user_operator_requests

        # Check that pending user operators with a pending role are excluded if an approved admin user exists for the operator
        for user_operator in pending_user_operators_with_pending_status:
            assert user_operator not in user_operator_requests

        # Check that the approved admin user operator for the approved operator is included
        assert approved_user_operator_for_approved_operator in user_operator_requests
