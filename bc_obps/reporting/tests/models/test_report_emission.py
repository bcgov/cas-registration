from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from django.core.exceptions import ValidationError
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.models import ReportEmission
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportEmissionModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe("reporting.tests.utils.report_emission")
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("gas_type", "gas type", None, None),
            ("report_source_type", "report source type", None, None),
            ("report_fuel", "report fuel", None, None),
            ("report_unit", "report unit", None, None),
            ("report_methodology", "report methodology", None, None),
            ("emission_categories", "emission categories", None, 0),
        ]

    def test_cannot_have_unit_and_fuel(self):
        # Valid case: no unit, no fuel
        report_emission = make_recipe(
            "reporting.tests.utils.report_emission",
            report_fuel=None,
            report_unit=None,
        )

        report_fuel = make_recipe(
            "reporting.tests.utils.report_fuel",
            report_source_type=report_emission.report_source_type,
            report_version=report_emission.report_version,
        )

        report_unit = make_recipe(
            "reporting.tests.utils.report_unit",
            report_source_type=report_emission.report_source_type,
            report_version=report_emission.report_version,
        )

        # Valid case: fuel and no unit

        report_emission.report_fuel = report_fuel
        report_emission.save()

        # Valid case: unit and no fuel

        report_emission.report_fuel = None
        report_emission.report_unit = report_unit
        report_emission.save()

        # Error case: both unit and fuel

        with pytest.raises(
            ValidationError,
            match="An emission record must belong to either a fuel, a unit, or none, but not both",
        ):
            report_emission.report_fuel = report_fuel
            report_emission.report_unit = report_unit
            report_emission.save()

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_emission")


class ReportEmissionRlsTest(BaseTestCase):

    def test_report_emission_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='report_source_type')

        # ReportEmission Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportEmission:immutable_report_version"):
            report_emission_2010_submitted = make_recipe(
                'reporting.tests.utils.report_emission',
                report_version=t.report_version_2010_submitted,
            )
        report_emission_2010_draft = make_recipe(
            'reporting.tests.utils.report_emission', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_emission_2013_draft = make_recipe(
            'reporting.tests.utils.report_emission', report_version=t.report_version_2013_draft
        )

        test_gas_type = make_recipe('reporting.tests.utils.gas_type')

        def select_function(cursor):
            ReportEmission.objects.get(id=report_emission_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportEmission.objects.get(id=report_emission_2013_draft.id)

        def insert_function(cursor):
            ReportEmission.objects.create(
                report_version=t.report_version_2010_draft,
                report_source_type=t.parent_object_2010_draft,
                gas_type=test_gas_type,
                json_data={},
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_emission"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_emission"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_emission_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_emission"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_emission_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_emission"
                    WHERE id = %s
                """,
                (report_emission_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_emission"
                    WHERE id in (%s,%s)
                """,
                (report_emission_2010_submitted.id, report_emission_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportEmission,
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

    def test_report_compliance_summary_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.report_emission",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportEmission.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportEmission,
            select_function=select_function,
        )
