from django.test import TestCase
from reporting.models.report_sign_off import ReportSignOff
import pytest
from model_bakery.baker import make_recipe

from reporting.service.report_sign_off_service import (
    ReportSignOffData,
    ReportSignOffAcknowledgements,
    ReportSignOffService,
)


@pytest.mark.django_db
class TestReportSignOffService(TestCase):
    def test_save_report_sign_off(self):
        # Arrange
        data = ReportSignOffData(
            acknowledgements=ReportSignOffAcknowledgements(
                acknowledgement_of_review=True,
                acknowledgement_of_records=True,
                acknowledgement_of_information=True,
                acknowledgement_of_errors=None,
                acknowledgement_of_possible_costs=True,
                acknowledgement_of_new_version=None,
                acknowledgement_of_corrections=None,
                acknowledgement_of_certification=None,
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
        fields_to_check = {
            "acknowledgement_of_review": "acknowledgement_of_review",
            "acknowledgement_of_records": "acknowledgement_of_records",
            "acknowledgement_of_information": "acknowledgement_of_information",
            "acknowledgement_of_possible_costs": "acknowledgement_of_possible_costs",
        }

        for sign_off_field, data_field in fields_to_check.items():
            self.assertEqual(
                getattr(sign_off, sign_off_field),
                getattr(data.acknowledgements, data_field),
            )

        self.assertEqual(sign_off.signature, data.signature)
        self.assertIsNotNone(sign_off.signing_date)
