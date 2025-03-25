from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportSignOffTest(BaseTestCase):
    """
    Test case for the ReportSignOff model to verify its fields and functionality.
    """

    @classmethod
    def setUpTestData(cls):
        # Create a test instance of ReportSignOff using the baker
        cls.test_object = make_recipe("reporting.tests.utils.report_sign_off")
        # Define the field data to validate in tests
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("acknowledgement_of_review", "acknowledgement of review", None, None),
            ("acknowledgement_of_records", "acknowledgement of records", None, None),
            ("acknowledgement_of_information", "acknowledgement of information", None, None),
            ("acknowledgement_of_possible_costs", "acknowledgement of possible costs", None, None),
            ("acknowledgement_of_new_version", "acknowledgement of new version", None, None),
            ("signature", "signature", None, None),
            ("signing_date", "signing date", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_sign_off")
