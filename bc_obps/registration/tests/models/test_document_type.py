from common.tests.utils.helpers import BaseTestCase
from registration.models import DocumentType


class DocumentTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [("id", "ID", None, None), ("name", "name", 1000, None), ("documents", "document", None, None)]
        cls.test_object = DocumentType.objects.create(
            name="test",
        )
