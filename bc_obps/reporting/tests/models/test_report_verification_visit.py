from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportVerificationVisitTest(BaseTestCase):
    """
    Test case for the ReportVerification model to verify its fields and functionality.
    """

    @classmethod
    def setUpTestData(cls):
        # Create a test instance of ReportVerification using the baker
        cls.test_object = make_recipe("reporting.tests.utils.report_verification_visit")
        # Define the field data to validate in tests
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_verification", "report verification", None, None),
            ("visit_name", "visit name", None, None),
            ("visit_type", "visit type", None, None),
            ("visit_coordinates", "visit coordinates", None, None),
            ("is_other_visit", "is other visit", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_verification_visit",
            "visit_name",
            "report_verification__report_version",
        )
