from common.tests.utils.helpers import BaseTestCase
from reporting.models import JsonSchema


class JsonSchemaTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = JsonSchema.objects.create(slug="testSlug", schema="{'testkey': 'testValue'}")
        cls.field_data = [
            ("id", "ID", None, None),
            ("slug", "slug", 1000, None),
            ("schema", "schema", None, None),
            ("activity_source_type_json_schemas", "activity source type base schema", None, None),
        ]
