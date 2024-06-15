from common.tests.utils.helpers import BaseTestCase
from reporting.models import ConfigurationElement
from reporting.tests.utils.bakers import (
    configuration_baker,
    gas_type_baker,
    reporting_activity_baker,
    source_type_baker,
    methodology_baker,
)


class ConfigurationElementTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):

        cls.test_object = ConfigurationElement.objects.create(
            reporting_activity=reporting_activity_baker(),
            source_type=source_type_baker(),
            gas_type=gas_type_baker(),
            methodology=methodology_baker(),
            valid_from=configuration_baker(),
            valid_to=configuration_baker(),
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("reporting_activity", "reporting activity", None, None),
            ("source_type", "source type", None, None),
            ("gas_type", "gas type", None, None),
            ("methodology", "methodology", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
            ("reporting_fields", "reporting fields", None, None),
        ]
