from decimal import Decimal
import pytest
from django.core.exceptions import ValidationError
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.models import ReportProductEmissionAllocation
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportProductEmissionAllocationModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")
        emission_category = EmissionCategory.objects.all().first()
        report_product = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )
        report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.OTHER,
            allocation_other_methodology_description="Test description",
        )
        cls.test_object = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=report_emission_allocation,
            report_version=facility_report.report_version,
            report_product=report_product,
            emission_category=emission_category,
            allocated_quantity=Decimal("300.4151"),
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("report_product", "report product", None, None),
            ("emission_category", "emission category", None, None),
            ("report_emission_allocation", "report emission allocation", None, None),
            ("allocated_quantity", "allocated quantity", None, None),
        ]

    def test_allow_null_description_if_methodology_is_not_other(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")

        with pytest.raises(
            ValidationError,
            match="A value for allocation_other_methodology_description must be provided if allocation_methodology is 'Other'",
        ):
            make_recipe(
                "reporting.tests.utils.report_emission_allocation",
                report_version=facility_report.report_version,
                facility_report=facility_report,
                allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.OTHER,
                allocation_other_methodology_description=None,
            )

        # This should not raise
        make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
            allocation_other_methodology_description=None,
        )

    def test_unique_allocation_per_report_product_and_emission_category(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")
        emission_category = EmissionCategory.objects.all().first()
        report_product = make_recipe(
            'reporting.tests.utils.report_product',
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )

        report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
            allocation_other_methodology_description=None,
        )
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=report_emission_allocation,
            report_product=report_product,
            emission_category=emission_category,
            allocated_quantity=Decimal("300.4151"),
        )

        with pytest.raises(
            ValidationError,
            match="Report emission allocation with this Report version and Facility report already exists.",
        ):
            report_emission_allocation = make_recipe(
                "reporting.tests.utils.report_emission_allocation",
                report_version=facility_report.report_version,
                facility_report=facility_report,
                allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
                allocation_other_methodology_description=None,
            )
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_emission_allocation=report_emission_allocation,
                report_version=facility_report.report_version,
                report_product=report_product,
                emission_category=emission_category,
                allocated_quantity=Decimal("123.4321"),
            )

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_product_emission_allocation")


class ReportProductEmissionAllocationRlsTest(BaseTestCase):

    def test_report_product_emission_allocation_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='report_product')

        # ReportProductEmissionAllocation Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportProductEmissionAllocation:immutable_report_version"):
            report_product_emission_allocation_2010_submitted = make_recipe(
                'reporting.tests.utils.report_product_emission_allocation',
                report_version=t.report_version_2010_submitted,
            )
        report_product_emission_allocation_2010_draft = make_recipe(
            'reporting.tests.utils.report_product_emission_allocation', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_product_emission_allocation_2013_draft = make_recipe(
            'reporting.tests.utils.report_product_emission_allocation', report_version=t.report_version_2013_draft
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
        test_report_product_2012_draft = make_recipe(
            'reporting.tests.utils.report_product', report_version=report_version_2012_draft
        )
        test_emission_category = make_recipe('reporting.tests.utils.emission_category')
        test_emission_allocation = make_recipe(
            'reporting.tests.utils.report_emission_allocation',
            report_version=report_version_2012_draft,
            facility_report=test_report_product_2012_draft.facility_report,
        )

        def select_function(cursor):
            ReportProductEmissionAllocation.objects.get(id=report_product_emission_allocation_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportProductEmissionAllocation.objects.get(id=report_product_emission_allocation_2013_draft.id)

        def insert_function(cursor):
            ReportProductEmissionAllocation.objects.create(
                report_version=report_version_2012_draft,
                report_product=test_report_product_2012_draft,
                emission_category=test_emission_category,
                report_emission_allocation=test_emission_allocation,
                allocated_quantity=Decimal('10.00'),
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_product_emission_allocation"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_product_emission_allocation"
                    SET allocated_quantity = %s
                    WHERE id = %s
                """,
                (Decimal('30.00'), report_product_emission_allocation_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_product_emission_allocation"
                    SET allocated_quantity = %s
                    WHERE id = %s
                """,
                (Decimal('30.00'), report_product_emission_allocation_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_product_emission_allocation"
                    WHERE id = %s
                """,
                (report_product_emission_allocation_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_product_emission_allocation"
                    WHERE id in (%s,%s)
                """,
                (
                    report_product_emission_allocation_2010_submitted.id,
                    report_product_emission_allocation_2013_draft.id,
                ),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportProductEmissionAllocation,
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

    def test_report_product_emission_allocation_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
        )
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
        )

        def select_function(cursor):
            assert ReportProductEmissionAllocation.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportProductEmissionAllocation,
            select_function=select_function,
        )
