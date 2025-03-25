from django.test import TestCase
from reporting.schema.report_sign_off import ReportSignOffAcknowledgements, ReportSignOffIn
from reporting.models.report_sign_off import ReportSignOff
from reporting.service.report_sign_off_service import ReportSignOffService
import pytest
from model_bakery.baker import make_recipe


@pytest.mark.django_db
class TestReportSignOffService(TestCase):
    def test_save_report_sign_off(self):
        # Arrange
        data = ReportSignOffIn(
            acknowledgements=ReportSignOffAcknowledgements(
                acknowledgement_of_review=True,
                acknowledgement_of_records=True,
                acknowledgement_of_information=True,
                acknowledgement_of_possible_costs=True,
                acknowledgement_of_new_version=None,
            ),
            signature="signature",
        )
        report_version = make_recipe(
            'reporting.tests.utils.report_version',
            report__reporting_year_id=2025,
        )

        # Act
        ReportSignOffService.save_report_sign_off(report_version.id, data)
        sign_off = ReportSignOff.objects.get(report_version_id=report_version.id)

        # Assert
        self.assertEqual(sign_off.acknowledgement_of_review, data.acknowledgements.acknowledgement_of_review)
        self.assertEqual(sign_off.acknowledgement_of_records, data.acknowledgements.acknowledgement_of_records)
        self.assertEqual(sign_off.acknowledgement_of_information, data.acknowledgements.acknowledgement_of_information)
        self.assertEqual(
            sign_off.acknowledgement_of_possible_costs, data.acknowledgements.acknowledgement_of_possible_costs
        )
        self.assertEqual(sign_off.signature, data.signature)
        self.assertIsNotNone(sign_off.signing_date)
