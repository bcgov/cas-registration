from common.tests.utils.helpers import BaseTestCase
from compliance.models import ComplianceEarnedCredit
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe, make


class ComplianceEarnedCreditTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make(
            ComplianceEarnedCredit,
            compliance_report_version=make_recipe("compliance.tests.utils.compliance_report_version"),
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_report_version", "compliance report version", None, None),
            ("earned_credits_amount", "earned credits amount", None, None),
            ("issuance_status", "issuance status", None, None),
            ("issued_date", "issued date", None, None),
            ("issued_by", "issued by", None, None),
        ]
