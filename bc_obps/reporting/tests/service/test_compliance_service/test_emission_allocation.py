from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import TestCase
from model_bakery.baker import make_recipe
from registration.models.regulated_product import RegulatedProduct
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_product import ReportProduct
from reporting.service.compliance_service.emission_allocation import (
    get_allocated_emissions_by_report_product_emission_category,
    get_emissions_from_only_funny_category_13,
    get_fog_emissions,
    get_reporting_only_allocated,
)


class TestEmissionAllocation(TestCase):

    def test_get_allocated_emissions_by_report_product_emission_category(self):
        ## SETUP ##
        emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
        )
        allocation_1 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(pk=1),
            allocated_quantity=Decimal("1000.0001"),
        )
        allocation_2 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(pk=1),
            report_product=allocation_1.report_product,
            allocated_quantity=Decimal("2000.0002"),
        )
        allocation_3 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(pk=3),
            allocated_quantity=Decimal("6000.0006"),
        )
        allocation_4 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=emission_allocation.report_version,
            emission_category=EmissionCategory.objects.get(pk=12),
            report_product=allocation_3.report_product,
            allocated_quantity=Decimal("500.0005"),
        )

        ## TESTS ##
        allocated_to_flaring_for_test = get_allocated_emissions_by_report_product_emission_category(
            allocation_1.report_version_id, allocation_1.report_product.product_id, [1]
        )
        allocated_to_industrial_for_test = get_allocated_emissions_by_report_product_emission_category(
            allocation_3.report_version_id, allocation_3.report_product.product_id, [3]
        )
        allocated_to_excluded_non_biomass_for_test = get_allocated_emissions_by_report_product_emission_category(
            allocation_4.report_version_id, allocation_4.report_product.product_id, [12]
        )
        assert allocated_to_flaring_for_test == allocation_1.allocated_quantity + allocation_2.allocated_quantity
        assert allocated_to_industrial_for_test == allocation_3.allocated_quantity
        assert allocated_to_excluded_non_biomass_for_test == allocation_4.allocated_quantity

    @patch(
        "reporting.service.compliance_service.emission_allocation.get_allocated_emissions_by_report_product_emission_category"
    )
    def test_get_reporting_only_allocated_return_the_total_for_reporting_only_categories(
        self, mock_get_allocated_emissions: MagicMock
    ):
        get_reporting_only_allocated(1234, 5678)
        mock_get_allocated_emissions.assert_called_once_with(1234, 5678, [10, 11, 12, 2, 7])

    def test_get_reporting_only_allocated(self):
        ## SETUP ##
        allocation_1 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            emission_category=EmissionCategory.objects.get(pk=1),
            allocated_quantity=Decimal("1000.0001"),
            report_product__product__is_regulated=True,
        )
        emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=allocation_1.report_version,
        )
        allocation_2 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=emission_allocation,
            report_version=allocation_1.report_version,
            report_product=allocation_1.report_product,
            emission_category=EmissionCategory.objects.get(pk=2),
            allocated_quantity=Decimal("2000.0002"),
        )
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=emission_allocation,
            report_version=allocation_1.report_version,
            report_product=allocation_1.report_product,
            emission_category=EmissionCategory.objects.get(pk=3),
            allocated_quantity=Decimal("6000.0006"),
        )
        allocation_4 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=emission_allocation,
            report_version=allocation_1.report_version,
            report_product=allocation_1.report_product,
            emission_category=EmissionCategory.objects.get(pk=12),
            allocated_quantity=Decimal("500.0005"),
        )

        ## TESTS ##
        # Correctly aggregates reporting-only emissions
        reporting_only_for_test = get_reporting_only_allocated(
            allocation_1.report_version, allocation_1.report_product.product_id
        )
        assert reporting_only_for_test == allocation_2.allocated_quantity + allocation_4.allocated_quantity

        fog_product_id = RegulatedProduct.objects.get(
            name="Fat, oil and grease collection, refining and storage",
            is_regulated=False,
        ).id

        # Add a fog product
        fog_product_allocation = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=emission_allocation,
            report_version=allocation_1.report_version,
            emission_category=EmissionCategory.objects.get(pk=1),
            allocated_quantity=Decimal("12.0"),
        )
        ReportProduct.objects.filter(pk=fog_product_allocation.report_product_id).update(product_id=fog_product_id)

        # Correctly aggregates reporting-only emissions when there is a fog product
        # (doesn't take it into account at the product level)
        reporting_only_with_fog_for_test = get_reporting_only_allocated(
            allocation_1.report_version, allocation_1.report_product.product_id
        )
        assert reporting_only_with_fog_for_test == allocation_2.allocated_quantity + allocation_4.allocated_quantity

        refineries_line_tracing_id = RegulatedProduct.objects.get(name="Refineries line tracing", is_regulated=False).id

        # Add another unregulated product
        unregulated_product_allocation = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=emission_allocation,
            report_version=allocation_1.report_version,
            emission_category=EmissionCategory.objects.get(pk=1),
            allocated_quantity=Decimal("12.0"),
        )
        ReportProduct.objects.filter(pk=unregulated_product_allocation.report_product_id).update(
            product_id=refineries_line_tracing_id
        )

        # Correctly aggregates reporting-only emissions when there are multiple unregulated products
        # (doesn't take them into account at the product level)
        reporting_only_with_unregulated_for_test = get_reporting_only_allocated(
            allocation_1.report_version, allocation_1.report_product.product_id
        )

        assert (
            reporting_only_with_unregulated_for_test
            == allocation_2.allocated_quantity + allocation_4.allocated_quantity
        )

    def test_get_from_funny_category_only_counts_the_non_overlapping_ones(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        # Regulated emission
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=report_version,
            emission_categories={EmissionCategory.objects.get(pk=1)},
            json_data={"equivalentEmission": 1000.0001},
        ),

        # Funny emission to not double-count
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=report_version,
            emission_categories={
                EmissionCategory.objects.get(pk=1),
                EmissionCategory.objects.get(pk=10),
                EmissionCategory.objects.get(pk=13),
            },
            json_data={"equivalentEmission": 2000.0002},
        ),

        # Funny emission to be added at the end of the compliance calculation
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=report_version,
            emission_categories={EmissionCategory.objects.get(pk=1), EmissionCategory.objects.get(pk=13)},
            json_data={"equivalentEmission": 3000.0003},
        )
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=report_version,
            emission_categories={EmissionCategory.objects.get(pk=4), EmissionCategory.objects.get(pk=13)},
            json_data={"equivalentEmission": 3},
        )

        allocated_emissions_to_unregulated_products = get_emissions_from_only_funny_category_13(report_version.id)
        assert allocated_emissions_to_unregulated_products == Decimal("3003.0003")

    def test_get_fog(self):
        report_version = make_recipe("reporting.tests.utils.report_version")

        # With reporting only category, ignored by the fog adjustment
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            emission_category=EmissionCategory.objects.get(pk=7),
            allocated_quantity=Decimal('10'),
            report_product__product=RegulatedProduct.objects.get(
                name="Fat, oil and grease collection, refining and storage"
            ),
            report_version=report_version,
            report_product__report_version=report_version,
        )

        # To be added the fog adjustment at the end of the compliance calculation
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            emission_category=EmissionCategory.objects.get(pk=1),
            allocated_quantity=Decimal('20'),
            report_product__product=RegulatedProduct.objects.get(
                name="Fat, oil and grease collection, refining and storage"
            ),
            report_version=report_version,
            report_product__report_version=report_version,
        )
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            emission_category=EmissionCategory.objects.get(pk=6),
            allocated_quantity=Decimal('2'),
            report_product__product=RegulatedProduct.objects.get(
                name="Fat, oil and grease collection, refining and storage"
            ),
            report_version=report_version,
            report_product__report_version=report_version,
        )

        fog_allocated_emissions = get_fog_emissions(report_version.id)
        assert fog_allocated_emissions == Decimal("22")
