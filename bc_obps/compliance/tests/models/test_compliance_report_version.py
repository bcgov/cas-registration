from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ComplianceReportVersionTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_report_version')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_report", "compliance report", None, None),
            ("report_compliance_summary", "report compliance summary", None, None),
            ("excess_emissions_delta_from_previous", "excess emissions delta from previous", None, None),
            ("credited_emissions_delta_from_previous", "credited emissions delta from previous", None, None),
            ("status", "status", None, None),
            ("compliance_earned_credit", "compliance earned credit", None, None),
            ("obligation", "compliance obligation", None, None),
            ("is_supplementary", "is supplementary", None, None),
        ]
