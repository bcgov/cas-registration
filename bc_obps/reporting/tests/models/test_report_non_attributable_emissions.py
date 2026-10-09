from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportNonAttributableEmissions, GasType, EmissionCategory
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery import baker
from model_bakery.baker import make_recipe


class ReportNonAttributableEmissionsModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.emission_category = EmissionCategory.objects.create(category_name="Default Category", category_type="basic")
        cls.gas_type = GasType.objects.create(
            name="Default Gas", chemical_formula="H2O", cas_number="124-38-9", gwp=100
        )
        cls.test_object = ReportNonAttributableEmissions.objects.create(
            activity="activity",
            source_type="source_type",
            report_version=report_version_baker(report_operation=None),
            emission_category=cls.emission_category,
            facility_report=baker.make_recipe("reporting.tests.utils.facility_report"),
        )
        cls.test_object.gas_type.add(cls.gas_type)
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility_report", "facility report", None, None),
            ("activity", "activity", None, None),
            ("source_type", "source type", None, None),
            ("gas_type", "gas type", None, None),
            ("emission_category", "emission category", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_non_attributable_emissions",
            str_field_to_update="source_type",
        )


class ReportNonAttributableEmissionsRlsTest(BaseTestCase):

    def test_report_non_attributable_emissions_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='facility_report')

        # ReportNonAttributableEmissions Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportNonAttributableEmissions:immutable_report_version"):
            report_non_attributable_emissions_2010_submitted = make_recipe(
                'reporting.tests.utils.report_non_attributable_emissions',
                report_version=t.report_version_2010_submitted,
            )
        report_non_attributable_emissions_2010_draft = make_recipe(
            'reporting.tests.utils.report_non_attributable_emissions', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_non_attributable_emissions_2013_draft = make_recipe(
            'reporting.tests.utils.report_non_attributable_emissions', report_version=t.report_version_2013_draft
        )

        test_emission_category = make_recipe('reporting.tests.utils.emission_category')

        def select_function(cursor):
            ReportNonAttributableEmissions.objects.get(id=report_non_attributable_emissions_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportNonAttributableEmissions.objects.get(id=report_non_attributable_emissions_2013_draft.id)

        def insert_function(cursor):
            ReportNonAttributableEmissions.objects.create(
                report_version=t.report_version_2010_draft,
                facility_report=t.parent_object_2010_draft,
                emission_category=test_emission_category,
                activity='asdf',
                source_type='asdf',
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_non_attributable_emissions"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_non_attributable_emissions"
                    SET activity = %s
                    WHERE id = %s
                """,
                ('test', report_non_attributable_emissions_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_non_attributable_emissions"
                    SET activity = %s
                    WHERE id = %s
                """,
                ('test', report_non_attributable_emissions_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_non_attributable_emissions"
                    WHERE id = %s
                """,
                (report_non_attributable_emissions_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_non_attributable_emissions"
                    WHERE id in (%s,%s)
                """,
                (report_non_attributable_emissions_2010_submitted.id, report_non_attributable_emissions_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportNonAttributableEmissions,
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

    def test_report_non_attributable_emissions_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.report_non_attributable_emissions",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportNonAttributableEmissions.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportNonAttributableEmissions,
            select_function=select_function,
        )
