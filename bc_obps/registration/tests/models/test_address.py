from common.tests.utils.helpers import BaseTestCase
from registration.models import Address
from model_bakery import baker


class TestAddressModel(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = baker.make(Address)
        cls.field_data = [
            ("id", "ID", None, None),
            ("street_address", "street address", 1000, None),
            ("municipality", "municipality", 1000, None),
            ("province", "province", 2, None),
            ("postal_code", "postal code", 7, None),
            ("contacts", "contact", None, None),
            ("operators_physical", "operator", None, None),
            ("operators_mailing", "operator", None, None),
            ("multiple_operators", "multiple operator", None, None),
            ("parent_operators_physical", "parent operator", None, None),
            ("parent_operators_mailing", "parent operator", None, None),
            ("facility_address", "facility", None, None),
        ]
