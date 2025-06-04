from django.test import TestCase

from reporting.models import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.tests.utils.bakers import report_version_baker
from reporting.service.report_facilities_service import ReportFacilitiesService
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
