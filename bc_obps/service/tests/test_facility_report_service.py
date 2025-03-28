from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from reporting.tests.utils.bakers import activity_baker
from service.facility_report_service import FacilityReportService
from reporting.schema.facility_report import FacilityReportIn
from model_bakery import baker
from registration.tests.utils.bakers import user_baker


class TestFacilityReportService(TestCase):
    def test_get_facility_throws_if_facility_report_does_not_exist(self):
        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            FacilityReportService.get_facility_report_by_version_and_id(
                report_version_id=999, facility_id="00000000-00000000-00000000-00000000"
            )

        self.assertEqual(str(exception_context.exception), "FacilityReport matching query does not exist.")

    @staticmethod
    def test_returns_facility_report():
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
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
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
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
    def test_saves_facility_report_form_data():
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', facility_bcghgid='abc')

        data = FacilityReportIn(
            facility_name="CHANGED",
            facility_type=facility_report.facility_type,
            facility_bcghgid=facility_report.facility_bcghgid,
            activities=[],
            products=[],
        )
        user = user_baker()
        returned_data = FacilityReportService.save_facility_report(
            report_version_id=facility_report.report_version_id,
            facility_id=facility_report.facility_id,
            data=data,
            user_guid=user.user_guid,
        )
        assert returned_data.facility_name == "CHANGED"
        assert returned_data.facility_type == facility_report.facility_type
        assert returned_data.facility_bcghgid == facility_report.facility_bcghgid

    # @staticmethod
    # def test_update_facility_report():
    #     # Create a facility and a facility report
    #
    #     facility = baker.make('registration.Facility')
    #     facility_report = baker.make('reporting.FacilityReport', report_version_id=1, facility_id=facility.id, facility_name='Old Name', facility_type='Old Type')
    #
    #     # Update the facility with new data
    #     facility.name = 'New Name'
    #     facility.type = 'New Type'
    #     facility.bcghg_id.id = 'new_id'
    #     facility.save()
    #
    #     # Call the update_facility_report method
    #     updated_facility_report = FacilityReportService.update_facility_report(report_version_id=1, facility_id=facility.id)
    #
    #     # Assert that the facility report fields have been updated
    #     assert updated_facility_report.facility_name == 'New Name'
    #     assert updated_facility_report.facility_type == 'New Type'
    #     assert updated_facility_report.facility_bcghgid == 'new_id'
