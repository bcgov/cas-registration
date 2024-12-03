from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ReportVerificationTest(BaseTestCase):
    """
    Test case for the ReportVerification model to verify its fields and functionality.
    """

    @classmethod
    def setUpTestData(cls):
        # Create a test instance of ReportVerification using the baker
        cls.test_object = make_recipe('reporting.tests.utils.report_verification')
        # Define the field data to validate in tests
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("verification_body_name", "verification body name", None, None),
            ("accredited_by", "accredited by", None, None),
            ("scope_of_verification", "scope of verification", None, None),
            ("threats_to_independence", "threats to independence", None, None),
            ("verification_conclusion", "verification conclusion", None, None),
            ("visit_name", "visit name", None, None),
            ("visit_type", "visit type", None, None),
            ("other_facility_name", "other facility name", None, None),
            ("other_facility_coordinates", "other facility coordinates", None, None),
        ]