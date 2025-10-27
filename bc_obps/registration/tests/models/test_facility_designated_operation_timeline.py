from datetime import datetime
from zoneinfo import ZoneInfo
from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
from model_bakery import baker
import pytest
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


# RLS tests
class TestFacilityDesignatedOperationTimelineRls(BaseTestCase):
    def test_facility_designated_operation_timeline_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        timeline = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', operation=operation
        )

        random_operation = baker.make_recipe('registration.tests.utils.operation')
        random_facility = baker.make_recipe('registration.tests.utils.facility', operation=random_operation)
        random_timeline = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=random_facility,
            operation=random_operation,
        )

        assert FacilityDesignatedOperationTimeline.objects.count() == 2  # Two operations created

        def select_function(cursor):
            assert FacilityDesignatedOperationTimeline.objects.count() == 1

        def insert_function(cursor):
            new_timeline = FacilityDesignatedOperationTimeline.objects.create(
                operation=operation,
                facility=baker.make_recipe('registration.tests.utils.facility', operation=operation),
            )
            assert FacilityDesignatedOperationTimeline.objects.filter(operation_id=new_timeline.operation_id).exists()

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "facility_designated_operation_timeline',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."facility_designated_operation_timeline" (
                        facility_id,
                        operation_id
                    ) VALUES (
                        %s,
                        %s
                    )
                """,
                    (random_facility.id, random_operation.id),
                )

        def delete_function(cursor):
            FacilityDesignatedOperationTimeline.objects.delete()
            assert FacilityDesignatedOperationTimeline.objects.count() == 1  # only deleted 1/2

        test_policies_for_industry_user(
            FacilityDesignatedOperationTimeline,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            delete_function=delete_function,
        )

    def test_facility_designated_operation_timeline_rls_cas_users(self):

        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            _quantity=5,
        )
        operation = baker.make_recipe('registration.tests.utils.operation')
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)

        def select_function(cursor, i):
            assert FacilityDesignatedOperationTimeline.objects.count() == 5

        def insert_function(cursor, i):
            new_timeline = FacilityDesignatedOperationTimeline.objects.create(
                operation=operation,
                facility=facility,
            )
            assert FacilityDesignatedOperationTimeline.objects.filter(operation_id=new_timeline.operation.id).exists()

        def update_function(cursor, i):

            updated_timeline = FacilityDesignatedOperationTimeline.objects.first()
            updated_timeline.start_date = datetime.now(ZoneInfo("UTC"))
            updated_timeline.save()
            assert FacilityDesignatedOperationTimeline.objects.filter(start_date__isnull=False).count() == 1

        test_policies_for_cas_roles(
            FacilityDesignatedOperationTimeline,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
        )
