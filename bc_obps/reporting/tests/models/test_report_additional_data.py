from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.bakers import report_additional_data_baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportAdditionalDataTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_additional_data_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("capture_emissions", "capture emissions", None, None),
            ("emissions_on_site_use", "emissions on site use", None, None),
            (
                "emissions_on_site_sequestration",
                "emissions on site sequestration",
                None,
                None,
            ),
            ("emissions_off_site_transfer", "emissions off site transfer", None, None),
            ("electricity_generated", "electricity generated", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_additional_data")
