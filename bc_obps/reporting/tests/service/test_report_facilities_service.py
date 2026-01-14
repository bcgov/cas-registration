from django.test import TestCase
from django.utils import timezone

from reporting.models import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.tests.utils.bakers import report_version_baker
from reporting.service.report_facilities_service import ReportFacilitiesService
from registration.models import FacilitySnapshot, FacilityDesignatedOperationTimeline, Facility
from model_bakery import baker


class TestReportFacilitiesService(TestCase):
    def setUp(self):
        self.report_version = report_version_baker()
        self.operation = self.report_version.report.operation
        self.facilities = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            operation_id=self.operation.id,
            end_date=None,
            _quantity=1,
        )

    def test_get_report_facility_list_by_version_id(self):
        facilities = ReportFacilitiesService.get_report_facility_list_by_version_id(self.report_version.id)

        self.assertEqual(len(facilities["facilities"]), len(self.facilities))

    def test_get_all_facilities_for_review(self):
        result = ReportFacilitiesService.get_all_facilities_for_review(self.report_version.id)

        self.assertIn("current_facilities", result)
        self.assertIn("past_facilities", result)
        self.assertEqual(len(result["current_facilities"]), len(self.facilities))
        self.assertEqual(len(result["past_facilities"]), 0)

    def test_save_selected_facilities(self):
        facility1 = baker.make_recipe(
            'registration.tests.utils.facility',
        )
        facility2 = baker.make_recipe(
            'registration.tests.utils.facility',
        )
        facility_uuids = [facility1.id, facility2.id]

        ReportFacilitiesService.save_selected_facilities(self.report_version.id, facility_uuids)

        saved_facilities = FacilityReport.objects.filter(report_version=self.report_version)
        # Assert that the facilities were saved correctly
        self.assertEqual(saved_facilities.count(), 2)
        self.assertTrue(saved_facilities.filter(facility_id=facility1.id).exists())
        self.assertTrue(saved_facilities.filter(facility_id=facility2.id).exists())

        ReportFacilitiesService.save_selected_facilities(self.report_version.id, [facility1.id])
        # Assert that only facility1 remains after saving again
        self.assertEqual(FacilityReport.objects.filter(report_version=self.report_version).count(), 1)

    def test_saved_selected_facilities_have_activities(self):
        # Arrange: add activities to the report operation
        self.report_version.report_operation.activities.set(
            baker.make_recipe(
                'reporting.tests.utils.activity',
                _quantity=3,
            )
        )
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=self.operation,
        )

        facility_uuids = [facility.id]
        # Act: save the selected facility
        ReportFacilitiesService.save_selected_facilities(self.report_version.id, facility_uuids)

        saved_facilities = FacilityReport.objects.filter(report_version=self.report_version)

        ro = ReportOperation.objects.get(report_version=self.report_version)
        expected_activities = ro.activities.all()

        # Assert that the activities from the report operation were attached to the facility reports
        for facility in saved_facilities:
            self.assertSetEqual(
                set(facility.activities.values_list("id", flat=True)),
                set(expected_activities.values_list("id", flat=True)),
            )

    def test_save_selected_facilities_uses_snapshot_for_old_operator(self):
        """Test that snapshot data is used when the operator has changed."""
        # Create a new operator
        new_operator = baker.make_recipe('registration.tests.utils.operator')

        # Set the operation to have a different operator than the report
        self.operation.operator = new_operator
        self.operation.save()

        # Create a facility with current data
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            name='Current Facility Name',
            type=Facility.Types.SINGLE_FACILITY,
        )

        # Create a snapshot with different data
        baker.make(
            FacilitySnapshot,
            operation=self.operation,
            facility=facility,
            name='Snapshot Facility Name',
            type=Facility.Types.LARGE_FACILITY,
            bcghg_id='SNAPSHOT-123',
            snapshot_timestamp=timezone.now(),
        )

        # Create timeline for the facility
        baker.make(
            FacilityDesignatedOperationTimeline,
            operation=self.operation,
            facility=facility,
            end_date=None,
        )

        # Act: Save the facility
        ReportFacilitiesService.save_selected_facilities(self.report_version.id, [facility.id])

        # Assert: The facility report should use snapshot data
        facility_report = FacilityReport.objects.get(
            report_version=self.report_version,
            facility=facility,
        )
        self.assertEqual(facility_report.facility_name, 'Snapshot Facility Name')
        self.assertEqual(facility_report.facility_type, Facility.Types.LARGE_FACILITY)
        self.assertEqual(facility_report.facility_bcghgid, 'SNAPSHOT-123')

    def test_save_selected_facilities_uses_snapshot_for_past_facility(self):
        """Test that snapshot data is used for facilities with an end_date in timeline."""
        # Create a facility
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            name='Current Facility Name',
            type=Facility.Types.SINGLE_FACILITY,
            operation=self.operation,
        )

        # Create a snapshot with different data
        baker.make(
            FacilitySnapshot,
            operation=self.operation,
            facility=facility,
            name='Past Facility Name',
            type=Facility.Types.MEDIUM_FACILITY,
            bcghg_id='PAST-123',
            snapshot_timestamp=timezone.now(),
        )

        # Create timeline with end_date (indicating past facility)
        baker.make(
            FacilityDesignatedOperationTimeline,
            operation=self.operation,
            facility=facility,
            end_date=timezone.now().date(),
        )

        # Act: Save the facility
        ReportFacilitiesService.save_selected_facilities(self.report_version.id, [facility.id])

        # Assert: The facility report should use snapshot data
        facility_report = FacilityReport.objects.get(
            report_version=self.report_version,
            facility=facility,
        )
        self.assertEqual(facility_report.facility_name, 'Past Facility Name')
        self.assertEqual(facility_report.facility_type, Facility.Types.MEDIUM_FACILITY)
        self.assertEqual(facility_report.facility_bcghgid, 'PAST-123')

    def test_get_latest_snapshots_returns_most_recent(self):
        """Test that _get_latest_snapshots returns only the most recent snapshot per facility."""
        # Create facilities
        facility1 = baker.make_recipe('registration.tests.utils.facility')
        facility2 = baker.make_recipe('registration.tests.utils.facility')

        # Create multiple snapshots for facility1
        baker.make(
            FacilitySnapshot,
            operation=self.operation,
            facility=facility1,
            name='Old Snapshot',
            snapshot_timestamp=timezone.now() - timezone.timedelta(days=10),
        )
        baker.make(
            FacilitySnapshot,
            operation=self.operation,
            facility=facility1,
            name='Recent Snapshot',
            snapshot_timestamp=timezone.now(),
        )

        # Create one snapshot for facility2
        baker.make(
            FacilitySnapshot,
            operation=self.operation,
            facility=facility2,
            name='Facility 2 Snapshot',
            snapshot_timestamp=timezone.now(),
        )

        # Act
        snapshot_map = ReportFacilitiesService._get_latest_snapshots(self.operation.id, {facility1.id, facility2.id})

        # Assert
        self.assertEqual(len(snapshot_map), 2)
        self.assertEqual(snapshot_map[facility1.id].name, 'Recent Snapshot')
        self.assertEqual(snapshot_map[facility2.id].name, 'Facility 2 Snapshot')

    def test_get_all_facilities_for_review_old_operator_only_shows_snapshots(self):
        """Test that old operators only see facilities from snapshots."""

        # Create a facility with a snapshot BEFORE changing the operator
        facility_with_snapshot = baker.make_recipe('registration.tests.utils.facility')
        baker.make(
            FacilityDesignatedOperationTimeline,
            operation=self.operation,
            facility=facility_with_snapshot,
            end_date=None,
        )
        baker.make(
            FacilitySnapshot,
            operation=self.operation,
            facility=facility_with_snapshot,
            name='Facility With Snapshot',
        )

        new_operator = baker.make_recipe('registration.tests.utils.operator')
        self.operation.operator = new_operator
        self.operation.save()

        # Create a facility without a snapshot AFTER the operator change
        # This facility should NOT appear for the old operator
        facility_without_snapshot = baker.make_recipe('registration.tests.utils.facility')
        baker.make(
            FacilityDesignatedOperationTimeline,
            operation=self.operation,
            facility=facility_without_snapshot,
            end_date=None,
        )

        result = ReportFacilitiesService.get_all_facilities_for_review(self.report_version.id)

        # Assert: Only the facility with snapshot should appear
        self.assertEqual(len(result['current_facilities']), 1)
        self.assertEqual(result['current_facilities'][0]['facility__name'], 'Facility With Snapshot')

    def test_get_all_facilities_for_review_separates_current_and_past(self):
        """Test that facilities are correctly categorized as current or past based on end_date."""
        # Create current facility (no end_date)
        current_facility = baker.make_recipe('registration.tests.utils.facility')
        baker.make(
            FacilityDesignatedOperationTimeline,
            operation=self.operation,
            facility=current_facility,
            end_date=None,
        )

        # Create past facility (with end_date)
        past_facility = baker.make_recipe('registration.tests.utils.facility')
        baker.make(
            FacilityDesignatedOperationTimeline,
            operation=self.operation,
            facility=past_facility,
            end_date=timezone.now().date(),
        )

        # Act
        result = ReportFacilitiesService.get_all_facilities_for_review(self.report_version.id)

        # Assert
        self.assertEqual(len(result['current_facilities']), 2)  # Including the one from setUp
        self.assertEqual(len(result['past_facilities']), 1)
