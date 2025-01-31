from common.tests.utils.helpers import BaseTestCase
from django.core.exceptions import ValidationError
from model_bakery import baker
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.bakers import report_version_baker


class ReportVersionTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_version_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report", "report", None, None),
            ("report_type", "report type", None, None),
            ("is_latest_submitted", "is latest submitted", None, None),
            ("status", "status", 1000, None),
            ("facility_reports", "facility report", None, 0),
            ("report_operation", "report operation", None, None),
            ("reportactivity_records", "report activity", None, 0),
            ("reportemission_records", "report emission", None, 0),
            ("report_person_responsible", "report person responsible", None, None),
            ("report_additional_data", "report additional data", None, None),
            (
                "report_non_attributable_emissions",
                "report non attributable emissions",
                None,
                None,
            ),
            ("reportfuel_records", "report fuel", None, 0),
            ("reportmethodology_records", "report methodology", None, 0),
            ("reportsourcetype_records", "report source type", None, 0),
            ("reportunit_records", "report unit", None, 0),
            ("report_products", "report product", None, 0),
            ("report_verification", "report verification", None, None),
            ("report_new_entrant", "report new entrant", None, None),
            ("report_attachments", "report attachment", None, 0),
            ("reportproductemissionallocation_records", "report product emission allocation", None, 0),
            ('report_operation_representatives', 'report operation representative', None, None),
        ]

    def test_unique_draft_version_per_report(self):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version_1 = baker.make_recipe(
            "reporting.tests.utils.report_version", status="Draft", report_id=report.id
        )

        with pytest.raises(
            ValidationError,
            match="Only one draft report version can exist on a report.",
        ):
            baker.make_recipe(
                "reporting.tests.utils.report_version",
                status="Draft",
                report_id=report.id,
            )

        report_version_1.status = "Submitted"
        report_version_1.save()

        baker.make_recipe(
            "reporting.tests.utils.report_version",
            status="Draft",
            report_id=report.id,
        )
