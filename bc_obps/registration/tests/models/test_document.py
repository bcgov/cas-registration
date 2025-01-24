from common.tests.utils.helpers import BaseTestCase
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
        ]
        cls.test_object = Document.objects.get(id=1)
