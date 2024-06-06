from typing import Callable, List, Tuple, Type
from django.db import models
from django.test import TestCase
from registration.models import (
    Document,
    TimeStampedModel,
    User,
    Contact,
    Operator,
    UserOperator,
    ParentOperator,
    Operation,
    MultipleOperator,
)
from model_bakery import baker
from registration.tests.utils.bakers import (
    contact_baker,
    document_baker,
    multiple_operator_baker,
    operator_baker,
    operation_baker,
    parent_operator_baker,
    user_operator_baker,
)


class TestModelsWithAuditColumns(TestCase):
    models_with_audit_columns_and_field_to_update: List[Tuple[Type[models.Model], str, Callable]] = [
        (Document, 'description', document_baker),
        (Contact, 'first_name', contact_baker),
        (Operator, 'legal_name', operator_baker),
        (Operation, 'name', operation_baker),
        (UserOperator, 'role', user_operator_baker),
        (MultipleOperator, 'legal_name', multiple_operator_baker),
        (ParentOperator, 'legal_name', parent_operator_baker),
    ]

    def setup_method(self, *args, **kwargs):
        [self.user_1, self.user_2] = baker.make(User, _quantity=2)

    def test_set_audit_columns(self):
        for model, field_to_update, model_baker in self.models_with_audit_columns_and_field_to_update:
            instance: Type[TimeStampedModel] = model_baker()  # at this point we have 2 history because of the baker
            # CREATE
            instance.set_create_or_update(self.user_1.pk)
            instance.refresh_from_db()
            self.assertIsNotNone(instance.created_at)
            self.assertEqual(instance.created_by, self.user_1)

            self.assertIsNone(instance.updated_at)
            self.assertIsNone(instance.updated_by)
            self.assertIsNone(instance.archived_at)
            self.assertIsNone(instance.archived_by)

            # CHECK HISTORY
            history_1 = instance.history.most_recent()
            history_1.refresh_from_db()
            self.assertEqual(history_1.created_at, instance.created_at)
            self.assertEqual(history_1.created_by, instance.created_by)
            self.assertIsNone(history_1.updated_at)
            self.assertIsNone(history_1.updated_by)
            self.assertIsNone(history_1.archived_at)
            self.assertIsNone(history_1.archived_by)

            # UPDATE
            model_data_field_has_choices = model._meta.get_field(field_to_update).choices
            model.objects.filter(id=instance.id).update(**{field_to_update: model_data_field_has_choices[0][0] if model_data_field_has_choices else 'updated'})
            instance.set_create_or_update(self.user_2.pk)
            instance.refresh_from_db()
            self.assertIsNotNone(instance.created_at)
            self.assertEqual(instance.created_by, self.user_1)
            self.assertIsNotNone(instance.updated_at)
            self.assertGreater(instance.updated_at, instance.created_at)
            self.assertEqual(instance.updated_by, self.user_2)
            self.assertIsNone(instance.archived_at)
            self.assertIsNone(instance.archived_by)

            # CHECK HISTORY
            history_2 = instance.history.most_recent()
            history_2.refresh_from_db()
            self.assertEqual(history_2.created_at, instance.created_at)
            self.assertEqual(history_2.created_by, instance.created_by)
            self.assertEqual(history_2.updated_at, instance.updated_at)
            self.assertEqual(history_2.updated_by, instance.updated_by)
            self.assertIsNone(history_2.archived_at)
            self.assertIsNone(history_2.archived_by)

            # ARCHIVE
            instance.set_archive(self.user_1.pk)
            instance.refresh_from_db()
            self.assertIsNotNone(instance.created_at)
            self.assertEqual(instance.created_by, self.user_1)
            self.assertIsNotNone(instance.updated_at)
            self.assertGreater(instance.updated_at, instance.created_at)
            self.assertEqual(instance.updated_by, self.user_2)
            self.assertIsNotNone(instance.archived_at)
            self.assertEqual(instance.archived_by, self.user_1)
            self.assertGreater(instance.archived_at, instance.created_at)
            self.assertGreater(instance.archived_at, instance.updated_at)

            # CHECK HISTORY
            history_3 = instance.history.most_recent()
            history_3.refresh_from_db()
            self.assertEqual(history_3.created_at, instance.created_at)
            self.assertEqual(history_3.created_by, instance.created_by)
            self.assertEqual(history_3.updated_at, instance.updated_at)
            self.assertEqual(history_3.updated_by, instance.updated_by)
            self.assertEqual(history_3.archived_at, instance.archived_at)
            self.assertEqual(history_3.archived_by, instance.archived_by)

    def test_invalid_action_type_handling(self):
        for _, _, model_baker in self.models_with_audit_columns_and_field_to_update:
            instance: Type[TimeStampedModel] = model_baker()
            with self.assertRaises(AttributeError):
                instance.set_delete(modifier=self.user_1)

    def test_no_modifier_provided(self):
        for _, _, model_baker in self.models_with_audit_columns_and_field_to_update:
            instance: Type[TimeStampedModel] = model_baker()
            with self.assertRaises(TypeError):
                instance.set_create_or_update()

    def test_existing_audit_columns_presence(self):
        for model, field_to_update, model_baker in self.models_with_audit_columns_and_field_to_update:
            instance: Type[TimeStampedModel] = model_baker()
            instance.set_create_or_update(self.user_1.pk)
            instance.refresh_from_db()

            # Save the initial audit values for comparison
            initial_created_at = instance.created_at
            initial_created_by = instance.created_by

            # Perform an action
            model_data_field_has_choices = model._meta.get_field(field_to_update).choices
            model.objects.filter(id=instance.id).update(**{field_to_update: model_data_field_has_choices[0][0] if model_data_field_has_choices else 'updated'})
            instance.set_create_or_update(self.user_2.pk)
            instance.refresh_from_db()

            # Ensure existing audit columns remain unchanged
            self.assertEqual(instance.created_at, initial_created_at)
            self.assertEqual(instance.created_by, initial_created_by)
            self.assertGreater(instance.updated_at, instance.created_at)
            self.assertNotEqual(instance.updated_by, instance.created_by)
            # Ensure updated audit columns are correctly set
            self.assertEqual(instance.updated_by, self.user_2)
