from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report import Report
from reporting.tests.utils.bakers import report_baker, reporting_year_baker
from model_bakery.baker import make_recipe
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user

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
        reporting_year = reporting_year_baker(reporting_year=2012)
        report = report_baker( operation=operation, operator=approved_user_operator.operator, reporting_year=reporting_year)
        number_of_accesible_records = Report.objects.filter(operation=operation).count()

        random_operation = make_recipe('registration.tests.utils.operation')
        random_report = report_baker(operation=random_operation, reporting_year=reporting_year)
        number_of_total_records = Report.objects.count()

        new_operation = make_recipe(
                'registration.tests.utils.operation', operator=approved_user_operator.operator
            )
        new_reporting_year = reporting_year_baker(reporting_year=2042)

        def select_function(cursor):
            # Select the report for the approved user operator and not the random report
            assert Report.objects.count() < number_of_total_records
            assert Report.objects.count() == number_of_accesible_records
            assert Report.objects.filter(operation=random_operation).count() == 0
        def insert_function(cursor):
            # Insert a new report for the approved user operator
            new_report = Report.objects.create(
                operation=new_operation,
                operator=approved_user_operator.operator,
                reporting_year=report.reporting_year,
            )
            number_of_accesible_records_after_insert = number_of_accesible_records + 1
            assert Report.objects.count() == number_of_accesible_records_after_insert
            assert new_report.id is not None
            # Attempt to insert a report that the user is not an operator for
            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "report'
            ):
                Report.objects.create(
                    operation=random_operation,
                    operator=random_report.operator,
                    reporting_year=random_report.reporting_year,
                )

        def update_function(cursor):
            # Update the report for the approved user operator
            report.reporting_year = new_reporting_year
            report.save()
            assert Report.objects.get(id=report.id).reporting_year.reporting_year == new_reporting_year.reporting_year
            # Attempt to update a report that the user should not have access to
            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "report'
            ):
                random_report.reporting_year = new_reporting_year
                random_report.save()

        def delete_function(cursor):
            # Delete the report for the approved user operator
            number_of_deleted_reports, _ = report.delete()
            number_of_accesible_records_after_delete = number_of_accesible_records - number_of_deleted_reports
            assert number_of_deleted_reports > 0
            assert Report.objects.count() == number_of_accesible_records_after_delete

            # Attempt to delete a report that the user should not have access to
            number_of_deleted_reports, _ = random_report.delete()
            assert number_of_deleted_reports == 0
            assert Report.objects.count() == number_of_accesible_records_after_delete

        test_policies_for_industry_user(
            Report,
            approved_user_operator.user,
            select_function,
            insert_function,
            update_function,
            delete_function,
        )

    def test_report_rls_cas_user(self):
        report_baker(_quantity=5)

        def select_function(cursor, i):
            assert Report.objects.count() == 5

        test_policies_for_cas_roles(
            Report,
            select_function=select_function,
        )
