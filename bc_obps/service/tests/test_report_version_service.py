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

    def test_fetch_full_report_version_sfo(self):
        """
        Test that fetch_full_report_version returns a ReportVersion with all related data for an SFO report
        """
        report_version = baker.make_recipe("reporting.tests.utils.report_version")

        # select_related
        report_operation = baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            operation_name="Test Operation",
            operator_legal_name="Test Operator",
            operation_type=Operation.Types.SFO,
        )
        report_verification = baker.make_recipe(
            "reporting.tests.utils.report_verification",
            report_version=report_version,
        )
        report_additional_data = baker.make_recipe(
            "reporting.tests.utils.report_additional_data",
            report_version=report_version,
            capture_emissions=True,
            electricity_generated=500.0,
        )
        report_person_responsible = baker.make_recipe(
            "reporting.tests.utils.report_person_responsible",
            report_version=report_version,
        )

        # prefetch_related
        activity = baker.make_recipe("reporting.tests.utils.activity")
        regulated_product = baker.make("registration.RegulatedProduct")
        report_operation.activities.add(activity)
        report_operation.regulated_products.add(regulated_product)

        compliance_summary = baker.make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            report_version=report_version,
        )
        facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=report_version,
            facility_name="SFO Facility",
            facility_type="Single Facility Operation",
        )
        report_product = baker.make_recipe(
            "reporting.tests.utils.report_product",
            report_version=report_version,
            facility_report=facility_report,
        )
        representative = baker.make_recipe(
            "reporting.tests.utils.report_operation_representative",
            report_version=report_version,
            representative_name="Test user",
        )
        emission_category = baker.make_recipe("reporting.tests.utils.emission_category")
        gas_type = baker.make_recipe("reporting.tests.utils.gas_type")
        non_attributable = baker.make_recipe(
            "reporting.tests.utils.report_non_attributable_emissions",
            report_version=report_version,
            facility_report=facility_report,
            activity="Combustion",
            source_type="Flaring",
            emission_category=emission_category,
        )
        non_attributable.gas_type.set([gas_type])
        report_activity = baker.make_recipe(
            "reporting.tests.utils.report_activity",
            facility_report=facility_report,
            report_version=report_version,
        )

        result = ReportVersionService.fetch_full_report_version(report_version.id, prefetch_full_facility_report=False)

        self.assertIsInstance(result, ReportVersion)
        self.assertEqual(result.id, report_version.id)
        self.assertEqual(result.report_type, report_version.report_type)
        self.assertEqual(result.status, report_version.status)

        # report_operation
        self.assertEqual(result.report_operation.id, report_operation.id)
        self.assertEqual(result.report_operation.operation_name, "Test Operation")
        self.assertEqual(result.report_operation.operator_legal_name, "Test Operator")
        self.assertEqual(result.report_operation.operation_type, Operation.Types.SFO)
        # report_verification
        self.assertEqual(result.report_verification.id, report_verification.id)
        self.assertEqual(result.report_verification.verification_body_name, report_verification.verification_body_name)
        self.assertEqual(
            result.report_verification.verification_conclusion, report_verification.verification_conclusion
        )
        # report_additional_data
        self.assertEqual(result.report_additional_data.id, report_additional_data.id)
        self.assertTrue(result.report_additional_data.capture_emissions)
        self.assertEqual(result.report_additional_data.electricity_generated, 500.0)
        # report_person_responsible
        self.assertEqual(result.report_person_responsible.id, report_person_responsible.id)
        self.assertEqual(result.report_person_responsible.first_name, report_person_responsible.first_name)
        self.assertEqual(result.report_person_responsible.last_name, report_person_responsible.last_name)
        self.assertEqual(result.report_person_responsible.email, report_person_responsible.email)

        # report_compliance_summary
        compliance_records = list(result.report_compliance_summary.all())
        self.assertEqual(len(compliance_records), 1)
        self.assertEqual(compliance_records[0].id, compliance_summary.id)
        # report_products
        product_records = list(result.report_products.all())
        self.assertEqual(len(product_records), 1)
        self.assertEqual(product_records[0].id, report_product.id)
        # report_operation_representatives
        rep_records = list(result.report_operation_representatives.all())
        self.assertEqual(len(rep_records), 1)
        self.assertEqual(rep_records[0].id, representative.id)
        self.assertEqual(rep_records[0].representative_name, "Test user")

        # report_non_attributable_emissions
        non_attr_records = list(result.report_non_attributable_emissions.all())
        self.assertEqual(len(non_attr_records), 1)
        self.assertEqual(non_attr_records[0].activity, "Combustion")
        self.assertEqual(non_attr_records[0].source_type, "Flaring")
        self.assertEqual(non_attr_records[0].emission_category.id, emission_category.id)
        self.assertIn(gas_type, non_attr_records[0].gas_type.all())

        # facility_reports data
        facility_reports = list(result.facility_reports.all())
        self.assertEqual(len(facility_reports), 1)
        self.assertEqual(facility_reports[0].id, facility_report.id)
        self.assertEqual(facility_reports[0].facility_name, "SFO Facility")
        self.assertEqual(facility_reports[0].facility_type, "Single Facility Operation")
        activities = list(facility_reports[0].reportactivity_records.all())
        self.assertEqual(len(activities), 1)
        self.assertEqual(activities[0].id, report_activity.id)
        self.assertIsNotNone(activities[0].activity)
        self.assertEqual(activities[0].activity.id, report_activity.activity_id)

    def test_fetch_full_report_version_lfo_prefetch_true(self):
        """
        Test that fetch_full_report_version returns a ReportVersion with full facility data
        (including activity records) for an LFO report when prefetch_full_facility_report=True.
        """
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            operation_type=Operation.Types.LFO,
        )
        facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=report_version,
            facility_name="LFO Full Facility",
        )
        baker.make_recipe(
            "reporting.tests.utils.report_activity",
            facility_report=facility_report,
            report_version=report_version,
        )

        result = ReportVersionService.fetch_full_report_version(report_version.id, prefetch_full_facility_report=True)

        self.assertEqual(result.report_operation.operation_type, Operation.Types.LFO)
        facility_reports = list(result.facility_reports.all())
        self.assertEqual(len(facility_reports), 1)
        self.assertEqual(facility_reports[0].facility_name, "LFO Full Facility")
        self.assertTrue(facility_reports[0].reportactivity_records.exists())

    def test_fetch_full_report_version_lfo_prefetch_false(self):
        """
        Test that fetch_full_report_version returns a ReportVersion with facility name and id for an LFO when prefetch_full_facility_report=False.
        """
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            operation_type=Operation.Types.LFO,
        )
        baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=report_version,
            facility_name="Test LFO Facility",
        )

        result = ReportVersionService.fetch_full_report_version(report_version.id, prefetch_full_facility_report=False)

        self.assertEqual(result.report_operation.operation_type, Operation.Types.LFO)
        facility_reports = list(result.facility_reports.all())
        self.assertEqual(len(facility_reports), 1)
        self.assertEqual(facility_reports[0].facility_name, "Test LFO Facility")
        self.assertIsNotNone(facility_reports[0].facility_id)
        self.assertFalse(facility_reports[0].reportactivity_records.exists())
