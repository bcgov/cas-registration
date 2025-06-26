from datetime import datetime
from zoneinfo import ZoneInfo
from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
from model_bakery import baker
import pytest
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
)
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


class OperationDesignatedOperatorTimelineModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = baker.make_recipe('registration.tests.utils.operation_designated_operator_timeline')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operation", "operation", None, None),
            ("operator", "operator", None, None),
            ("start_date", "start date", None, None),
            ("end_date", "end date", None, None),
        ]


# RLS tests
class TestOperationDesignatedOperatorTimelineRls(BaseTestCase):
    def test_operation_designated_operator_timeline_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        operation_2 = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        timeline = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=approved_user_operator.operator,
        )
        random_approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        random_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=random_approved_user_operator.operator
        )
        random_timeline = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=random_approved_user_operator.operator,
            operation=random_operation,
        )

        assert OperationDesignatedOperatorTimeline.objects.count() == 2  # Two records created

        def select_function(cursor):
            assert OperationDesignatedOperatorTimeline.objects.count() == 1

        def insert_function(cursor):
            new_timeline = OperationDesignatedOperatorTimeline.objects.create(
                operator=approved_user_operator.operator,
                operation=operation_2,
            )
            assert OperationDesignatedOperatorTimeline.objects.filter(operation_id=new_timeline.operation_id).exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "operation_designated_operator_timeline',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."operation_designated_operator_timeline" (
                        operation_id, operator_id
                    ) VALUES (
                        %s,
                        %s
                    )
                """,
                    (random_operation.id, random_approved_user_operator.operator.id),
                )

        test_policies_for_industry_user(
            OperationDesignatedOperatorTimeline,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
        )

    def test_operation_designated_operator_timeline_rls_cas_users(self):

        baker.make_recipe('registration.tests.utils.operation_designated_operator_timeline', _quantity=5)
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=operator)

        def select_function(cursor, i):
            assert OperationDesignatedOperatorTimeline.objects.count() == 5

        def insert_function(cursor, i):
            new_timeline = OperationDesignatedOperatorTimeline.objects.create(
                operator=operator,
                operation=operation,
            )
            assert OperationDesignatedOperatorTimeline.objects.filter(operation_id=new_timeline.operation.id).exists()

        def update_function(cursor, i):

            end_date = datetime(1995, 1, 15, 12, 30, tzinfo=ZoneInfo("UTC"))
            updated_timeline = OperationDesignatedOperatorTimeline.objects.first()
            updated_timeline.end_date = end_date
            updated_timeline.save()
            assert OperationDesignatedOperatorTimeline.objects.filter(end_date=end_date).count() == 1

        test_policies_for_cas_roles(
            OperationDesignatedOperatorTimeline,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )
