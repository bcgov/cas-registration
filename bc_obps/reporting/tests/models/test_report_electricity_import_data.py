from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe

from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.models import ReportElectricityImportData
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportElectricityImportDataTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe("reporting.tests.utils.electricity_import_data")
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("import_specified_electricity", "import specified electricity", None, None),
            ("import_specified_emissions", "import specified emissions", None, None),
            ("import_unspecified_electricity", "import unspecified electricity", None, None),
            ("import_unspecified_emissions", "import unspecified emissions", None, None),
            ("export_specified_electricity", "export specified electricity", None, None),
            ("export_specified_emissions", "export specified emissions", None, None),
            ("export_unspecified_electricity", "export unspecified electricity", None, None),
            ("export_unspecified_emissions", "export unspecified emissions", None, None),
            ("canadian_entitlement_electricity", "canadian entitlement electricity", None, None),
            ("canadian_entitlement_emissions", "canadian entitlement emissions", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.electricity_import_data")


class ReportElectricityImportDataRlsTest(BaseTestCase):

    def test_report_electricity_import_data_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup()

        # ReportElectricityImportData Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportElectricityImportData:immutable_report_version"):
            report_electricity_import_data_2010_submitted = make_recipe(
                'reporting.tests.utils.electricity_import_data', report_version=t.report_version_2010_submitted
            )
        report_electricity_import_data_2010_draft = make_recipe(
            'reporting.tests.utils.electricity_import_data', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_electricity_import_data_2013_draft = make_recipe(
            'reporting.tests.utils.electricity_import_data', report_version=t.report_version_2013_draft
        )

        # Additional report_version needed for insert test: 2012 - Within access bounds
        reporting_year_2012 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2012)
        report_2012 = make_recipe(
            'reporting.tests.utils.report',
            operation=t.report_version_2010_submitted.report.operation,
            operator=t.report_version_2010_submitted.report.operator,
            reporting_year=reporting_year_2012,
        )
        report_version_2012_draft = make_recipe(
            'reporting.tests.utils.report_version', report=report_2012, status='Draft'
        )

        def select_function(cursor):
            ReportElectricityImportData.objects.get(id=report_electricity_import_data_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportElectricityImportData.objects.get(id=report_electricity_import_data_2013_draft.id)

        def insert_function(cursor):
            ReportElectricityImportData.objects.create(
                report_version=report_version_2012_draft,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_electricity_import_data"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_electricity_import_data"
                    SET canadian_entitlement_emissions = %s
                    WHERE id = %s
                """,
                (20.00, report_electricity_import_data_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_electricity_import_data"
                    SET canadian_entitlement_emissions = %s
                    WHERE id = %s
                """,
                (20.00, report_electricity_import_data_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_electricity_import_data"
                    WHERE id = %s
                """,
                (report_electricity_import_data_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_electricity_import_data"
                    WHERE id in (%s,%s)
                """,
                (report_electricity_import_data_2010_submitted.id, report_electricity_import_data_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportElectricityImportData,
            t.approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_report_electricity_import_data_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.electricity_import_data",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportElectricityImportData.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportElectricityImportData,
            select_function=select_function,
        )
