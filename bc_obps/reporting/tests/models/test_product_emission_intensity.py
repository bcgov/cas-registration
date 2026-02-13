from common.tests.utils.helpers import BaseTestCase
from django.db.models import Count
from reporting.models import ProductEmissionIntensity
from registration.models import RegulatedProduct
from django.test import TestCase


class TestInitialData(TestCase):
    def test_all_regulated_products_have_emission_intensity(self):
        """
        Assert that every regulated product has at least one ProductEmissionIntensity record defined
        """
        assert (
            not RegulatedProduct.objects.prefetch_related("productemissionintensity")
            .filter(is_regulated=True)
            .annotate(emission_intensity_count=Count("productemissionintensity"))
            .filter(emission_intensity_count=0)
            .exists()
        )


class EmissionCategoryModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ProductEmissionIntensity.objects.create(
            product_id=1,
            product_weighted_average_emission_intensity="0.1",
            valid_from='1999-01-01',
            valid_to='1999-12-31',
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("product", "product", None, None),
            ("product_weighted_average_emission_intensity", "product weighted average emission intensity", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
        ]
