from registration.models import RegulatedProduct
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestRegulatedProductsEndpoint(CommonTestSetup):
    def test_users_can_get_regulated_products(self):
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("list_regulated_products")
        )
        assert response.status_code == 200
        assert len(response.json()) == RegulatedProduct.objects.count()
        assert response.json()[0]["id"] is not None
        assert response.json()[0]["name"] is not None
        assert response.json()[0]["is_regulated"] is not None

    def test_get_only_valid_products(self):
        RegulatedProduct.objects.create(
            name="Valid Product", is_regulated=True, valid_from="2023-01-01", valid_to="2099-01-01"
        )
        RegulatedProduct.objects.create(
            name="Invalid Product", is_regulated=True, valid_from="2050-01-01", valid_to="2099-01-01"
        )
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("list_regulated_products")
        )
        product_names = [prod["name"] for prod in response.json()]
        assert "Valid Product" in product_names
        assert "Invalid Product" not in product_names
