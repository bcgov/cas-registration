from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import TestCase
from model_bakery.baker import make_recipe
from registration.models.regulated_product import RegulatedProduct
from reporting.models.emission_category import EmissionCategory
from reporting.service.compliance_service.industrial_process import (
    BiogenicEmissionsSplit,
    compute_industrial_process_emissions,
)


class TestIndustrialProcess(TestCase):
    """
    Test cases for the industrial process emissions piece of the compliance summary.
    This ensures Naics Regulatory overrides are applied properly when necessary
    """

    def test_retrieve_biogenic_emissions_split(self):
        raise NotImplementedError("Test will be implemented when #965 is done")

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
            chemical_pulp_ratio=Decimal('0.2'), lime_recovery_kiln_ratio=Decimal('0.8')
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
