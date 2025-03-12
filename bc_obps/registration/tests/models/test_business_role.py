from common.tests.utils.helpers import BaseTestCase
from registration.models import BusinessRole


class BusinessRoleModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = BusinessRole.objects.first()
        cls.field_data = [
            ("role_name", "role name", 100, None),
            ("role_description", "role description", 1000, None),
            ("contacts", "contact", None, None),
        ]

    def test_initial_data(self):
        expected_roles = sorted(['Senior Officer', 'Operation Representative', 'Authorized Signing Officer'])
        existing_roles = sorted(list(BusinessRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)
