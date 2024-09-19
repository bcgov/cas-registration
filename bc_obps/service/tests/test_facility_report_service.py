from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from reporting.tests.utils.bakers import facility_report_baker, activity_baker
from service.facility_report_service import FacilityReportService
from reporting.schema.facility_report import FacilityReportIn


class TestFacilityReportService(TestCase):
    def test_get_facility_throws_if_facility_report_does_not_exist(self):
        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            FacilityReportService.get_facility_report_by_version_and_id(
                report_version_id=999, facility_id="00000000-00000000-00000000-00000000"
            )

        self.assertEqual(str(exception_context.exception), "FacilityReport matching query does not exist.")

    @staticmethod
    def test_returns_facility_report():
        facility_report = facility_report_baker()
        assert facility_report == FacilityReportService.get_facility_report_by_version_and_id(
            report_version_id=facility_report.report_version_id, facility_id=facility_report.facility_id
        )

    def test_get_activities_throws_if_facility_report_does_not_exist(self):
        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            FacilityReportService.get_activity_ids_for_facility(
                version_id=999, facility_id="00000000-00000000-00000000-00000000"
            )

        self.assertEqual(str(exception_context.exception), "FacilityReport matching query does not exist.")

    @staticmethod
    def test_returns_activity_id_list():
        facility_report = facility_report_baker()
        a1 = activity_baker()
        a2 = activity_baker()
        assert (
            len(
                FacilityReportService.get_activity_ids_for_facility(
                    version_id=facility_report.report_version_id, facility_id=facility_report.facility_id
                )
            )
            == 0
        )
        facility_report.activities.add(a1)
        facility_report.activities.add(a2)
        assert (
            len(
                FacilityReportService.get_activity_ids_for_facility(
                    version_id=facility_report.report_version_id, facility_id=facility_report.facility_id
                )
            )
            == 2
        )

    @staticmethod
    def test_form_data_returns_none_if_facility_report_does_not_exist():
        assert FacilityReportService.get_facility_report_form_data(None, []) is None

    @staticmethod
    def test_form_data_returns_facility_report_form_data():
        facility_report = facility_report_baker()
        returned_data = FacilityReportService.get_facility_report_form_data(
            facility_report=facility_report, activity_ids=[1, 2]
        )
        assert facility_report.facility_name == returned_data.facility_name
        assert facility_report.facility_type == returned_data.facility_type
        assert facility_report.facility_bcghgid == returned_data.facility_bcghgid

        print(returned_data)

    @staticmethod
    def test_saves_facility_report_form_data():
        facility_report = facility_report_baker(facility_bcghgid='abc')
        print(facility_report.facility_bcghgid)
        data = FacilityReportIn(
            facility_name="CHANGED",
            facility_type=facility_report.facility_type,
            facility_bcghgid=facility_report.facility_bcghgid,
            activities=[],
            products=[],
        )
        returned_data = FacilityReportService.save_facility_report(
            report_version_id=facility_report.report_version_id, facility_id=facility_report.facility_id, data=data
        )
        assert returned_data.facility_name == "CHANGED"
        assert returned_data.facility_type == facility_report.facility_type
        assert returned_data.facility_bcghgid == facility_report.facility_bcghgid
