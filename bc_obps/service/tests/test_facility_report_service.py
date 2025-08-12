from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from reporting.models.report_raw_activity_data import ReportRawActivityData
from reporting.tests.utils.bakers import activity_baker
from service.facility_report_service import FacilityReportService, SaveFacilityReportData
from model_bakery import baker
from common.tests.utils.model_inspection import get_cascading_models
from reporting.models import (
    ReportActivity,
    ReportSourceType,
    ReportFuel,
    ReportUnit,
    ReportEmission,
    ReportMethodology,
    ReportProductEmissionAllocation,
)


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

        data = SaveFacilityReportData(
            facility_name="CHANGED",
            facility_type=facility_report.facility_type,
            facility_bcghgid=facility_report.facility_bcghgid,
            activities=[],
            regulated_products=[],
        )
        returned_data = FacilityReportService.save_facility_report(
            report_version_id=facility_report.report_version_id,
            facility_id=facility_report.facility_id,
            data=data,
        )
        assert returned_data.facility_name == "CHANGED"
        assert returned_data.facility_type == facility_report.facility_type
        assert returned_data.facility_bcghgid == facility_report.facility_bcghgid

    @staticmethod
    def test_update_facility_report():

        facility = baker.make_recipe('registration.tests.utils.facility')
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        facility_report = baker.make_recipe(
            'reporting.tests.utils.facility_report', report_version_id=report_version.id, facility_id=facility.id
        )

        facility.name = 'New Name'
        facility.type = 'Medium Facility'
        facility.save()

        updated_facility_report = FacilityReportService.update_facility_report(
            version_id=report_version.id, facility_id=facility.id
        )

        assert updated_facility_report.facility_name == 'New Name'
        assert updated_facility_report.facility_type == 'Medium Facility'
        assert updated_facility_report.facility_bcghgid == facility_report.facility_bcghgid

    @staticmethod
    def test_saves_facility_report_form_data_deletes_removed_activity_report_data():
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', facility_bcghgid='abc')
        activity_1 = baker.make_recipe(
            'reporting.tests.utils.report_activity', activity_id=1, facility_report_id=facility_report.id
        )
        activity_2 = baker.make_recipe(
            'reporting.tests.utils.report_activity', activity_id=2, facility_report_id=facility_report.id
        )
        source_type_1 = baker.make_recipe('reporting.tests.utils.report_source_type', report_activity_id=activity_1.id)
        source_type_2 = baker.make_recipe('reporting.tests.utils.report_source_type', report_activity_id=activity_2.id)
        unit_1 = baker.make_recipe('reporting.tests.utils.report_unit', report_source_type_id=source_type_1.id)
        unit_2 = baker.make_recipe('reporting.tests.utils.report_unit', report_source_type_id=source_type_2.id)
        fuel_1 = baker.make_recipe('reporting.tests.utils.report_fuel', report_unit_id=unit_1.id)
        fuel_2 = baker.make_recipe('reporting.tests.utils.report_fuel', report_unit_id=unit_2.id)
        emission_1 = baker.make_recipe('reporting.tests.utils.report_emission', report_fuel_id=fuel_1.id)
        emission_2 = baker.make_recipe('reporting.tests.utils.report_emission', report_fuel_id=fuel_2.id)
        baker.make_recipe('reporting.tests.utils.report_methodology', report_emission_id=emission_1.id)
        baker.make_recipe('reporting.tests.utils.report_methodology', report_emission_id=emission_2.id)
        report_emission_allocation = baker.make_recipe(
            'reporting.tests.utils.report_emission_allocation', facility_report_id=facility_report.id
        )
        baker.make_recipe(
            'reporting.tests.utils.report_product_emission_allocation',
            report_emission_allocation=report_emission_allocation,
        )

        data = SaveFacilityReportData(
            facility_name="CHANGED",
            facility_type=facility_report.facility_type,
            facility_bcghgid=facility_report.facility_bcghgid,
            activities=['1'],
            regulated_products=[],
        )
        FacilityReportService.save_facility_report(
            report_version_id=facility_report.report_version_id,
            facility_id=facility_report.facility_id,
            data=data,
        )
        assert ReportActivity.objects.filter(facility_report=facility_report.id).count() == 1
        assert ReportActivity.objects.filter(activity_id=2).count() == 0
        assert ReportSourceType.objects.filter(report_activity_id=activity_2.id).count() == 0
        assert ReportUnit.objects.filter(report_source_type_id=source_type_2.id).count() == 0
        assert ReportFuel.objects.filter(report_unit_id=unit_2.id).count() == 0
        assert ReportEmission.objects.filter(report_fuel_id=fuel_2.id).count() == 0
        assert ReportMethodology.objects.filter(report_emission_id=emission_2.id).count() == 0
        # ReportProductEmissionAllocation objects are not cascaded by the ReportActivity delete, but should also be cleared & re-entered if an activity is removed from the set
        report_emission_allocation_obj = ReportEmissionAllocation.objects.filter(
            facility_report_id=facility_report.id
        ).first()
        assert (
            ReportProductEmissionAllocation.objects.filter(
                report_emission_allocation=report_emission_allocation_obj
            ).count()
            == 0
        )

    @staticmethod
    def test_deleting_report_activity_data_cascades_correctly():
        cascading_models_names = {m.__name__ for m in get_cascading_models(ReportActivity)}

        assert cascading_models_names == {
            "ReportEmission",
            "ReportFuel",
            "ReportMethodology",
            "ReportSourceType",
            "ReportUnit",
        }

    def test_add_activities_to_facility_report_doesnt_duplicate_entries(self):

        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        activity_1 = activity_baker()
        activity_2 = activity_baker()
        activity_3 = activity_baker()
        activity_4 = activity_baker()

        # Add activities to the facility report
        facility_report.activities.set([activity_1, activity_2])

        self.assertQuerySetEqual(
            facility_report.activities.all(),
            [activity_1, activity_2],
            ordered=False,
        )

        FacilityReportService.add_activities_to_facility_report(
            facility_report=facility_report, activities=[activity_2.id, activity_3.id, activity_4.id]
        )

        self.assertQuerySetEqual(
            facility_report.activities.all(),
            [activity_1, activity_2, activity_3, activity_4],
            ordered=False,
        )

    @staticmethod
    def test_set_activities_for_facility_report_deletes_raw_activity_data():
        """Test that removing activities from a facility report also deletes related ReportRawActivityData."""
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        activity_1 = activity_baker()
        activity_2 = activity_baker()

        # Add activities to the facility report
        facility_report.activities.set([activity_1, activity_2])

        # Create ReportActivity records (needed for the deletion logic to trigger)
        baker.make_recipe(
            'reporting.tests.utils.report_activity', activity_id=activity_1.id, facility_report_id=facility_report.id
        )
        baker.make_recipe(
            'reporting.tests.utils.report_activity', activity_id=activity_2.id, facility_report_id=facility_report.id
        )

        # Create raw activity data for both activities
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=facility_report,
            activity=activity_1,
            json_data={"test": "data1"},
        )
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            facility_report=facility_report,
            activity=activity_2,
            json_data={"test": "data2"},
        )

        # Verify both raw data records exist
        assert ReportRawActivityData.objects.filter(facility_report=facility_report).count() == 2

        # Remove activity_2 from the facility report
        FacilityReportService.set_activities_for_facility_report(facility_report, [activity_1.id])

        # Verify that raw data for activity_2 is deleted but activity_1 remains
        remaining_raw_data = ReportRawActivityData.objects.filter(facility_report=facility_report)
        assert remaining_raw_data.count() == 1
        assert remaining_raw_data.first().activity == activity_1
        assert not ReportRawActivityData.objects.filter(facility_report=facility_report, activity=activity_2).exists()
