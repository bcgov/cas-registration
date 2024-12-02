from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.service.report_verification_service import ReportVerificationService
from reporting.schema.report_verification import ReportVerificationIn


class TestReportVerificationService(TestCase):
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
