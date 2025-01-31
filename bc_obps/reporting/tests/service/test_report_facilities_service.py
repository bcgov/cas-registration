from django.test import TestCase

from reporting.models import FacilityReport
from reporting.tests.utils.bakers import report_version_baker
from reporting.service.report_facilities_service import ReportFacilitiesService
from registration.tests.utils.bakers import (
    facility_designated_operation_timeline_baker,
    facility_baker,
)
from model_bakery import baker


class TestReportFacilitiesService(TestCase):
    def setUp(self):
        self.report_version = report_version_baker()
        self.operation = self.report_version.report.operation
        self.facilities = baker.make_recipe(
            'utils.facility_designated_operation_timeline', operation_id=operation.id, _quantity=1
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
        facility1 = facility_baker()
        facility2 = facility_baker()
        facility_uuids = [facility1.id, facility2.id]

        ReportFacilitiesService.save_selected_facilities(self.report_version.id, facility_uuids)

        saved_facilities = FacilityReport.objects.filter(report_version=self.report_version)
        self.assertEqual(saved_facilities.count(), 2)
        self.assertTrue(saved_facilities.filter(facility_id=facility1.id).exists())
        self.assertTrue(saved_facilities.filter(facility_id=facility2.id).exists())

        ReportFacilitiesService.save_selected_facilities(self.report_version.id, [facility1.id])
        self.assertEqual(FacilityReport.objects.filter(report_version=self.report_version).count(), 1)
