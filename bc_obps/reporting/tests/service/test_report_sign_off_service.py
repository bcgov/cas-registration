import datetime
from django.test import TestCase
from reporting.models.report_sign_off import ReportSignOff
from reporting.service.report_sign_off_service import ReportSignOffService
import pytest
from model_bakery.baker import make_recipe


@pytest.mark.django_db
class TestReportSignOffService(TestCase):
    def test_save_report_sign_off(self):
        # Arrange
        data = {
            "acknowledgement_of_review": True,
            "acknowledgement_of_records": True,
            "acknowledgement_of_information": True,
            "acknowledgement_of_impact": True,
            "signature": "signature",
        }

        report_version = make_recipe(
            'reporting.tests.utils.report_version',
            report__reporting_year_id=2025,
        )

        # Act
        ReportSignOffService.save_report_sign_off(report_version.id, data)
        sign_off = ReportSignOff.objects.get(report_version_id=report_version.id)

        # Assert
        self.assertEqual(sign_off.acknowledgement_of_review, data["acknowledgement_of_review"])
        self.assertEqual(sign_off.acknowledgement_of_records, data["acknowledgement_of_records"])
        self.assertEqual(sign_off.acknowledgement_of_information, data["acknowledgement_of_information"])
        self.assertEqual(sign_off.acknowledgement_of_impact, data["acknowledgement_of_impact"])
        self.assertEqual(sign_off.signature, data["signature"])
        self.assertIsNotNone(sign_off.signing_date)

    def test_get_report_sign_off(self):
        # Arrange
        data = {
            "acknowledgement_of_review": True,
            "acknowledgement_of_records": True,
            "acknowledgement_of_information": True,
            "acknowledgement_of_impact": True,
            "signature": "signature",
        }
        report_version = make_recipe(
            'reporting.tests.utils.report_version',
            report__reporting_year_id=2025,
        )

        ReportSignOffService.save_report_sign_off(report_version.id, data)
        # Act
        sign_off = ReportSignOffService.get_report_sign_off(report_version.id)
        # Assert
        self.assertEqual(sign_off.acknowledgement_of_review, data["acknowledgement_of_review"])
        self.assertEqual(sign_off.acknowledgement_of_records, data["acknowledgement_of_records"])
        self.assertEqual(sign_off.acknowledgement_of_information, data["acknowledgement_of_information"])
        self.assertEqual(sign_off.acknowledgement_of_impact, data["acknowledgement_of_impact"])
        self.assertEqual(sign_off.signature, data["signature"])
        self.assertEqual(sign_off.date, datetime.datetime.now().strftime("%B %d, %Y"))
