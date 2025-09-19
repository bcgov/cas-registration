from common.tests.utils.helpers import BaseTestCase
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from model_bakery import baker
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


class OptedInOperationDetailModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = OptedInOperationDetail.objects.create()
        cls.field_data = [
            ("id", "ID", None, None),
            ("operation", "operation", None, None),
            ("meets_section_3_emissions_requirements", "meets section 3 emissions requirements", None, None),
            ("meets_electricity_import_operation_criteria", "meets electricity import operation criteria", None, None),
            ("meets_entire_operation_requirements", "meets entire operation requirements", None, None),
            ("meets_section_6_emissions_requirements", "meets section 6 emissions requirements", None, None),
            (
                "meets_naics_code_11_22_562_classification_requirements",
                "meets naics code 11 22 562 classification requirements",
                None,
                None,
            ),
            (
                "meets_producing_gger_schedule_a1_regulated_product",
                "meets producing gger schedule a1 regulated product",
                None,
                None,
            ),
            ("meets_reporting_and_regulated_obligations", "meets reporting and regulated obligations", None, None),
            (
                "meets_notification_to_director_on_criteria_change",
                "meets notification to director on criteria change",
                None,
                None,
            ),
            ("created_at", "created at", None, None),
            ("updated_at", "updated at", None, None),
            ("archived_at", "archived at", None, None),
            ("created_by", "created by", None, None),
            ("updated_by", "updated by", None, None),
            ("archived_by", "archived by", None, None),
        ]


# RLS tests
class TestOptedInOperationDetailRls(BaseTestCase):
    def test_opted_in_operation_detail_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        opted_in_operation_detail = baker.make_recipe('registration.tests.utils.opted_in_operation_detail')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            opted_in_operation=opted_in_operation_detail,
        )

        random_approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        random_opted_in_operation_detail = baker.make_recipe('registration.tests.utils.opted_in_operation_detail')
        random_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=random_approved_user_operator.operator,
            opted_in_operation=random_opted_in_operation_detail,
        )

        assert OptedInOperationDetail.objects.count() == 2  # Two opted_in_operation_details created

        def select_function(cursor):
            assert OptedInOperationDetail.objects.count() == 1

        def insert_function(cursor):
            #   there's no check statement for insert because the detail is created before being assigned to the operation (operation.opted_in_operation = OptedInOperationDetail.objects.create(created_by_id=user_guid))

            cursor.execute(
                """
                    INSERT INTO "erc"."opted_in_operation_detail" (
                        meets_section_3_emissions_requirements
                    ) VALUES (
                       true
                    )
                """
            )
            assert OptedInOperationDetail.objects.filter(meets_section_3_emissions_requirements=True).count() == 1

        def update_function(cursor):
            OptedInOperationDetail.objects.update(meets_electricity_import_operation_criteria=True)
            assert (
                OptedInOperationDetail.objects.filter(meets_electricity_import_operation_criteria=True).count() == 1
            )  # only affected 1

        # brianna fix
        def delete_function(cursor):
            OptedInOperationDetail.objects.all().delete()
            assert OptedInOperationDetail.objects.count() == 1  # only affected 1

        test_policies_for_industry_user(
            OptedInOperationDetail,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
        )

    def test_opted_in_operation_detail_rls_cas_users(self):

        baker.make_recipe(
            'registration.tests.utils.opted_in_operation_detail',
            _quantity=5,
        )

        def select_function(cursor, i):
            assert OptedInOperationDetail.objects.count() == 5

        test_policies_for_cas_roles(
            OptedInOperationDetail,
            select_function=select_function,
        )
