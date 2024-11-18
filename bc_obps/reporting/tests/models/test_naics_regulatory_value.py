from common.tests.utils.helpers import BaseTestCase
from reporting.models import NaicsRegulatoryValue
from registration.models import NaicsCode
from django.test import TestCase


class TestInitialData(TestCase):
    def test_all_naics_have_regulatory_values(self):
        naics_regulatory_values_list = NaicsRegulatoryValue.objects.all().values_list('id', flat=True)
        missing_records = NaicsCode.objects.all().exclude(id__in=naics_regulatory_values_list).count()

        self.assertEqual(missing_records, 0)

    def test_correct_regulatory_values(self):
        naics_regulatory_values_65 = NaicsRegulatoryValue.objects.filter(reduction_factor='0.65').count()
        naics_regulatory_values_95 = NaicsRegulatoryValue.objects.filter(reduction_factor='0.95').count()
        naics_regulatory_values_9 = NaicsRegulatoryValue.objects.filter(reduction_factor='0.9').count()
        naics_regulatory_values_85 = NaicsRegulatoryValue.objects.filter(reduction_factor='0.85').count()
        naics_regulatory_values_8 = NaicsRegulatoryValue.objects.filter(reduction_factor='0.8').count()

        self.assertEqual(naics_regulatory_values_65, 27)
        self.assertEqual(naics_regulatory_values_95, 1)
        self.assertEqual(naics_regulatory_values_9, 3)
        self.assertEqual(naics_regulatory_values_85, 1)
        self.assertEqual(naics_regulatory_values_8, 1)


class EmissionCategoryModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = NaicsRegulatoryValue.objects.create(
            naics_code_id=1,
            reduction_factor="0.1",
            tightening_rate="0.1",
            valid_from='1999-01-01',
            valid_to='1999-12-31',
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("naics_code", "naics code", None, None),
            ("reduction_factor", "reduction factor", None, None),
            ("tightening_rate", "tightening rate", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
        ]
