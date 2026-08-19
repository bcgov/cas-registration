from common.tests.utils.helpers import BaseTestCase
from registration.models import Activity, RegulatedProduct, Operation
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportOperation
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery.baker import make_recipe


class ReportOperationModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportOperation.objects.create(
            operator_legal_name="Legal Name",
            operator_trade_name="Trade Name",
            operation_name="Operation Name",
            operation_type=Operation.Types.SFO,
            operation_bcghgid="A fake BC GHG ID",
            bc_obps_regulated_operation_id="123456789",
            registration_purpose="OBPS Regulated Operation",
            report_version=report_version_baker(report_operation=None),
        )
        cls.test_object.activities.add(Activity.objects.first())
        cls.test_object.regulated_products.add(RegulatedProduct.objects.first())
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("operator_legal_name", "operator legal name", 1000, None),
            ("operator_trade_name", "operator trade name", 1000, None),
            ("operation_name", "operation name", 1000, None),
            ("operation_type", "operation type", 1000, None),
            ("operation_bcghgid", "operation bcghgid", 1000, None),
            (
                "bc_obps_regulated_operation_id",
                "bc obps regulated operation id",
                255,
                None,
            ),
            ("activities", "activities", None, 1),
            ("regulated_products", "regulated products", None, 1),
            ("registration_purpose", "registration purpose", 1000, None),
            ("operation_opted_out_final_reporting_year", "operation opted out final reporting year", None, None),
            ("naics_code", "naics code", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_operation")


class ReportOperationRlsTest(BaseTestCase):

    def test_report_operation_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup()

        # ReportOperation Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportOperation:immutable_report_version"):
            report_operation_2010_submitted = make_recipe(
                'reporting.tests.utils.report_operation',
                report_version=t.report_version_2010_submitted,
            )
        report_operation_2010_draft = make_recipe(
            'reporting.tests.utils.report_operation', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_operation_2013_draft = make_recipe(
            'reporting.tests.utils.report_operation', report_version=t.report_version_2013_draft
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
            ReportOperation.objects.get(id=report_operation_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportOperation.objects.get(id=report_operation_2013_draft.id)

        def insert_function(cursor):
            ReportOperation.objects.create(
                report_version=report_version_2012_draft,
                operator_legal_name='asdf',
                operation_name='fdsa',
                operation_type='SFO',
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_operation"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_operation"
                    SET operation_name = %s
                    WHERE id = %s
                """,
                ('test}', report_operation_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_operation"
                    SET operation_name = %s
                    WHERE id = %s
                """,
                ('test2', report_operation_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_operation"
                    WHERE id = %s
                """,
                (report_operation_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_operation"
                    WHERE id in (%s,%s)
                """,
                (report_operation_2010_submitted.id, report_operation_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportOperation,
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

    def test_report_operation_rls_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_operation",
        )
        make_recipe(
            "reporting.tests.utils.report_operation",
        )

        def select_function(cursor):
            assert ReportOperation.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportOperation,
            select_function=select_function,
        )
