from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
)
from registration.models import FacilityDesignatedOperationTimeline
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user


class FacilityDesignatedOperationTimelineModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('registration.tests.utils.facility_designated_operation_timeline')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operation", "operation", None, None),
            ("facility", "facility", None, None),
            ("start_date", "start date", None, None),
            ("end_date", "end date", None, None),
        ]


class FacilityDesignatedOperationTimelineRlsTest(BaseTestCase):

    def test_facility_designated_operation_timeline_rls_industry_user(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        approved_operation = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status='Draft'
        )
        cannot_delete_operation = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status='Registered'
        )
        approved_facility = make_recipe('registration.tests.utils.facility', operation=approved_operation)
        approved_timeline = make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            operation=approved_operation,
            facility=approved_facility,
        )
        other_operator = make_recipe('registration.tests.utils.operator')
        other_operation = make_recipe('registration.tests.utils.operation', operator=other_operator)
        other_facility = make_recipe('registration.tests.utils.facility', operation=other_operation)
        other_timeline = make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            operation=other_operation,
            facility=other_facility,
        )
        cannot_delete_timeline = other_timeline = make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', operation=cannot_delete_operation
        )

        def select_function(cursor):
            FacilityDesignatedOperationTimeline.objects.get(id=other_timeline.id)

        def insert_function(cursor):
            FacilityDesignatedOperationTimeline.objects.create(
                facility=other_facility,
                operation=approved_operation,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO erc.facility_designated_operation_timeline(facility_id, operation_id)
                    VALUES(%s, %s)
                """,
                (
                    approved_facility.id,
                    other_operation.id,
                ),
            )
            return cursor.rowcount

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."facility_designated_operation_timeline"
                    SET end_date = now()
                    WHERE id = %s
                """,
                (approved_timeline.id,),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."facility_designated_operation_timeline"
                    SET end_date = now()
                    WHERE id = %s
                """,
                (other_timeline.id,),
            )
            return cursor.rowcount

        def delete_function(cursor):
            cursor.execute(
                """
                    DELETE FROM "erc"."facility_designated_operation_timeline"
                    WHERE id = %s
                """,
                (approved_timeline.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                    DELETE FROM "erc"."facility_designated_operation_timeline"
                    WHERE id = %s
                """,
                (cannot_delete_timeline.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            FacilityDesignatedOperationTimeline,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=None,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_facility_designated_operation_timeline_rls_cas_user(self):
        operation = make_recipe('registration.tests.utils.operation')
        facility = make_recipe('registration.tests.utils.facility')
        test_quantity = 2
        tline = make_recipe(
            "registration.tests.utils.facility_designated_operation_timeline",
        )
        make_recipe(
            "registration.tests.utils.facility_designated_operation_timeline",
        )

        def select_function(cursor):
            assert FacilityDesignatedOperationTimeline.objects.count() == test_quantity

        def insert_function(cursor):
            FacilityDesignatedOperationTimeline.objects.create(operation=operation, facility=facility)

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."facility_designated_operation_timeline"
                    SET end_date = now()
                    WHERE id = %s
                """,
                (tline.id,),
            )
            return cursor.rowcount

        assert_policies_for_cas_roles(
            FacilityDesignatedOperationTimeline,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )
