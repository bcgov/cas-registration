from common.lib import pgtrigger
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
import pytest
from compliance.models import ComplianceEarnedCredit
from model_bakery.baker import make_recipe
from decimal import Decimal
from common.exceptions import UserError

pytestmark = pytest.mark.django_db  # This is used to mark a test function as requiring the database


class TestComplianceEarnedCreditsService:
    def setup_method(self):
        self.test_user_guid = make_recipe('registration.tests.utils.industry_operator_user').user_guid

    def test_get_earned_credits_by_report_version(self):
        # Arrange
        earned_credits = make_recipe('compliance.tests.utils.compliance_earned_credit', earned_credits_amount=100)

        # Act
        result = ComplianceEarnedCreditsService.get_earned_credit_data_by_report_version(
            earned_credits.compliance_report_version_id
        )

        # Assert
        assert result is not None
        assert result.earned_credits_amount == 100
        assert result.issuance_status == ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED

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

    def test_validate_earned_credit_for_bccr_project_success(self):
        # Arrange
        earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name=None,
        )

        # Act & Assert
        ComplianceEarnedCreditsService.validate_earned_credit_for_bccr_project(
            earned_credit.compliance_report_version_id
        )

    def test_validate_earned_credit_for_bccr_project_no_record_found(self):
        # Arrange
        compliance_report_version = make_recipe('compliance.tests.utils.compliance_report_version')
        # No earned credit record created

        # Act & Assert
        with pytest.raises(UserError, match="No earned credit record found for this compliance report version"):
            ComplianceEarnedCreditsService.validate_earned_credit_for_bccr_project(compliance_report_version.id)

    def test_validate_earned_credit_for_bccr_project_wrong_status(self):
        # Arrange
        with pgtrigger.ignore('compliance.ComplianceEarnedCredit:restrict_bccr_trading_name_unless_not_issued'):
            earned_credit = make_recipe(
                'compliance.tests.utils.compliance_earned_credit',
                issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,  # Wrong state
                bccr_trading_name=None,
            )

        # Act & Assert
        with pytest.raises(UserError, match="This compliance report has already requested credits issuance."):
            ComplianceEarnedCreditsService.validate_earned_credit_for_bccr_project(
                earned_credit.compliance_report_version_id
            )

    def test_validate_earned_credit_for_bccr_project_already_has_trading_name(self):
        # Arrange
        earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="Existing Trading Name",  # Already has trading name
        )

        # Act & Assert
        with pytest.raises(UserError, match="Earned credit already has a BCCR trading name"):
            ComplianceEarnedCreditsService.validate_earned_credit_for_bccr_project(
                earned_credit.compliance_report_version_id
            )

    def test_validate_earned_credit_for_bccr_project_all_statuses_except_correct_one(self):
        # Arrange
        invalid_statuses = [
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.AWAITING_APPROVAL,
            ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_ISSUED,
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ]

        for status in invalid_statuses:
            with pgtrigger.ignore('compliance.ComplianceEarnedCredit:restrict_bccr_trading_name_unless_not_issued'):
                earned_credit = make_recipe(
                    'compliance.tests.utils.compliance_earned_credit',
                    issuance_status=status,
                    bccr_trading_name=None,
                )

            # Act & Assert
            with pytest.raises(UserError, match="This compliance report has already requested credits issuance."):
                ComplianceEarnedCreditsService.validate_earned_credit_for_bccr_project(
                    earned_credit.compliance_report_version_id
                )

    def test_update_earned_credit_for_bccr_project_success(self):
        # Arrange
        earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name=None,
        )

        # Act
        ComplianceEarnedCreditsService.update_earned_credit_for_bccr_project(
            earned_credit.compliance_report_version_id, "New Trading Name"
        )

        # Assert
        earned_credit.refresh_from_db()
        assert earned_credit.bccr_trading_name == "New Trading Name"
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED

    def test_update_earned_credit_for_bccr_project_no_record_found(self):
        # Arrange
        compliance_report_version = make_recipe('compliance.tests.utils.compliance_report_version')
        # No earned credit record created

        # Act & Assert
        with pytest.raises(UserError, match="No earned credit record found for this compliance report version"):
            ComplianceEarnedCreditsService.update_earned_credit_for_bccr_project(
                compliance_report_version.id, "Test Trading Name"
            )

    def test_update_earned_credit_for_bccr_project_preserves_other_fields(self):
        # Arrange
        original_earned_credits_amount = 150
        original_issued_date = "2024-01-15"

        earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name=None,
            earned_credits_amount=original_earned_credits_amount,
            issued_date=original_issued_date,
        )

        # Act
        ComplianceEarnedCreditsService.update_earned_credit_for_bccr_project(
            earned_credit.compliance_report_version_id, "New Trading Name"
        )

        # Assert
        earned_credit.refresh_from_db()
        assert earned_credit.bccr_trading_name == "New Trading Name"
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        assert earned_credit.earned_credits_amount == original_earned_credits_amount
        assert str(earned_credit.issued_date) == original_issued_date
