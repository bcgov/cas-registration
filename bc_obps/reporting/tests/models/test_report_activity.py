from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.report_activity import ReportActivity
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from reporting.tests.utils.report_data_bakers import facility_report_baker


class ReportActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        report_version = report_version_baker()

        cls.test_object = ReportActivity.objects.create(
            report_version=report_version,
            json_data="{'test': 1}",
            activity_base_schema=ActivityJsonSchema.objects.first(),
            activity=ActivityJsonSchema.objects.first().reporting_activity,
            facility_report=facility_report_baker(report_version=report_version),
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("activity_base_schema", "activity base schema", None, None),
            ("activity", "activity", None, None),
            ("reportsourcetype_records", "report source type", None, 0),
            ("facility_report", "facility report", None, None),
        ]
