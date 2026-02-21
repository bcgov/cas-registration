from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import TestCase
from model_bakery.baker import make_recipe
import pytest
from registration.models.activity import Activity
from registration.models.regulated_product import RegulatedProduct
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_activity import ReportActivity
from reporting.service.compliance_service.industrial_process import (
    BiogenicEmissionsSplit,
    compute_industrial_process_emissions,
    retrieve_pulp_and_paper_biogenic_emissions_split,
)


class TestIndustrialProcess(TestCase):
    """
    Test cases for the industrial process emissions piece of the compliance summary.
    This ensures Naics Regulatory overrides are applied properly when necessary
    """

    def test_retrieve_biogenic_emissions_split_with_missing_report_activity(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        with pytest.raises(
            ReportActivity.DoesNotExist,
            match='Under NAICS code 322112, there must be emissions reported under the "Pulp and Paper production" activity.',
        ):
            retrieve_pulp_and_paper_biogenic_emissions_split(report_version.id)

    def test_retrieve_biogenic_emissions_split_with_utilize_lime_kiln_checked_off(self):
        report_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            activity=Activity.objects.get(slug="pulp_and_paper"),
            json_data={
                "biogenicIndustrialProcessEmissions": {
                    "doesUtilizeLimeRecoveryKiln": False,
                }
            },
        )
        with pytest.raises(
            ValueError,
            match="""Under NAICS code 322112 and with either 'chemical pulp' or 'lime recovered by kiln' products,
                biogenic industrial process emission details must be reported.""",
        ):
            retrieve_pulp_and_paper_biogenic_emissions_split(report_activity.report_version.id)

    def test_retrieve_biogenic_emissions_split_with_bad_data(self):
        report_activity = make_recipe(
            "reporting.tests.utils.report_activity", activity=Activity.objects.get(slug="pulp_and_paper"), json_data={}
        )
        with pytest.raises(
            KeyError,
            match="Biogenic industrial process emissions data: key error at \'biogenicIndustrialProcessEmissions\'",
        ):
            retrieve_pulp_and_paper_biogenic_emissions_split(report_activity.report_version.id)

    def test_retrieve_biogenic_emissions_split_with_not_100_total(self):
        report_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            activity=Activity.objects.get(slug="pulp_and_paper"),
            json_data={
                "biogenicIndustrialProcessEmissions": {
                    "doesUtilizeLimeRecoveryKiln": True,
                    "biogenicEmissionsSplit": {
                        "chemicalPulpPercentage": 38,
                        "limeRecoveredByKilnPercentage": 22,
                    },
                }
            },
        )
        with pytest.raises(ValueError, match='The biogenic emissions split reported must total to 1.'):
            retrieve_pulp_and_paper_biogenic_emissions_split(report_activity.report_version.id)

    def test_retrieve_biogenic_emissions_split_with_good_data(self):
        report_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            activity=Activity.objects.get(slug="pulp_and_paper"),
            json_data={
                "biogenicIndustrialProcessEmissions": {
                    "doesUtilizeLimeRecoveryKiln": True,
                    "biogenicEmissionsSplit": {
                        "chemicalPulpPercentage": 38,
                        "limeRecoveredByKilnPercentage": 62,
                    },
                }
            },
        )
        result = retrieve_pulp_and_paper_biogenic_emissions_split(report_activity.report_version.id)
        assert result == BiogenicEmissionsSplit(Decimal('0.38'), Decimal('0.62'))

    @patch("reporting.service.compliance_service.industrial_process.retrieve_pulp_and_paper_biogenic_emissions_split")
    def test_compute_industrial_process_emissions(self, mock_split_function: MagicMock):
        ## SETUP ##
        # Not pulp and paper
        emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
        )
        product_emission_allocation_no_pnp = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            report_product__report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            allocated_quantity=Decimal("6000.0006"),
        )

        # Pulp and paper
        emission_allocation_pnp = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version__report__operation__naics_code__naics_code='322112',
        )
        product_emission_allocation_chemical_pulp = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation_pnp.report_version,
            report_product__product=RegulatedProduct.objects.get(name="Pulp and paper: chemical pulp"),
            report_product__report_version=emission_allocation_pnp.report_version,
            emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            allocated_quantity=Decimal("1000"),
        )
        product_emission_allocation_lime_recovered_by_kiln = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation_pnp.report_version,
            report_product__product=RegulatedProduct.objects.get(name="Pulp and paper: lime recovered by kiln"),
            report_product__report_version=emission_allocation_pnp.report_version,
            emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            allocated_quantity=Decimal("2000"),
        )
        industrial_and_woody_biomass_emission = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=emission_allocation_pnp.report_version,
            gas_type_id=1,
            json_data={"equivalentEmission": 2500},
        )
        industrial_and_woody_biomass_emission.emission_categories.set([3, 10])
        industrial_only_emission = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=emission_allocation_pnp.report_version,
            gas_type_id=1,
            json_data={"equivalentEmission": 500},
        )
        industrial_only_emission.emission_categories.set([3])

        mock_split_function.return_value = BiogenicEmissionsSplit(
            chemical_pulp_ratio=Decimal('0.2'), lime_recovered_by_kiln_ratio=Decimal('0.8')
        )

        ## TESTS ##
        industrial_process_no_pnp = compute_industrial_process_emissions(
            product_emission_allocation_no_pnp.report_product
        )
        industrial_process_chem_pulp = compute_industrial_process_emissions(
            product_emission_allocation_chemical_pulp.report_product
        )
        industrial_process_lime_recov_by_kiln = compute_industrial_process_emissions(
            product_emission_allocation_lime_recovered_by_kiln.report_product
        )

        # overlapping = 2500
        assert industrial_process_no_pnp == Decimal("6000.0006")
        assert industrial_process_chem_pulp == Decimal(
            "500"
        )  # 1000 - 0.2 * 2500 (total industrial - biogenic split * biogenic industrial)
        assert industrial_process_lime_recov_by_kiln == Decimal(
            "0"
        )  # 2000 - 0.8 * 2500 (total industrial - biogenic split * biogenic industrial)
