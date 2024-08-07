from registration.models.registration_purpose import RegistrationPurpose
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
)
from model_bakery import baker


class RegistrationPurposeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        test_operation = baker.make_recipe(
            'utils.operation',
        )
        cls.test_object = RegistrationPurpose.objects.create(
            registration_purpose='Reporting Operation', operation=test_operation
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("registration_purpose", "registration purpose", 1000, None),
            ("operation", "operation", None, None),
        ]
