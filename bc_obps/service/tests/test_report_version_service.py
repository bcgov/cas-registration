from django.test import TestCase
from common.tests.utils.model_inspection import get_cascading_models
from model_bakery import baker
import pytest
from reporting.models.report_version import ReportVersion
from service.report_version_service import ReportVersionService

pytestmark = pytest.mark.django_db


class TestReportVersionService(TestCase):
    def setUp(self):
        self.report_version_1 = baker.make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Submitted,
            is_latest_submitted=True,
        )
        self.report_version_2 = baker.make_recipe(
            'reporting.tests.utils.report_version',
            report=self.report_version_1.report,  # Ensure it belongs to the same report
            status=ReportVersion.ReportVersionStatus.Draft,
        )

    def test_create_report_version(self):
        # This functionality is tested as part of the report_service
        pass

    def test_delete_report_version(self):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report)

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        ReportVersionService.delete_report_version(report_version.id)
        assert ReportVersion.objects.filter(id=report_version.id).count() == 0

    def test_change_report_version_type_deletes_the_old_version_and_creates_a_new_one(
        self,
    ):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Simple Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 0
        assert ReportVersion.objects.filter(id=return_value.id).count() == 1
        assert return_value.report_type == "Simple Report"

    def test_change_report_version_type_to_the_same_does_nothing(self):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Annual Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        assert return_value == report_version

    def test_report_version_cascading_models(self):
        cascading_models_names = {m.__name__ for m in get_cascading_models(ReportVersion)}

        assert cascading_models_names == {
            "FacilityReport",
            "ReportActivity",
            "ReportAttachment",
            "ReportEmission",
            "ReportFuel",
            "ReportMethodology",
            "ReportNewEntrant",
            "ReportNewEntrantEmission",
            "ReportNewEntrantProduction",
            "ReportNonAttributableEmissions",
            "ReportOperation",
            "ReportPersonResponsible",
            "ReportProduct",
            "ReportProductEmissionAllocation",
            "ReportRawActivityData",
            "ReportSignOff",
            "ReportSourceType",
            "ReportUnit",
            "ReportOperationRepresentative",
            "ReportAdditionalData",
            "ReportVerification",
            "ReportVerificationVisit",
            "ReportEmissionAllocation",
            "ReportProductEmissionAllocation",
            "ReportComplianceSummary",
            "ReportComplianceSummaryProduct",
        }

    def test_is_initial_report_version_returns_true_for_first_version(self):
        """
        Test that is_initial_report_version returns True for the version with the lowest ID.
        """
        result = ReportVersionService.is_initial_report_version(self.report_version_1.id)
        self.assertTrue(result, "Expected the first report version to be considered initial.")

    def test_is_initial_report_version_returns_false_for_non_initial_version(self):
        """
        Test that is_initial_report_version returns False for a version that is not the first created.
        """
        result = ReportVersionService.is_initial_report_version(self.report_version_2.id)
        self.assertFalse(result, "Expected the second report version to not be considered initial.")
