from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.bakers import report_person_responsible_baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.models import ReportPersonResponsible
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery.baker import make_recipe


class ReportPersonResponsibleTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_person_responsible_baker()
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("contact", "contact", None, None),
            ("first_name", "first name", None, None),
            ("last_name", "last name", None, None),
            ("position_title", "position title", None, None),
            ("email", "email", None, None),
            ("phone_number", "phone number", None, None),
            ("street_address", "street address", None, None),
            ("municipality", "municipality", None, None),
            ("province", "province", None, None),
            ("postal_code", "postal code", None, None),
            ("business_role", "business role", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_person_responsible")


class ReportPersonResponsibleRlsTest(BaseTestCase):

    def test_report_person_responsible_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup()

        # ReportPersonResponsible Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportPersonResponsible:immutable_report_version"):
            report_person_responsible_2010_submitted = make_recipe(
                'reporting.tests.utils.report_person_responsible',
                report_version=t.report_version_2010_submitted,
            )
        report_person_responsible_2010_draft = make_recipe(
            'reporting.tests.utils.report_person_responsible', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_person_responsible_2013_draft = make_recipe(
            'reporting.tests.utils.report_person_responsible', report_version=t.report_version_2013_draft
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
            ReportPersonResponsible.objects.get(id=report_person_responsible_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportPersonResponsible.objects.get(id=report_person_responsible_2013_draft.id)

        def insert_function(cursor):
            ReportPersonResponsible.objects.create(
                report_version=report_version_2012_draft,
                street_address='asdf',
                municipality='asdf',
                province='asdf',
                postal_code='asdf',
                business_role='asdf',
                first_name='asdf',
                last_name='asdf',
                position_title='asdf',
                email='asdf@test.test',
                phone_number='',
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_person_responsible"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_person_responsible"
                    SET first_name = %s
                    WHERE id = %s
                """,
                ('Goku', report_person_responsible_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_person_responsible"
                    SET first_name = %s
                    WHERE id = %s
                """,
                ('Vegeta', report_person_responsible_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_person_responsible"
                    WHERE id = %s
                """,
                (report_person_responsible_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_person_responsible"
                    WHERE id in (%s,%s)
                """,
                (report_person_responsible_2010_submitted.id, report_person_responsible_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportPersonResponsible,
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

    def test_report_person_responsible_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_person_responsible",
        )
        make_recipe(
            "reporting.tests.utils.report_person_responsible",
        )

        def select_function(cursor):
            assert ReportPersonResponsible.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportPersonResponsible,
            select_function=select_function,
        )
