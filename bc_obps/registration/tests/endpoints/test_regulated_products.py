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
