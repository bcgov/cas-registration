from django.db import models
from django.test import TestCase


class BaseTestCase(TestCase):
    field_data = []  # Override this in the child class

    def assertFieldLabel(self, instance, field_name, expected_label):
        try:
            field = instance._meta.get_field(field_name)
            if isinstance(field, models.ManyToOneRel) or isinstance(field, models.ManyToManyRel):
                # If the field is a ManyToOneRel or ManyToManyRel, get the field from the related model
                self.assertEqual(field.related_model._meta.verbose_name, expected_label)
            else:
                self.assertEqual(field.verbose_name, expected_label)
        except Exception as e:
            print(e)
            expected_fields = instance._meta.get_fields()
            raise Exception(
                f'Field not found: {field_name} not in expected set of fields [{expected_fields}]. Error: {e}'
            )

    def assertFieldMaxLength(self, instance, field_name, expected_max_length):
        field = instance._meta.get_field(field_name)
        self.assertEqual(field.max_length, expected_max_length)

    def assertHasMultipleRelationsInField(self, instance, field_name, expected_relations_count):
        field = instance.__getattribute__(field_name)
        self.assertEqual(field.count(), expected_relations_count)

    def test_field_labels_and_max_lengths(self):
        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in self.field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_object, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_object, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(self.test_object, field_name, expected_relations_count)

    def test_field_data_length(self):
        if hasattr(self, "test_object") and hasattr(self, "field_data"):
            print(f"test_object: {self.test_object._meta.get_fields()}")
            print(f"field_data: {self.field_data}")
            # check that the number of fields in the model is the same as the number of fields in the field_data list
            self.assertEqual(
                len(self.field_data),
                len(self.test_object._meta.get_fields()),
                f'EXPECTED FIELDS: {self.field_data}, FIELDS FOUND: {self.test_object._meta.get_fields()}',
            )
