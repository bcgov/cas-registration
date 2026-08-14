from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.models import ReportOperationRepresentative
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportOperationRepresentativeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe("reporting.tests.utils.report_operation_representative")
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("representative_name", "representative name", None, None),
            ("selected_for_report", "selected for report", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_operation_representative")


class ReportOperationRepresentativeRlsTest(BaseTestCase):

    def test_report_operation_representative_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup()

        # ReportOperationRepresentative Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportOperationRepresentative:immutable_report_version"):
            report_operation_representative_2010_submitted = make_recipe(
                'reporting.tests.utils.report_operation_representative',
                report_version=t.report_version_2010_submitted,
            )
        report_operation_representative_2010_draft = make_recipe(
            'reporting.tests.utils.report_operation_representative', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_operation_representative_2013_draft = make_recipe(
            'reporting.tests.utils.report_operation_representative', report_version=t.report_version_2013_draft
        )

        def select_function(cursor):
            ReportOperationRepresentative.objects.get(id=report_operation_representative_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportOperationRepresentative.objects.get(id=report_operation_representative_2013_draft.id)

        def insert_function(cursor):
            ReportOperationRepresentative.objects.create(
                report_version=t.report_version_2010_draft, representative_name='Goku'
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_operation_representative"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_operation_representative"
                    SET representative_name = %s
                    WHERE id = %s
                """,
                ('Vegeta', report_operation_representative_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_operation_representative"
                    SET representative_name = %s
                    WHERE id = %s
                """,
                ('Piccolo', report_operation_representative_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_operation_representative"
                    WHERE id = %s
                """,
                (report_operation_representative_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_operation_representative"
                    WHERE id in (%s,%s)
                """,
                (report_operation_representative_2010_submitted.id, report_operation_representative_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportOperationRepresentative,
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

    def test_report_operation_representative_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.report_operation_representative",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportOperationRepresentative.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportOperationRepresentative,
            select_function=select_function,
        )
