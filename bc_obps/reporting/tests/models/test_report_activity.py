from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.report_activity import ReportActivity
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from model_bakery import baker


class ReportActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        report_version = report_version_baker()

        cls.test_object = ReportActivity.objects.create(
            report_version=report_version,
            json_data="{'test': 1}",
            activity_base_schema=ActivityJsonSchema.objects.first(),
            activity=ActivityJsonSchema.objects.first().activity,
            facility_report=baker.make_recipe("reporting.tests.utils.facility_report"),
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("activity_base_schema", "activity base schema", None, None),
            ("activity", "activity", None, None),
            ("reportsourcetype_records", "report source type", None, 0),
            ("facility_report", "facility report", None, None),
        ]

    def test_report_activity_immutable_after_report_version_submitted(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        report_activity = baker.make_recipe(
            "reporting.tests.utils.report_activity",
            report_version=report_version,
            facility_report__report_version=report_version,
        )

        report_activity.json_data = "{'test': 'allow change'}"
        report_activity.save()

        report_version.status = "Submitted"
        report_version.save()

        with pytest.raises(
            ProgrammingError,
            match="reportactivity record is immutable after a report version has been submitted",
        ):
            report_activity.json_data = "{'test': 'forbid change'}"
            report_activity.save()
