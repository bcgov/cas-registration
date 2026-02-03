import importlib
from django.test import TestCase
from django.apps import apps

migration_module = importlib.import_module('reporting.migrations.0150_update_activity_json_schema_titles')
update_activity_schema_titles = migration_module.update_activity_schema_titles


class TestMigration0150UpdateActivityJsonSchemaTitles(TestCase):
    """Test migration 0150 update activity json schema titles function."""

    def setUp(self):
        """Set up test data."""
        self.ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
        self.Activity = apps.get_model('registration', 'Activity')
        self.test_title = "TESTESTESTEST"
        self.test_schema = {
            "type": "object",
            "title": self.test_title,
        }

    def test_update_activity_schema_titles(self):
        """Test that the migration updates activity json schema titles correctly."""

        # Define expected titles for each activity slug
        expected_titles = {
            'gsc_excluding_line_tracing': 'General stationary combustion excluding line tracing (at SFO)',
            'gsc_solely_for_line_tracing': 'General stationary combustion (line tracing)',
            'gsc_other_than_non_compression': 'General stationary combustion (compression and processing)',
            'gsc_non_compression': 'General stationary combustion (other than compression and processing)',
            'natural_gas_activities_other_than_non_compression': 'Natural gas transmission (compression and processing)',
            'natural_gas_activities_non_compression': 'Natural gas transmission (other than compression and processing)',
            'og_activities_other_than_non_compression': 'Oil & Gas extraction (compression and processing)',
            'og_activities_non_compression': 'Oil & Gas extraction (other than compression and processing)',
        }

        # Set the test schema for each activity
        for slug in expected_titles.keys():
            self.ActivitySchema.objects.filter(activity_id=self.Activity.objects.get(slug=slug).id).update(
                json_schema=self.test_schema
            )

        # Run the migration function
        update_activity_schema_titles(apps, None)

        # Verify that each activity's json schema title has been updated correctly
        for slug, expected_title in expected_titles.items():
            activity_id = self.Activity.objects.get(slug=slug).id
            activity_schema = self.ActivitySchema.objects.get(activity_id=activity_id)
            actual_title = activity_schema.json_schema.get('title', '')
            self.assertEqual(actual_title, expected_title)
