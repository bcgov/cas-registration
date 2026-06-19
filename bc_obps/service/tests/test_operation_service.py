from model_bakery import baker
import pytest
from django.test import TestCase
from service.operation_service import OperationService

pytestmark = pytest.mark.django_db


class TestOperationService(TestCase):
    def test_get_valid_regulated_products_for_operation(self):
        """
        Test that the get_valid_regulated_products_for_operation method returns only the regulated products that are valid for the operation's reporting year.
        """
        report_year = 2024
        valid_products = baker.make_recipe(
            "reporting.tests.utils.regulated_product",
            valid_from=f'{report_year - 1}-01-01',
            valid_to='2099-12-31',
            _quantity=2,
        )
        invalid_products = baker.make_recipe(
            "reporting.tests.utils.regulated_product", valid_from='2099-01-01', valid_to='2099-12-31', _quantity=2
        )
        # Create an operation with both valid and invalid products
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            regulated_products=valid_products + invalid_products,
        )
        # Call the service method to get valid regulated products for the operation
        valid_regulated_products = OperationService.get_valid_operation_regulated_products(operation, report_year)

        # Assert that all valid products are included and all invalid products are excluded from the report
        self.assertCountEqual(valid_regulated_products, valid_products)
