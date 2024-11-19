from django.test import TestCase
from reporting.tests.utils.bakers import report_version_baker
from reporting.service.report_facilities_service import ReportFacilitiesService
from registration.tests.utils.bakers import (
    facility_designated_operation_timeline_baker,
)
class TestReportFacilitiesService(TestCase):
    def setUp(self):    
        self.report_version = report_version_baker()
        operation = self.report_version.report.operation
        facility_designated_operation_timeline_baker(operation_id=operation.id, _quantity=1)


    def test_get_report_facility_list_by_version_id(self):
        # Call the service method
        facilities = ReportFacilitiesService.get_report_facility_list_by_version_id(self.report_version.id)

        # Assert the result
        expected_facilities=1
        self.assertEqual(len(facilities),expected_facilities )
