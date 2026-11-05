from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
)
from registration.models import OperationDesignatedOperatorTimeline
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user


class OperationDesignatedOperatorTimelineModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('registration.tests.utils.operation_designated_operator_timeline')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operation", "operation", None, None),
            ("operator", "operator", None, None),
            ("start_date", "start date", None, None),
            ("end_date", "end date", None, None),
        ]


class OperationDesignatedOperatorTimelineRlsTest(BaseTestCase):

    def test_operation_designated_operator_timeline_rls_industry_user(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        approved_operation = make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        other_operator = make_recipe('registration.tests.utils.operator')
        other_operation = make_recipe('registration.tests.utils.operation', operator=other_operator)
        other_timeline = make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=other_operator,
            operation=other_operation,
        )

        def select_function(cursor):
            OperationDesignatedOperatorTimeline.objects.get(id=other_timeline.id)

        def insert_function(cursor):
            OperationDesignatedOperatorTimeline.objects.create(
                operator=approved_user_operator.operator,
                operation=approved_operation,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO erc.operation_designated_operator_timeline(operator_id, operation_id)
                    VALUES(%s, %s)
                """,
                (
                    other_operator.id,
                    approved_operation.id,
                ),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            OperationDesignatedOperatorTimeline,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            forbidden_select_function=None,
            forbidden_insert_function=forbidden_insert_function,
        )

    def test_operation_designated_operator_timeline_rls_cas_user(self):
        operator = make_recipe('registration.tests.utils.operator')
        operation = make_recipe('registration.tests.utils.operation', operator=operator)
        test_quantity = 2
        tline = make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
        )
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
        )

        def select_function(cursor):
            assert OperationDesignatedOperatorTimeline.objects.count() == test_quantity

        def insert_function(cursor):
            OperationDesignatedOperatorTimeline.objects.create(operation=operation, operator=operator)

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."operation_designated_operator_timeline"
                    SET end_date = now()
                    WHERE id = %s
                """,
                (tline.id,),
            )
            return cursor.rowcount

        assert_policies_for_cas_roles(
            OperationDesignatedOperatorTimeline,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )
