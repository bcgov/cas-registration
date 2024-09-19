from django.test import TestCase
from registration.models import Activity
from reporting.models import Configuration, SourceType, GasType, Methodology
from reporting.models.custom_methodology_schema import CustomMethodologySchema


class CustomMethodologySchemaTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Fetch existing instances
        cls.activity = Activity.objects.get(pk=1)
        cls.source_type = SourceType.objects.get(pk=1)
        cls.gas_type = GasType.objects.get(pk=1)
        cls.methodology = Methodology.objects.get(pk=1)
        cls.configuration = Configuration.objects.get(pk=1)  # Adjust the pk to match an existing instance if needed

        # Create a CustomMethodologySchema instance using existing instances
        cls.custom_methodology_schema = CustomMethodologySchema.objects.create(
            activity=cls.activity,
            source_type=cls.source_type,
            gas_type=cls.gas_type,
            methodology=cls.methodology,
            json_schema={"example_key": "example_value"},
            valid_from=cls.configuration,
            valid_to=cls.configuration,
        )

    def test_create_custom_methodology_schema(self):
        """Test that a CustomMethodologySchema instance can be created and saved successfully."""
        self.assertTrue(CustomMethodologySchema.objects.filter(id=self.custom_methodology_schema.id).exists())

    def test_field_values(self):
        """Test that the fields in CustomMethodologySchema have the expected values."""
        schema = CustomMethodologySchema.objects.get(id=self.custom_methodology_schema.id)
        self.assertEqual(schema.activity, self.activity)
        self.assertEqual(schema.source_type, self.source_type)
        self.assertEqual(schema.gas_type, self.gas_type)
        self.assertEqual(schema.methodology, self.methodology)
        self.assertEqual(schema.json_schema, {"example_key": "example_value"})
        self.assertEqual(schema.valid_from, self.configuration)
        self.assertEqual(schema.valid_to, self.configuration)

    def test_model_metadata(self):
        """Test that the model metadata is set correctly."""
        meta = CustomMethodologySchema._meta
        self.assertEqual(meta.db_table, 'erc"."custom_methodology_schema')
        self.assertEqual(
            meta.db_table_comment, "Custom methodology schema used to define additional fields for reporting"
        )

    def test_field_constraints(self):
        """Test that the fields enforce the correct constraints (e.g., nullability)."""
        # Testing nullable fields
        schema = CustomMethodologySchema(
            activity=self.activity,
            source_type=self.source_type,
            gas_type=self.gas_type,
            methodology=self.methodology,
            json_schema={"example_key": "example_value"},
            valid_from=self.configuration,
            valid_to=self.configuration,
        )
        schema.full_clean()  # This will validate the fields
