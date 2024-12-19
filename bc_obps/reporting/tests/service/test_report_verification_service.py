from decimal import Decimal
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.service.report_verification_service import ReportVerificationService
from reporting.schema.report_verification import ReportVerificationIn
from unittest.mock import patch


class TestReportVerificationService(TestCase):
    REGULATED_OPERATION_PURPOSES = {"OBPS_Regulated_Operation", "Opt-in", "New_Entrants"}

    ATTRIBUTABLE_EMISSION_THRESHOLD = Decimal('25000000')

    def setUp(self):
        # Arrange: Create a report version
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        self.report_verification = make_recipe(
            'reporting.tests.utils.report_verification', report_version=self.report_version
        )

    def test_get_report_verification_by_version_id_returns_correct_instance(self):
        """
        Test that the service retrieves the correct ReportVerification instance
        for a given report version ID.
        """

        # Act: Call the service to get the report verification
        retrieved_verification = ReportVerificationService.get_report_verification_by_version_id(
            report_version_id=self.report_version.id
        )

        # Assert: Verify the retrieved instance matches the expected data
        self.assertIsNotNone(retrieved_verification)
        self.assertEqual(retrieved_verification, self.report_verification)
        self.assertEqual(retrieved_verification.report_version, self.report_version)
        self.assertEqual(retrieved_verification.verification_body_name, self.report_verification.verification_body_name)
        self.assertEqual(retrieved_verification.accredited_by, self.report_verification.accredited_by)
        self.assertEqual(retrieved_verification.scope_of_verification, self.report_verification.scope_of_verification)
        self.assertEqual(
            retrieved_verification.threats_to_independence, self.report_verification.threats_to_independence
        )
        self.assertEqual(
            retrieved_verification.verification_conclusion, self.report_verification.verification_conclusion
        )
        self.assertEqual(retrieved_verification.visit_name, self.report_verification.visit_name)
        self.assertEqual(retrieved_verification.visit_type, self.report_verification.visit_type)
        self.assertEqual(retrieved_verification.other_facility_name, self.report_verification.other_facility_name)
        self.assertEqual(
            retrieved_verification.other_facility_coordinates, self.report_verification.other_facility_coordinates
        )

    @patch("reporting.service.compliance_service.ComplianceService.get_emissions_attributable_for_reporting")
    @patch(
        "reporting.service.report_additional_data.ReportAdditionalDataService.get_registration_purpose_by_version_id"
    )
    def test_get_report_needs_verification_returns_true_for_regulated_purpose(
        self, mock_get_registration_purpose, mock_get_emissions
    ):
        """
        Test that the service returns true for reports with regulated_purpose is a REGULATED_OPERATION_PURPOSES.
        """

        # Arrange: Mock the registration purpose to simulate a regulated operation
        # The purpose is one of REGULATED_OPERATION_PURPOSES
        mock_get_registration_purpose.return_value = "OBPS Regulated Operation"

        # Act: Call the method to determine if the report needs verification
        result = ReportVerificationService.get_report_needs_verification(self.report_version.id)

        # Assert: Verify that the method correctly identifies the need for verification
        self.assertTrue(result)
        # Ensure the registration purpose method was called with the correct version ID
        mock_get_registration_purpose.assert_called_once_with(self.report_version.id)

    @patch("reporting.service.compliance_service.ComplianceService.get_emissions_attributable_for_reporting")
    @patch(
        "reporting.service.report_additional_data.ReportAdditionalDataService.get_registration_purpose_by_version_id"
    )
    def test_get_report_needs_verification_returns_false_for_non_regulated_purpose(
        self, mock_get_registration_purpose, mock_get_emissions
    ):
        """
        Test that the service returns false for reports with regulated_purpose NOT a REGULATED_OPERATION_PURPOSES.
        """

        # Arrange: Simulate a purpose that is not in REGULATED_OPERATION_PURPOSES
        mock_get_registration_purpose.return_value = "Electricity Import Operation"

        # Act: Call the method to determine if the report needs verification
        result = ReportVerificationService.get_report_needs_verification(self.report_version.id)

        # Assert: The method should correctly determine no verification is needed
        self.assertFalse(result)
        # Ensure the registration purpose method was called with the correct version ID
        mock_get_registration_purpose.assert_called_once_with(self.report_version.id)
        # Verify that emissions calculation is not called for unregulated purposes
        mock_get_emissions.assert_not_called()

    @patch("reporting.service.compliance_service.ComplianceService.get_emissions_attributable_for_reporting")
    @patch(
        "reporting.service.report_additional_data.ReportAdditionalDataService.get_registration_purpose_by_version_id"
    )
    def test_get_report_needs_verification_returns_true_for_reporting_operation_with_high_emissions(
        self, mock_get_registration_purpose, mock_get_emissions
    ):
        """
        Test that the service returns true for report of Reporting_Operation with attributable emissions exceeding the verification threshold
        """

        # Arrange: Simulate a reporting operation
        mock_get_registration_purpose.return_value = "Reporting Operation"
        # Simulate high attributable emissions exceeding the verification threshold
        mock_get_emissions.return_value = Decimal('30000000')

        # Act: Call the method to determine if the report needs verification
        result = ReportVerificationService.get_report_needs_verification(self.report_version.id)

        # Assert: The method should identify the need for verification
        self.assertTrue(result)
        # Verify the mocked methods were called with the expected arguments
        mock_get_registration_purpose.assert_called_once_with(self.report_version.id)
        mock_get_emissions.assert_called_once_with(self.report_version.id)

    @patch("reporting.service.compliance_service.ComplianceService.get_emissions_attributable_for_reporting")
    @patch(
        "reporting.service.report_additional_data.ReportAdditionalDataService.get_registration_purpose_by_version_id"
    )
    def test_get_report_needs_verification_returns_false_for_reporting_operation_with_low_emissions(
        self, mock_get_registration_purpose, mock_get_emissions
    ):
        """
        Test that the service returns false for report of Reporting_Operation with attributable emissions exceeding the verification threshold
        """

        # Arrange: Simulate a reporting operation
        mock_get_registration_purpose.return_value = "Reporting Operation"
        # Simulate low attributable emissions below the verification threshold
        mock_get_emissions.return_value = Decimal('20000000')

        # Act: Call the method to determine if the report needs verification
        result = ReportVerificationService.get_report_needs_verification(self.report_version.id)

        # Assert: The method should correctly determine no verification is needed
        self.assertFalse(result)
        # Verify the mocked methods were called as expected
        mock_get_registration_purpose.assert_called_once_with(self.report_version.id)
        mock_get_emissions.assert_called_once_with(self.report_version.id)

    def test_save_report_verification_saves_record(self):
        """
        Test that the service updates or creates ReportVerification instance
        for a given report version ID.
        """

        # Arrange: Prepare input data
        data = ReportVerificationIn(
            verification_body_name="Verifier Co.",
            accredited_by="ANAB",  # AccreditedBy choices: "ANAB" or "SCC"
            scope_of_verification="B.C. OBPS Annual Report",  # ScopeOfVerification choices: "B.C. OBPS Annual Report"; "Supplementary Report"; "Corrected Report"
            threats_to_independence=False,
            verification_conclusion="Positive",  # VerificationConclusion choices: "Positive", "Modified", "Negative"
            visit_name="Site Visit 1",
            visit_type="Virtual",  # VisitType choices: "In person", "Virtual"
            other_facility_name="Additional Facility",
            other_facility_coordinates="45.4215,-75.6972",
        )

        # Act: Call the service to save report verification data
        report_verification = ReportVerificationService.save_report_verification(
            version_id=self.report_version.id,
            data=data,
        )

        # Assert: Verify the report verification record is created with the correct data
        self.assertIsNotNone(report_verification)
        self.assertEqual(report_verification.report_version, self.report_version)
        self.assertEqual(report_verification.verification_body_name, data.verification_body_name)
        self.assertEqual(report_verification.accredited_by, data.accredited_by)
        self.assertEqual(report_verification.scope_of_verification, data.scope_of_verification)
        self.assertEqual(report_verification.threats_to_independence, data.threats_to_independence)
        self.assertEqual(report_verification.verification_conclusion, data.verification_conclusion)
        self.assertEqual(report_verification.visit_name, data.visit_name)
        self.assertEqual(report_verification.visit_type, data.visit_type)
        self.assertEqual(report_verification.other_facility_name, data.other_facility_name)
        self.assertEqual(report_verification.other_facility_coordinates, data.other_facility_coordinates)
