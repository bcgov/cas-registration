from common.tests.utils.helpers import BaseTestCase
from registration.models import (
    UserOperator,
    AppRole,
)


class AppRoleModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = AppRole.objects.first()
        cls.field_data = [
            ("role_name", "role name", 100, None),
            ("role_description", "role description", 1000, None),
            ("users", "user", None, None),
        ]

    def test_initial_data(self):
        expected_roles = sorted(['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user'])
        existing_roles = sorted(list(AppRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)

    def test_static_methods(self):
        self.assertEqual(AppRole.get_authorized_irc_roles(), ['cas_admin', 'cas_analyst'])
        self.assertEqual(AppRole.get_all_authorized_app_roles(), ['cas_admin', 'cas_analyst', 'industry_user'])
        self.assertEqual(AppRole.get_all_app_roles(), ['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user'])
        self.assertEqual(UserOperator.get_all_industry_user_operator_roles(), ['admin', 'reporter', 'pending'])
