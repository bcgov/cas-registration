from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
import pytest
from compliance.models import ComplianceEarnedCredits
from model_bakery.baker import make_recipe

pytestmark = pytest.mark.django_db  # This is used to mark a test function as requiring the database


class TestComplianceEarnedCreditsService:
    def setup_method(self):
        self.test_user_guid = make_recipe('registration.tests.utils.industry_operator_user').user_guid

    def test_get_earned_credits_by_report_version(self):
        # Arrange
        earned_credits = make_recipe('compliance.tests.utils.compliance_earned_credits', earned_credits_amount=100)

        # Assert
        result = ComplianceEarnedCreditsService.get_earned_credits_data_by_report_version(
            earned_credits.compliance_report_version_id
        )
        assert result.earned_credits_amount == 100
        assert result.issuance_status == ComplianceEarnedCredits.IssuanceStatus.CREDITS_NOT_ISSUED
