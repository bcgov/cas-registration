from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
import pytest
from compliance.models import ComplianceEarnedCredit
from model_bakery.baker import make_recipe
from decimal import Decimal

pytestmark = pytest.mark.django_db  # This is used to mark a test function as requiring the database


class TestComplianceEarnedCreditsService:
    def setup_method(self):
        self.test_user_guid = make_recipe('registration.tests.utils.industry_operator_user').user_guid

    def test_get_earned_credits_by_report_version(self):
        # Arrange
        earned_credits = make_recipe('compliance.tests.utils.compliance_earned_credit', earned_credits_amount=100)

        # Assert
        result = ComplianceEarnedCreditsService.get_earned_credits_data_by_report_version(
            earned_credits.compliance_report_version_id
        )
        assert result.earned_credits_amount == 100
        assert result.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

    def test_create_earned_credits_record(self):
        report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            credited_emissions=Decimal('100.9898'),
            excess_emissions=0,
        )
        compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', report_compliance_summary=report_compliance_summary
        )
        result = ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)

        assert result.earned_credits_amount == 100
