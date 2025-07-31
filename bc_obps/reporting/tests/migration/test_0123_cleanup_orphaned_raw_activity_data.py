import importlib
from django.test import TestCase
from django.apps import apps
from model_bakery import baker
from reporting.models import ReportRawActivityData
from model_bakery.baker import make_recipe

migration_module = importlib.import_module('reporting.migrations.0123_cleanup_orphaned_raw_activity_data')
cleanup_orphaned_raw_activity_data = migration_module.cleanup_orphaned_raw_activity_data


class TestMigration0999CleanupOrphanedRawActivityData(TestCase):
    """Test migration 0999 cleanup orphaned raw activity data function."""

    def setUp(self):
        """Set up test data."""
        self.facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        self.activity_1 = make_recipe("reporting.tests.utils.activity")
        self.activity_2 = make_recipe("reporting.tests.utils.activity")
        self.activity_3 = make_recipe("reporting.tests.utils.activity")

        self.facility_report.activities.set([self.activity_1, self.activity_2])

    def test_cleanup_removes_orphaned_raw_activity_data(self):
        """Test that the migration removes raw activity data for activities not associated with facility report."""
        # Create raw activity data for associated activities (should be kept)
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=self.facility_report,
            activity=self.activity_1,
            json_data={"test": "data1"},
        )
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=self.facility_report,
            activity=self.activity_2,
            json_data={"test": "data2"},
        )

        # Create raw activity data for activity not associated with facility report (should be deleted)
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=self.facility_report,
            activity=self.activity_3,
            json_data={"test": "data3"},
        )

        # Verify all records exist before migration
        self.assertEqual(ReportRawActivityData.objects.count(), 3)

        # Run the migration function
        cleanup_orphaned_raw_activity_data(apps, None)

        # Verify that only orphaned record is deleted
        remaining_records = ReportRawActivityData.objects.all()
        self.assertEqual(remaining_records.count(), 2)

        # Verify the correct records remain
        remaining_activity_ids = list(remaining_records.values_list('activity_id', flat=True))
        self.assertIn(self.activity_1.id, remaining_activity_ids)
        self.assertIn(self.activity_2.id, remaining_activity_ids)
        self.assertNotIn(self.activity_3.id, remaining_activity_ids)

    def test_cleanup_keeps_all_associated_activities(self):
        """Test that the migration keeps all raw activity data when all activities are associated."""
        # Create raw activity data for both associated activities
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=self.facility_report,
            activity=self.activity_1,
            json_data={"test": "data1"},
        )
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=self.facility_report,
            activity=self.activity_2,
            json_data={"test": "data2"},
        )

        # Verify records exist before migration
        self.assertEqual(ReportRawActivityData.objects.count(), 2)

        # Run the migration function
        cleanup_orphaned_raw_activity_data(apps, None)

        # Verify no records are deleted since all are associated
        self.assertEqual(ReportRawActivityData.objects.count(), 2)

        # Verify the correct records remain
        remaining_records = ReportRawActivityData.objects.all()
        remaining_activity_ids = list(remaining_records.values_list('activity_id', flat=True))
        self.assertIn(self.activity_1.id, remaining_activity_ids)
        self.assertIn(self.activity_2.id, remaining_activity_ids)

    def test_cleanup_handles_empty_database(self):
        """Test that the migration handles the case when no raw activity data exists."""
        # Ensure no raw activity data exists
        ReportRawActivityData.objects.all().delete()
        self.assertEqual(ReportRawActivityData.objects.count(), 0)

        # Run the migration function (should not raise any errors)
        cleanup_orphaned_raw_activity_data(apps, None)

        # Verify no records exist after migration
        self.assertEqual(ReportRawActivityData.objects.count(), 0)

    def test_cleanup_with_multiple_facility_reports(self):
        """Test that the migration correctly handles multiple facility reports."""
        # Create another facility report with different activities
        facility_report_2 = baker.make_recipe('reporting.tests.utils.facility_report')
        activity_4 = make_recipe("reporting.tests.utils.activity")
        facility_report_2.activities.set([self.activity_1, activity_4])  # Shares activity_1 with first facility

        # Create raw activity data for first facility report
        raw_data_1 = baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=self.facility_report,
            activity=self.activity_1,
            json_data={"test": "data1"},
        )
        raw_data_2 = baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=self.facility_report,
            activity=self.activity_3,
            json_data={"test": "data2"},
        )

        # Create raw activity data for second facility report
        raw_data_3 = baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=facility_report_2,
            activity=self.activity_1,
            json_data={"test": "data3"},
        )
        raw_data_4 = baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=facility_report_2,
            activity=self.activity_2,
            json_data={"test": "data4"},
        )

        # Verify all records exist before migration
        self.assertEqual(ReportRawActivityData.objects.count(), 4)

        # Run the migration function
        cleanup_orphaned_raw_activity_data(apps, None)

        # Verify that only orphaned records are deleted (raw_data_2 and raw_data_4)
        remaining_records = ReportRawActivityData.objects.all()
        self.assertEqual(remaining_records.count(), 2)

        # Verify the correct records remain
        remaining_ids = list(remaining_records.values_list('id', flat=True))
        self.assertIn(raw_data_1.id, remaining_ids)
        self.assertIn(raw_data_3.id, remaining_ids)
        self.assertNotIn(raw_data_2.id, remaining_ids)
        self.assertNotIn(raw_data_4.id, remaining_ids)
