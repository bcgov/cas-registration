from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportChange(BaseTestCase):
    """
    Test case for the ReportChange model to verify its fields and functionality.
    """

    @classmethod
    def setUpTestData(cls):
        # Create a test instance of ReportChange
        cls.test_object = make_recipe("reporting.tests.utils.report_change")
        # Define the field data to validate in tests
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("reason_for_change", "reason for change", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_change",
            "reason_for_change",
        )
