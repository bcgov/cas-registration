from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.models import Document
from registration.tests.constants import DOCUMENT_FIXTURE, TIMESTAMP_COMMON_FIELDS


class DocumentModelTest(BaseTestCase):
    fixtures = [DOCUMENT_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("file", "file", None, None),
            ("type", "type", None, None),
            ("description", "description", 1000, None),
            ("operation", "operation", None, None),
            ("status", "status", None, None),
        ]
        cls.test_object = Document.objects.get(id=1)

    def test_supports_over_100_chars_in_file_name(self):
        long_file_name = "ten_chars " * 90 + ".longextension"
        document = make_recipe("registration.tests.utils.document", file=long_file_name)
        self.assertEqual(document.file.name, long_file_name)
