from common.tests.utils.helpers import BaseTestCase
from registration.models import Activity
from reporting.models import ConfigurationElement, SourceType, GasType, Methodology, CustomMethodologySchema
from reporting.tests.utils.bakers import (
    configuration_baker,
)
import pytest


class ConfigurationElementTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):

        config = configuration_baker({'slug': '5025', 'valid_from': '5025-01-01', 'valid_to': '5025-12-31'})
        cls.custom_methodology_schema = CustomMethodologySchema.objects.create(
            activity=Activity.objects.get(pk=1),
            source_type=SourceType.objects.get(pk=1),
            gas_type=GasType.objects.get(pk=1),
            methodology=Methodology.objects.get(pk=1),
            json_schema={"example_key": "example_value"},
            valid_from=config,
            valid_to=config,
        )
        cls.test_object = ConfigurationElement.objects.create(
            activity=Activity.objects.get(pk=1),
            source_type=SourceType.objects.get(pk=1),
            gas_type=GasType.objects.get(pk=1),
            methodology=Methodology.objects.get(pk=1),
            custom_methodology_schema=cls.custom_methodology_schema,
            valid_from=config,
            valid_to=config,
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("activity", "activity", None, None),
            ("source_type", "source type", None, None),
            ("gas_type", "gas type", None, None),
            ("methodology", "methodology", None, None),
            ('custom_methodology_schema', "custom methodology schema", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
            ("reporting_fields", "reporting fields", None, None),
        ]

    def testDuplicateConfigElementForDateRange(self):
        invalid_record = ConfigurationElement(
            activity=self.test_object.activity,
            source_type=self.test_object.source_type,
            gas_type=self.test_object.gas_type,
            methodology=self.test_object.methodology,
            custom_methodology_schema=self.test_object.custom_methodology_schema,
            valid_from=self.test_object.valid_from,
            valid_to=self.test_object.valid_from,
        )

        with pytest.raises(Exception) as exc:
            invalid_record.save()
        assert exc.match(r"^This record will result in duplicate configuration elements")

    def testValidInsert(self):
        config = configuration_baker({'slug': '5026', 'valid_from': '5026-01-01', 'valid_to': '5026-12-31'})
        valid_record = ConfigurationElement(
            activity=self.test_object.activity,
            source_type=self.test_object.source_type,
            gas_type=self.test_object.gas_type,
            methodology=self.test_object.methodology,
            custom_methodology_schema=self.custom_methodology_schema,
            valid_from=config,
            valid_to=config,
        )
        valid_record.save()
