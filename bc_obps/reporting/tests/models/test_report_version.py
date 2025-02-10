from common.tests.utils.helpers import BaseTestCase
from common.tests.utils.model_inspection import get_cascading_models
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.utils import ProgrammingError
from model_bakery import baker
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_version import ReportVersion
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
            (
                "reportproductemissionallocation_records",
                "report product emission allocation",
                None,
                0,
            ),
            (
                "report_operation_representatives",
                "report operation representative",
                None,
                None,
            ),
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

    def test_submitted_report_version_is_immutable(self):
        self.test_object.status = "Submitted"
        # Succeeds
        self.test_object.save()

        with transaction.atomic():
            with pytest.raises(
                ProgrammingError,
                match="pgtrigger: Cannot update rows from report_version table",
            ):
                self.test_object.status = "Draft"
                self.test_object.save()

    def test_all_report_version_models_have_the_immutability_trigger(self):
        report_version_models = get_cascading_models(ReportVersion)

        missing_triggers = [
            m.__name__
            for m in report_version_models
            if not any(trigger.name == "immutable_report_version" for trigger in m._meta.triggers)
        ]

        assert (
            missing_triggers == []
        ), f"{', '.join(missing_triggers)} models are missing the `immutable_report_version` trigger"
