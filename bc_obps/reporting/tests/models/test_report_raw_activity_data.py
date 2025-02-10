from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_raw_activity_data_baker


class ReportRawActivityDataModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_raw_activity_data_baker()

        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("facility_report", "facility report", None, None),
            ("activity", "activity", None, None),
            ("json_data", "json data", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_raw_activity_data",
            path_to_report_version="facility_report__report_version",
        )
