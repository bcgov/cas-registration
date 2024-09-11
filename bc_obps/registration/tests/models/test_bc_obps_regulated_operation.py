from common.tests.utils.helpers import BaseTestCase
from django.utils import timezone
from registration.models import (
    BcObpsRegulatedOperation,
)
from django.core.exceptions import ValidationError


class TestBcObpsRegulatedOperationModel(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = BcObpsRegulatedOperation.objects.create(
            id='23-0001', issued_at=timezone.now(), comments='test'
        )
        cls.field_data = [
            ("id", "id", None, None),  # this is not ID because we override the default ID field
            ("issued_at", "issued at", None, None),
            ("comments", "comments", None, None),
            ("operation", "operation", None, None),
            ("status", "status", None, None),
        ]

    def test_check_id_format(self):
        valid_ids = ['24-0001', '20-1234', '18-5678']
        for id in valid_ids:
            self.test_object.id = id
            self.test_object.save()

        invalid_ids = ['240001', '24-ABCD', '24_0001', '24-']
        for id in invalid_ids:
            self.test_object.id = id
            with self.assertRaises(ValidationError):
                self.test_object.save()

    def test_id_should_be_unique(self):
        # not using baker.make because it doesn't raise an error when the id is not unique
        with self.assertRaises(ValidationError, msg='Bc obps regulated operation with this Id already exists.'):
            BcObpsRegulatedOperation.objects.create(id='23-0001', comments='test')  # already created in setUpTestData
