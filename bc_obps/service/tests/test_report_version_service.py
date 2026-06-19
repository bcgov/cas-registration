from django.test import TestCase
from common.tests.utils.model_inspection import get_cascading_models
from model_bakery import baker
import pytest
from registration.models import Operation
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
        report = baker.make_recipe("reporting.tests.utils.report", reporting_year_id=2024)
        report_version = ReportVersionService.create_report_version(report)

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        ReportVersionService.delete_report_version(report_version.id)
        assert ReportVersion.objects.filter(id=report_version.id).count() == 0

    def test_change_report_version_type_deletes_the_old_version_and_creates_a_new_one(
        self,
    ):
        report = baker.make_recipe("reporting.tests.utils.report", reporting_year_id=2024)
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Simple Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 0
        assert ReportVersion.objects.filter(id=return_value.id).count() == 1
        assert return_value.report_type == "Simple Report"

    def test_change_report_version_type_to_the_same_does_nothing(self):
        report = baker.make_recipe("reporting.tests.utils.report", reporting_year_id=2024)
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
            "ReportAttachmentConfirmation",
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
            "ReportElectricityImportData",
            'ComplianceReportVersion',
            'ComplianceObligation',
            'ReportComplianceSummary',
            'ReportComplianceSummaryProduct',
            'ComplianceEarnedCredit',
            'CompliancePenalty',
            'CompliancePenaltyAccrual',
            'ElicensingAdjustment',
            'ComplianceReportVersionManualHandling',
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

    def test_fetch_full_report_version(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            operation_type=Operation.Types.SFO,
        )
        result = ReportVersionService.fetch_full_report_version(report_version.id, prefetch_full_facility_report=False)
        self.assertEqual(result.id, report_version.id)

    def test_invalid_products_are_not_added_on_report_version_creation(self):
        """
        Test that when creating a new report version, only products that are valid in the reporting year are added to the report operation's regulated products.
        """
        report_year = 2024
        valid_products = baker.make_recipe(
            "reporting.tests.utils.regulated_product",
            valid_from=f'{report_year - 1}-01-01',
            valid_to='2099-12-31',
            _quantity=2,
        )
        invalid_products = baker.make_recipe(
            "reporting.tests.utils.regulated_product", valid_from='2099-01-01', valid_to='2099-12-31', _quantity=2
        )
        # Create an operation with both valid and invalid products
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            regulated_products=valid_products + invalid_products,
        )
        # Create a report for that operation
        report = baker.make_recipe("reporting.tests.utils.report", reporting_year_id=report_year, operation=operation)
        report_version = ReportVersionService.create_report_version(report)

        report_products = report_version.report_operation.regulated_products.all()
        # Assert that all valid products are included and all invalid products are excluded from the report
        self.assertTrue(all(product in report_products for product in valid_products))
        self.assertTrue(all(product not in report_products for product in invalid_products))
