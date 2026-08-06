from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report import Report
from reporting.tests.utils.bakers import report_baker, reporting_year_baker
from model_bakery.baker import make_recipe
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user


class ReportTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operator", "operator", None, None),
            ("operation", "operation", None, None),
            ("reporting_year", "reporting year", None, None),
            ("report_versions", "report version", None, 0),
            ("compliance_report", "compliance report", None, None),
        ]


class ReportRlsTest(BaseTestCase):

    def test_report_rls_industry_user(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        operation = make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            operation=operation,
            start_date='2009-01-01',
            end_date='2012-12-31',
        )
        reporting_year_baker(reporting_year=2009)
        reporting_year_2010 = reporting_year_baker(reporting_year=2010)
        reporting_year_2012 = reporting_year_baker(reporting_year=2012)
        # Outside bounds of access
        reporting_year_2013 = reporting_year_baker(reporting_year=2013)
        reporting_year_2014 = reporting_year_baker(reporting_year=2014)

        # 2010 & 2011 reports - Within access bounds
        report_2010 = report_baker(
            operation=operation, operator=approved_user_operator.operator, reporting_year=reporting_year_2010
        )
        # 2013 report - Outside bounds of
        report_2013 = report_baker(
            operation=operation, operator=approved_user_operator.operator, reporting_year=reporting_year_2013
        )

        def select_function(cursor):
            Report.objects.get(reporting_year_id=2010)

        def forbidden_select_function(cursor):
            Report.objects.get(reporting_year_id=2013)

        def insert_function(cursor):
            Report.objects.create(
                operation=operation,
                operator=approved_user_operator.operator,
                reporting_year=reporting_year_2012,
            )

        def forbidden_insert_function(cursor):
            Report.objects.create(
                operation=operation,
                operator=approved_user_operator.operator,
                reporting_year=reporting_year_2014,
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report"
                    SET reporting_year_id = %s
                    WHERE id = %s
                """,
                (2009, report_2010.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report"
                    SET reporting_year_id = %s
                    WHERE id = %s
                """,
                (2009, report_2013.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            report_2010.delete()

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            report_2013.delete()

        print('SELECT FUNCTION INSIDE: ', select_function)
        assert_policies_for_industry_user(
            Report,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_report_rls_cas_user(self):
        report_baker(_quantity=5)

        def select_function(cursor, i):
            assert Report.objects.count() == 5

        assert_policies_for_cas_roles(
            Report,
            select_function=select_function,
        )
