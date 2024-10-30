from registration.models.bcghg_operation_or_facility import BcghgOperationOrFacility
from common.tests.utils.helpers import BaseTestCase
from django.utils import timezone
from django.core.exceptions import ValidationError


class TestBcghgOperationOrFacilityModel(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = BcghgOperationOrFacility.objects.create(
            id='23279909999', issued_at=timezone.now(), comments='test'
        )
        cls.field_data = [
            ("id", "id", None, None),  # this is not ID because we override the default ID field
            ("issued_at", "issued at", None, None),
            ("issued_by", "issued by", None, None),
            ("comments", "comments", None, None),
        ]

    def test_check_id_format(self):
        valid_ids = ['13251890001', '23212161234', '13279905678']
        for id in valid_ids:
            self.test_object.id = id
            self.test_object.save()

        invalid_ids = ['73279900001', '3279901234']
        for id in invalid_ids:
            self.test_object.id = id
            with self.assertRaises(ValidationError):
                self.test_object.save()

    def test_id_should_be_unique(self):
        # not using baker.make because it doesn't raise an error when the id is not unique
        with self.assertRaises(ValidationError, msg='Bc obps regulated operation with this Id already exists.'):
            BcghgOperationOrFacility.objects.create(
                id='23279909999', comments='test'
            )  # already created in setUpTestData
