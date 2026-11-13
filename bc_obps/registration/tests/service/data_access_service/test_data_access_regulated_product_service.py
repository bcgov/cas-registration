from datetime import date
import pytest
from django.core.cache import cache
from model_bakery import baker
from registration.models import RegulatedProduct
from registration.service.data_access_service.regulated_product_service import RegulatedProductDataAccessService

pytestmark = pytest.mark.django_db

# Seeded by registration migration 0002: only valid from 2025-01-01
PRODUCT_VALID_FROM_2025 = "Pulp and paper: lime recovered by kiln"


def _products(queryset):
    return set(queryset.values_list("name", flat=True))


class TestRegulatedProductDataAccessService:
    def setup_method(self):
        cache.clear()

    def teardown_method(self):
        cache.clear()

    @pytest.mark.parametrize("dates", [(date(2024, 1, 1), date(2025, 1, 1)), (date(2025, 1, 1), date(2024, 1, 1))])
    def test_cache_is_keyed_by_date(self, dates):
        # Regression: a list cached for one date must not be served for another date
        results = {d: _products(RegulatedProductDataAccessService.get_valid_regulated_products(d)) for d in dates}

        assert PRODUCT_VALID_FROM_2025 not in results[date(2024, 1, 1)]
        assert PRODUCT_VALID_FROM_2025 in results[date(2025, 1, 1)]

    def test_returns_only_products_valid_on_date(self):
        expected = _products(
            RegulatedProduct.objects.filter(valid_from__lte=date(2024, 6, 1), valid_to__gte=date(2024, 6, 1))
        )
        assert _products(RegulatedProductDataAccessService.get_valid_regulated_products(date(2024, 6, 1))) == expected

    def test_saving_a_product_invalidates_all_cached_dates(self):
        dates = [date(2024, 1, 1), date(2025, 1, 1)]
        for d in dates:
            list(RegulatedProductDataAccessService.get_valid_regulated_products(d))

        new_product = baker.make_recipe("registration.tests.utils.regulated_product")

        for d in dates:
            assert new_product in RegulatedProductDataAccessService.get_valid_regulated_products(d)

    def test_uses_cache_on_second_call(self, django_assert_num_queries):
        list(RegulatedProductDataAccessService.get_valid_regulated_products(date(2025, 1, 1)))
        with django_assert_num_queries(0):
            RegulatedProductDataAccessService.get_valid_regulated_products(date(2025, 1, 1))
