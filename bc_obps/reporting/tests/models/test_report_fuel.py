from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_fuel_baker


class ReportFuelModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_fuel_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("report_source_type", "report source type", None, None),
            ("report_unit", "report unit", None, None),
            ("fuel_type", "fuel type", None, None),
            ("reportemission_records", "report emission", None, 0),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_fuel")
