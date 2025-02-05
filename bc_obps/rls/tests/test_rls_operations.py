import unittest
from django.conf import settings
from model_bakery import baker
from django.test import TestCase
from django.db import connection, utils, transaction, IntegrityError
from registration.models import AppRole
from rls.enums import RlsRoles, RlsOperations
from rls.tests.helpers import get_models_for_rls


@unittest.skipIf(not settings.RLS_FLAG, "RLS implementation")
class TestRlsOperations(TestCase):
    def setUp(self):
        """Setup test users with their respective roles."""
        self.users = {
            role: baker.make("registration.User", app_role=AppRole.objects.get(role_name=role.value))
            for role in RlsRoles
        }

    @staticmethod
    def _set_role(user):
        """Set the PostgreSQL role for the given user."""
        with connection.cursor() as cursor:
            cursor.execute("set role %s", [user.app_role.role_name])

    @staticmethod
    def _get_table_name(model):
        """
        Given a model, return the model's table name.
        Index 0 is the schema name, index 1 is the table name.
        """
        return model._meta.db_table.split('"."')[1]

    def _get_through_model(self, model, db_table_name):
        """
        Given a model and an M2M table name, return the through model.
        """
        for field in model._meta.many_to_many:
            through_model = field.remote_field.through  # Get the intermediary model
            if self._get_table_name(through_model) == db_table_name:
                return through_model
        return None

    def _validate_rls_model(self, model):
        """Ensure the model has the required RLS implementation."""
        table_name = self._get_table_name(model)

        if not hasattr(model, "Rls"):
            raise NotImplementedError(f"Model `{table_name}` must implement an 'Rls' class.")

        rls = model.Rls
        if not hasattr(rls, "grants"):
            raise NotImplementedError(f"Model `{table_name}` must implement a 'grants' attribute in 'Rls' class.")

        if model._meta.many_to_many:
            m2m_rls_list = getattr(rls, "m2m_rls_list", None)
            if not m2m_rls_list or len(model._meta.many_to_many) != len(m2m_rls_list):
                raise NotImplementedError(
                    f"Model `{table_name}` must implement a 'm2m_rls_list' attribute in 'Rls' class."
                )

    def _get_operations_and_actions(self, model):
        """
        Returns a dictionary of operations and their corresponding actions for a given model
        Actions are lambda functions that perform the operation to be tested.

        NOTE: Using Django ORM functions for SELECT and UPDATE operations to keep the testing as close to the actual implementation as possible.
        For the INSERT operation, we use raw SQL to avoid the ORM's insert cascade adn for the DELETE operation, we use raw SQL to avoid the ORM's delete cascade.
        (For instance, if a model has a foreign key constraint, the ORM will try to create/delete the related objects first)
        """

        def raw_delete():
            with connection.cursor() as cursor:
                cursor.execute(f"delete from {model._meta.db_table.replace('\"','')}")  # Remove quotes from table name

        def raw_create():
            with connection.cursor() as cursor:
                cursor.execute(f"insert into {model._meta.db_table.replace('\"','')} default values")

        return {
            # We don't care about the actual data, just the permissions (exists will fail if permission is denied)
            RlsOperations.SELECT: lambda: self.assertIn(model.objects.exists(), [True, False]),
            RlsOperations.INSERT: raw_create,
            # Use primary key to trigger the UPDATE operation
            RlsOperations.UPDATE: lambda: model.objects.update(**{model._meta.pk.name: 1}),
            RlsOperations.DELETE: raw_delete,
        }

    def _perform_action_with_grants(self, action, operation):
        """Perform an action and handle expected permission errors."""
        try:
            with transaction.atomic():  # Prevent database lock if an error is raised
                action()
        except IntegrityError:
            if operation == RlsOperations.UPDATE:
                self.assertEqual(operation, RlsOperations.UPDATE)  # Expected error on update

    def _assert_permission_error(self, func, msg):
        """Ensure an operation fails with the expected permission error message."""
        try:
            with transaction.atomic():
                func()
        except utils.ProgrammingError as e:
            self.assertEqual(msg, str(e))

    def _check_permissions(self, model, user_grants, table_name):
        """Check if the user has the required grants for a model and related M2M models."""
        for operation, action in self._get_operations_and_actions(model).items():
            if operation in user_grants:
                self._perform_action_with_grants(action, operation)
            else:
                self._assert_permission_error(action, f"permission denied for table {table_name}")

    def _test_grants(self, model, role):
        self._validate_rls_model(model)
        table_name = self._get_table_name(model)
        user_grants = model.Rls.role_grants_mapping.get(role, [])
        self._check_permissions(model, user_grants, table_name)

    def _test_m2m_grants(self, model, role):
        rls = model.Rls
        for table_name, role_grants_mapping in rls.m2m_models_grants_mapping.items():
            user_grants = role_grants_mapping.get(role, [])
            through_model = self._get_through_model(model, table_name.value)
            self._check_permissions(through_model, user_grants, table_name.value)

    def test_all_user_roles_permissions(self):
        """Test permissions for all user roles on all RLS models."""
        rls_models_to_test = get_models_for_rls()
        for model in rls_models_to_test:
            for role in RlsRoles:
                self._set_role(self.users[role])
                self._test_grants(model, role)
                if model._meta.many_to_many:
                    self._test_m2m_grants(model, role)
