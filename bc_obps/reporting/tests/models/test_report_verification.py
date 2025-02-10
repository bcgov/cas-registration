from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportVerificationTest(BaseTestCase):
    """
    Test case for the ReportVerification model to verify its fields and functionality.
    """

    @classmethod
    def setUpTestData(cls):
        # Create a test instance of ReportVerification using the baker
        cls.test_object = make_recipe("reporting.tests.utils.report_verification")
        # Define the field data to validate in tests
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("verification_body_name", "verification body name", None, None),
            ("accredited_by", "accredited by", None, None),
            ("scope_of_verification", "scope of verification", None, None),
            ("threats_to_independence", "threats to independence", None, None),
            ("verification_conclusion", "verification conclusion", None, None),
            ("report_verification_visits", "report verification visit", None, 0),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_verification")
