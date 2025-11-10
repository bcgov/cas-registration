from django.test import TestCase
from model_bakery.baker import make_recipe, make
import pytest
from reporting.models.report_operation import ReportOperation
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators.report_emission_allocation_validator import (
    validate,
)
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure


@pytest.mark.django_db
class TestReportEmissionAllocationValidator(TestCase):
    FLARING_CATEGORY_ID = 1
    WOODY_BIOMASS_CATEGORY_ID = 10
    EMISSIONS_AMOUNT = 100

    def setUp(self):
        # Arrange: sets up the report elements necessary to allocate emissions
        self.test_infrastructure = TestInfrastructure.build()

        make(
            ReportOperation,
            report_version=self.test_infrastructure.report_version,
            activities=[self.test_infrastructure.activity],
        )

        activity_source_type = self.test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )

        report_activity = self.test_infrastructure.make_report_activity()
        report_source_type = make_recipe(
            "reporting.tests.utils.report_source_type",
            activity_source_type_base_schema=activity_source_type,
            source_type=activity_source_type.source_type,
            report_activity=report_activity,
            report_version=self.test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        report_fuel = make_recipe(
            "reporting.tests.utils.report_fuel",
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )

        report_emission = make_recipe(
            "reporting.tests.utils.report_emission",
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"equivalentEmission": self.EMISSIONS_AMOUNT},
        )

        report_emission.emission_categories.set([self.FLARING_CATEGORY_ID])

        self.report_product = make_recipe(
            "reporting.tests.utils.report_product",
            id=3,
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            product_id=1,  #  "BC-specific refinery complexity throughput"
        )

    def test_no_errors_when_allocations_match_totals(self):
        report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            allocation_methodology="Other",
            allocation_other_methodology_description="test",
        )
        # allocate all emissions
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=report_emission_allocation,
            report_version=self.test_infrastructure.report_version,
            report_product=self.report_product,
            emission_category_id=self.FLARING_CATEGORY_ID,
            allocated_quantity=self.EMISSIONS_AMOUNT,
        )
        result = validate(self.test_infrastructure.report_version)
        assert result == {}

    def test_no_errors_when_allocation_methodology_not_applicable(self):
        report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            allocation_methodology="Not Applicable",
        )
        # allocate only some of the emissions
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=report_emission_allocation,
            report_version=self.test_infrastructure.report_version,
            report_product=self.report_product,
            emission_category_id=self.FLARING_CATEGORY_ID,
            allocated_quantity=self.EMISSIONS_AMOUNT - 10,
        )
        result = validate(self.test_infrastructure.report_version)
        assert result == {}

    def test_errors_when_allocations_do_not_match_totals(self):
        report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            allocation_methodology="Other",
            allocation_other_methodology_description="test",
        )
        # allocate only some of the emissions
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=report_emission_allocation,
            report_version=self.test_infrastructure.report_version,
            report_product=self.report_product,
            emission_category_id=self.FLARING_CATEGORY_ID,
            allocated_quantity=self.EMISSIONS_AMOUNT - 10,
        )
        result = validate(self.test_infrastructure.report_version)
        assert result == {
            f"allocation_mismatch_facility_{self.test_infrastructure.facility_report.facility_id}_category_{self.FLARING_CATEGORY_ID}": ReportValidationError(
                Severity.ERROR,
                f"Emissions allocated for {self.test_infrastructure.facility_report.facility_name} in 'Flaring emissions' category do not match reported emissions. Please correct this issue on the Allocation of Emissions page.",
            )
        }
