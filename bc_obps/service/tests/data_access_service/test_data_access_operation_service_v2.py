import pytest
from registration.models.app_role import AppRole
from registration.models.operation import Operation
from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import operation_baker, user_baker, user_operator_baker
from service.data_access_service.operation_service_v2 import OperationDataAccessServiceV2

pytestmark = pytest.mark.django_db


class TestDataAccessOperationServiceV2:
    @staticmethod
    def test_get_all_operations_for_irc_user():
        operation_baker(_quantity=10)
        cas_admin = user_baker({'app_role': AppRole.objects.get(role_name='cas_admin')})
        assert OperationDataAccessServiceV2.get_all_operations_for_user(cas_admin).count() == 10

    @staticmethod
    def test_get_all_operations_for_industry_user():
        industry_user = user_baker({'app_role': AppRole.objects.get(role_name='industry_user')})
        approved_user_operator = user_operator_baker({"user": industry_user, "status": UserOperator.Statuses.APPROVED})
        operation_baker(
            _quantity=10, operator_id=approved_user_operator.operator.pk
        )  # operations for approved user operator
        operation_baker(_quantity=10)  # random operations
        # Approved user operator for industry user
        users_operations = OperationDataAccessServiceV2.get_all_operations_for_user(industry_user)
        assert users_operations.count() == 10
        assert all([operation.operator_id == approved_user_operator.operator.pk for operation in users_operations])
        assert Operation.objects.count() == 20
