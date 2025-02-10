from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_source_type_baker


class ReportSourceTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_source_type_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            (
                "activity_source_type_base_schema",
                "activity source type base schema",
                None,
                None,
            ),
            ("source_type", "source type", None, None),
            ("report_activity", "report activity", None, None),
            ("reportunit_records", "report unit", None, 0),
            ("reportfuel_records", "report fuel", None, 0),
            ("reportemission_records", "report emission", None, 0),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_source_type")
