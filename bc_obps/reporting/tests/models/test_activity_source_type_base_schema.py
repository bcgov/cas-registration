from common.tests.utils.helpers import BaseTestCase
from reporting.models import ActivitySourceTypeBaseSchema
from reporting.tests.utils.bakers import configuration_baker, reporting_activity_baker, source_type_baker, base_schema_baker

class ActivitySourceTypeBaseSchemaTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):

        cls.test_object = ActivitySourceTypeBaseSchema.objects.create(
            reporting_activity=reporting_activity_baker(),
            source_type=source_type_baker(),
            base_schema=base_schema_baker(),
            valid_from=configuration_baker(),
            valid_to=configuration_baker(),
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("reporting_activity", "reporting activity", None, None),
            ("source_type", "source type", None, None),
            ("base_schema", "base schema", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None)
        ]
