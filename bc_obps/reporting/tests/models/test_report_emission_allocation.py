import pytest
from django.core.exceptions import ValidationError
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe, make
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.models import ReportEmissionAllocation
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportEmissionAllocationModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        cls.test_object = make(
            ReportEmissionAllocation,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology="Other",
            allocation_other_methodology_description="Test description",
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility_report", "facility report", None, None),
            ("allocation_methodology", "allocation methodology", 255, None),
            (
                "allocation_other_methodology_description",
                "allocation other methodology description",
                None,
                None,
            ),
            (
                "reportproductemissionallocation_records",
                "report product emission allocation",
                None,
                0,
            ),
        ]

    def test_allow_null_description_if_methodology_is_not_other(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")

        with pytest.raises(
            ValidationError,
            match="A value for allocation_other_methodology_description must be provided if allocation_methodology is 'Other'",
        ):
            make(
                ReportEmissionAllocation,
                report_version=facility_report.report_version,
                facility_report=facility_report,
                allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.OTHER,
                allocation_other_methodology_description=None,
            )

        make(
            ReportEmissionAllocation,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.NOT_APPLICABLE,
            allocation_other_methodology_description=None,
        )

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_emission_allocation")


class ReportEmissionAllocationRlsTest(BaseTestCase):

    def test_report_emission_allocation_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup('facility_report')

        # ReportEmissionAllocation Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportEmissionAllocation:immutable_report_version"):
            report_emission_allocation_2010_submitted = make_recipe(
                'reporting.tests.utils.report_emission_allocation', report_version=t.report_version_2010_submitted
            )
        report_emission_allocation_2010_draft = make_recipe(
            'reporting.tests.utils.report_emission_allocation', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_emission_allocation_2013_draft = make_recipe(
            'reporting.tests.utils.report_emission_allocation', report_version=t.report_version_2013_draft
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
            ReportEmissionAllocation.objects.get(id=report_emission_allocation_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportEmissionAllocation.objects.get(id=report_emission_allocation_2013_draft.id)

        def insert_function(cursor):
            ReportEmissionAllocation.objects.create(
                report_version=report_version_2012_draft, facility_report=t.parent_object_2010_draft
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_emission_allocation"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_emission_allocation"
                    SET allocation_methodology = %s
                    WHERE id = %s
                """,
                ('OBPS Allocation Calculator', report_emission_allocation_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_emission_allocation"
                    SET allocation_methodology = %s
                    WHERE id = %s
                """,
                ('OBPS Allocation Calculator', report_emission_allocation_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_emission_allocation"
                    WHERE id = %s
                """,
                (report_emission_allocation_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_emission_allocation"
                    WHERE id in (%s,%s)
                """,
                (report_emission_allocation_2010_submitted.id, report_emission_allocation_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportEmissionAllocation,
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

    def test_report_emission_allocation_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportEmissionAllocation.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportEmissionAllocation,
            select_function=select_function,
        )
