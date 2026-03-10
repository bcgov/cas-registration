from django.test import TestCase
from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.models import Operation
from reporting.service.report_supplementary_version_service.report_supplementary_version_service import (
    ReportSupplementaryVersionService,
)

from reporting.models import (
    FacilityReport,
    ReportAdditionalData,
    ReportOperationRepresentative,
    ReportPersonResponsible,
    ReportVersion,
)


class ReportSupplementaryVersionServiceTests(TestCase):
    def setUp(self):
        # Past and Current reporting year setup
        self.operator = make_recipe("registration.tests.utils.operator")
        self.operation = make_recipe(
            "registration.tests.utils.operation",
            operator=self.operator,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        self.current_reporting_year = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2030)
        self.past_reporting_year = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2029)

        self.past_year_old_report = make_recipe(
            'reporting.tests.utils.report', operator=self.operator, operation=self.operation, reporting_year_id=2029
        )
        self.past_year_old_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Draft,
            report=self.past_year_old_report,
        )

        self.past_year_old_report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.past_year_old_report_version,
            operator_legal_name=self.operator.legal_name,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        self.past_year_representative = make_recipe(
            'reporting.tests.utils.report_operation_representative',
            report_version=self.past_year_old_report_version,
            representative_name="Current Rep",
        )
        self.past_year_person_responsible = make_recipe(
            'reporting.tests.utils.report_person_responsible',
            report_version=self.past_year_old_report_version,
        )
        self.past_year_additional_data = make_recipe(
            'reporting.tests.utils.report_additional_data',
            report_version=self.past_year_old_report_version,
            capture_emissions=True,
            electricity_generated=999.0,
        )
        self.past_year_facility_report = make_recipe(
            'reporting.tests.utils.facility_report',
            report_version=self.past_year_old_report_version,
        )

        self.current_year_report = make_recipe(
            'reporting.tests.utils.report', operator=self.operator, operation=self.operation, reporting_year_id=2030
        )
        self.current_year_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Draft,
            report=self.current_year_report,
        )
        self.current_year_report_operation = make_recipe(
            "reporting.tests.utils.report_operation", report_version=self.current_year_report_version
        )

        self.current_year_representative = make_recipe(
            'reporting.tests.utils.report_operation_representative',
            report_version=self.current_year_report_version,
            representative_name="Current Rep",
        )
        self.current_year_person_responsible = make_recipe(
            'reporting.tests.utils.report_person_responsible',
            report_version=self.current_year_report_version,
        )
        self.current_year_additional_data = make_recipe(
            'reporting.tests.utils.report_additional_data',
            report_version=self.current_year_report_version,
            capture_emissions=True,
            electricity_generated=999.0,
        )
        self.current_year_facility_report = make_recipe(
            'reporting.tests.utils.facility_report',
            report_version=self.current_year_report_version,
        )

        # old_report_version used by test_create_report_supplementary_version and test_create_or_clone_same_purpose_no_operator_change
        self.old_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Draft,
        )
        self.old_report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.old_report_version,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )
        self.old_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.old_report_version.is_latest_submitted = True
        self.old_report_version.save()

        self.new_report_version: ReportVersion = make_recipe(
            'reporting.tests.utils.report_version',
            report=self.old_report_version.report,
            status=ReportVersion.ReportVersionStatus.Draft,
        )

    def test_create_report_supplementary_version(self):
        # ACT: Call the method to create a supplementary version.
        self.new_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.new_report_version.save()
        new_version = ReportSupplementaryVersionService._create_supplementary_version(self.old_report_version)

        # ASSERT: Verify that the new report version is correctly created.
        self.assertEqual(
            new_version.report,
            self.old_report_version.report,
            "The new report version should be associated with the same report as the original.",
        )
        self.assertEqual(
            new_version.report_type,
            self.old_report_version.report_type,
            "The new report version should have the same report type as the original.",
        )
        self.assertEqual(
            new_version.status,
            ReportVersion.ReportVersionStatus.Draft,
            "The new report version should be created with status Draft.",
        )
        self.assertFalse(
            new_version.is_latest_submitted,
            "The new report version should not be marked as the latest submitted version.",
        )

    def test_create_or_clone_same_purpose_no_operator_change(self):
        """Test that when purpose hasn't changed and operator hasn't changed, supplementary version is created."""
        operation = self.old_report_version.report.operation
        operation.registration_purpose = Operation.Purposes.OBPS_REGULATED_OPERATION
        operation.save()

        self.old_report_version.report.operator = operation.operator
        self.old_report_version.report.save()

        self.new_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.new_report_version.save()

        new_version = ReportSupplementaryVersionService.create_or_clone_report_version(self.old_report_version.id)

        self.assertEqual(new_version.report, self.old_report_version.report)
        self.assertEqual(
            new_version.report_operation.registration_purpose,
            self.old_report_version.report_operation.registration_purpose,
            "Cloned ReportOperation should preserve the registration purpose from the source version.",
        )

    @patch('service.reporting_year_service.ReportingYearService.get_current_reporting_year')
    def test_create_or_clone_purpose_changed_past_year_creates_supplementary(self, mock_get_year):
        """Test that when registration purpose has changed since the past report was submitted,
        a supplementary (cloned) version is created for the past year."""
        self.past_year_old_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.past_year_old_report_version.save()

        self.operation.registration_purpose = Operation.Purposes.OPTED_IN_OPERATION
        self.operation.save()

        mock_get_year.return_value = self.current_reporting_year

        new_past_year_report_version = ReportSupplementaryVersionService.create_or_clone_report_version(
            self.past_year_old_report_version.id
        )

        self.assertEqual(
            new_past_year_report_version.report_operation.registration_purpose,
            Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

    @patch('service.reporting_year_service.ReportingYearService.get_current_reporting_year')
    def test_create_or_clone_purpose_changed_current_year_creates_blank(self, mock_get_year):
        """Test that for current years with purpose change, a blank version is created (no cloned data)."""

        # Mock the current reporting year to match the current year report's year
        mock_get_year.return_value = self.current_reporting_year

        self.current_year_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.current_year_report_version.save()

        # Change the operation's registration purpose so purpose_changed=True
        self.operation.registration_purpose = Operation.Purposes.NEW_ENTRANT_OPERATION
        self.operation.save()

        new_current_year_report_version = ReportSupplementaryVersionService.create_or_clone_report_version(
            self.current_year_report_version.id
        )

        self.assertEqual(
            new_current_year_report_version.report_operation.registration_purpose,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
        )

        self.assertIsNone(
            ReportPersonResponsible.objects.filter(report_version=new_current_year_report_version).first(),
            "Blank version should have no ReportPersonResponsible.",
        )
        self.assertIsNone(
            ReportAdditionalData.objects.filter(report_version=new_current_year_report_version).first(),
            "Blank version should have no ReportAdditionalData.",
        )
        self.assertFalse(
            FacilityReport.objects.filter(report_version=new_current_year_report_version).exists(),
            "Blank version should have no FacilityReport.",
        )
        self.assertFalse(
            ReportOperationRepresentative.objects.filter(report_version=new_current_year_report_version).exists(),
            "Blank version should have no ReportOperationRepresentative.",
        )

    @patch('reporting.service.report_supplementary_version_service.report_supplementary_version_service.clone_all')
    def test_create_or_clone_operator_changed_purpose_changed_creates_supplementary_with_same_details(
        self, mock_clone_all
    ):
        """Test that when operator and purpose both change, clone_all is called with the correct source version."""
        self.current_year_report_operation.registration_purpose = Operation.Purposes.OBPS_REGULATED_OPERATION
        self.current_year_report_operation.save()

        self.current_year_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.current_year_report_version.is_latest_submitted = True
        self.current_year_report_version.save()

        new_operator = make_recipe("registration.tests.utils.operator")
        operation = self.current_year_report_version.report.operation
        operation.registration_purpose = Operation.Purposes.NEW_ENTRANT_OPERATION
        operation.operator = new_operator
        operation.save()

        new_version = ReportSupplementaryVersionService.create_or_clone_report_version(
            self.current_year_report_version.id
        )

        mock_clone_all.assert_called_once_with(self.current_year_report_version, new_version)
