from common.lib import pgtrigger
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
import pytest
from compliance.models import ComplianceEarnedCredit
from model_bakery.baker import make_recipe
from decimal import Decimal
from common.exceptions import UserError
from unittest.mock import patch

pytestmark = pytest.mark.django_db


class TestComplianceEarnedCreditsService:
    def setup_method(self):
        self.bccr_trading_name = "New Trading Name"
        self.bccr_holding_account_id = "123456789012345"
        self.industry_user = make_recipe('registration.tests.utils.industry_operator_user')
        self.cas_analyst = make_recipe('registration.tests.utils.cas_analyst')
        self.cas_director = make_recipe('registration.tests.utils.cas_director')
        self.earned_credit_base = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            bccr_trading_name=self.bccr_trading_name,
            bccr_holding_account_id=self.bccr_holding_account_id,
        )
        self.earned_credit_no_bccr_fields = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            bccr_trading_name=None,
            bccr_holding_account_id=None,
        )

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

    def test_update_earned_credit_industry_user_success(self):
        # Arrange
        earned_credit = self.earned_credit_no_bccr_fields
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        earned_credit.save()

        payload = {"bccr_trading_name": self.bccr_trading_name, "bccr_holding_account_id": self.bccr_holding_account_id}

        # Act
        result = ComplianceEarnedCreditsService.update_earned_credit(
            earned_credit.compliance_report_version_id, payload, self.industry_user
        )

        # Assert
        earned_credit.refresh_from_db()
        assert earned_credit.bccr_trading_name == self.bccr_trading_name
        assert earned_credit.bccr_holding_account_id == self.bccr_holding_account_id
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        assert result == earned_credit

    def test_update_earned_credit_industry_user_invalid_status(self):
        # Arrange
        with pgtrigger.ignore("compliance.ComplianceEarnedCredit:restrict_bccr_fields_unless_not_issued"):
            earned_credit = make_recipe(
                'compliance.tests.utils.compliance_earned_credit',
                issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,  # Invalid status for industry user
                bccr_trading_name=None,
            )
        payload = {"bccr_trading_name": self.bccr_trading_name, "bccr_holding_account_id": self.bccr_holding_account_id}

        # Act & Assert
        with pytest.raises(
            UserError,
            match="Credits can only be updated by industry users when the user has requested issuance or changes are required",
        ):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.industry_user
            )

    def test_update_earned_credit_industry_user_missing_bccr_trading_name(self):
        # Arrange
        earned_credit = self.earned_credit_no_bccr_fields
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        earned_credit.save()

        payload = {"bccr_holding_account_id": self.bccr_holding_account_id}  # Missing bccr_trading_name

        # Act & Assert
        with pytest.raises(
            UserError, match="BCCR Trading Name and Holding Account ID are required to update earned credits"
        ):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.industry_user
            )

    def test_update_earned_credit_industry_user_missing_bccr_holding_account_id(self):
        # Arrange
        earned_credit = self.earned_credit_no_bccr_fields
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        earned_credit.save()

        payload = {"bccr_trading_name": self.bccr_trading_name}  # Missing bccr_holding_account_id

        # Act & Assert
        with pytest.raises(
            UserError, match="BCCR Trading Name and Holding Account ID are required to update earned credits"
        ):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.industry_user
            )

    def test_update_earned_credit_industry_user_missing_both_bccr_fields(self):
        # Arrange
        earned_credit = self.earned_credit_no_bccr_fields
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        earned_credit.save()

        payload = {}  # Missing both bccr fields

        # Act & Assert
        with pytest.raises(
            UserError, match="BCCR Trading Name and Holding Account ID are required to update earned credits"
        ):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.industry_user
            )

    def test_update_earned_credit_cas_analyst_success(self):
        # Arrange
        earned_credit = self.earned_credit_base
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.analyst_suggestion = None
        earned_credit.analyst_comment = None
        earned_credit.save()

        payload = {
            "analyst_suggestion": ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE.value,
            "analyst_comment": "Looks good to approve",
        }

        # Act
        result = ComplianceEarnedCreditsService.update_earned_credit(
            earned_credit.compliance_report_version_id, payload, self.cas_analyst
        )

        # Assert
        earned_credit.refresh_from_db()
        assert earned_credit.analyst_suggestion == ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE
        assert earned_credit.analyst_comment == "Looks good to approve"
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        assert result == earned_credit

    def test_update_earned_credit_cas_analyst_changes_required(self):
        # Arrange
        earned_credit = self.earned_credit_base
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.analyst_suggestion = None
        earned_credit.analyst_comment = None
        earned_credit.save()

        payload = {
            "analyst_suggestion": ComplianceEarnedCredit.AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID.value,
            "analyst_comment": "Please update the holding account ID",
        }

        # Act
        result = ComplianceEarnedCreditsService.update_earned_credit(
            earned_credit.compliance_report_version_id, payload, self.cas_analyst
        )

        # Assert
        earned_credit.refresh_from_db()
        assert (
            earned_credit.analyst_suggestion
            == ComplianceEarnedCredit.AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID
        )
        assert earned_credit.analyst_comment == "Please update the holding account ID"
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED
        assert result == earned_credit

    def test_update_earned_credit_cas_analyst_declined(self):
        # Arrange
        earned_credit = self.earned_credit_base
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.analyst_suggestion = None
        earned_credit.analyst_comment = None
        earned_credit.save()

        payload = {
            "analyst_suggestion": ComplianceEarnedCredit.AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT.value,
            "analyst_comment": "Additional documentation required",
        }

        # Act
        result = ComplianceEarnedCreditsService.update_earned_credit(
            earned_credit.compliance_report_version_id, payload, self.cas_analyst
        )

        # Assert
        earned_credit.refresh_from_db()
        assert (
            earned_credit.analyst_suggestion == ComplianceEarnedCredit.AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT
        )
        assert earned_credit.analyst_comment == "Additional documentation required"
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.DECLINED
        assert result == earned_credit

    def test_update_earned_credit_cas_analyst_invalid_status(self):
        # Arrange
        earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,  # Invalid status for analyst
            analyst_suggestion=None,
            analyst_comment=None,
        )
        payload = {
            "analyst_suggestion": ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE.value,
            "analyst_comment": "Looks good to approve",
        }

        # Act & Assert
        with pytest.raises(
            UserError, match="Credits can only be updated by CAS analysts when the user has requested issuance"
        ):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.cas_analyst
            )

    @patch('compliance.service.earned_credits_service.bccr_project_service')
    @patch('compliance.service.earned_credits_service.bccr_credit_issuance_service')
    def test_update_earned_credit_cas_director_approve_success(
        self, mock_credit_issuance_service, mock_project_service
    ):
        # Arrange
        earned_credit = self.earned_credit_base
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.analyst_suggestion = ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE
        earned_credit.director_comment = None
        earned_credit.save()

        payload = {
            "director_decision": ComplianceEarnedCredit.IssuanceStatus.APPROVED.value,
            "director_comment": "Approved for issuance",
        }
        mock_project_service.create_project.return_value = {"id": "project_123"}

        # Act
        result = ComplianceEarnedCreditsService.update_earned_credit(
            earned_credit.compliance_report_version_id, payload, self.cas_director
        )

        # Assert
        earned_credit.refresh_from_db()
        assert earned_credit.director_comment == "Approved for issuance"
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.APPROVED
        assert result == earned_credit
        assert earned_credit.issued_date is not None
        assert earned_credit.issued_by is not None
        mock_project_service.create_project.assert_called_once()
        mock_credit_issuance_service.issue_credits.assert_called_once()

    @patch('compliance.service.earned_credits_service.bccr_project_service')
    @patch('compliance.service.earned_credits_service.bccr_credit_issuance_service')
    def test_update_earned_credit_cas_director_decline_success(
        self, mock_credit_issuance_service, mock_project_service
    ):
        # Arrange
        earned_credit = self.earned_credit_base
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.analyst_suggestion = ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE
        earned_credit.director_comment = None
        earned_credit.save()

        payload = {
            "director_decision": ComplianceEarnedCredit.IssuanceStatus.DECLINED.value,
            "director_comment": "Declined due to insufficient documentation",
        }

        # Act
        result = ComplianceEarnedCreditsService.update_earned_credit(
            earned_credit.compliance_report_version_id, payload, self.cas_director
        )

        # Assert
        earned_credit.refresh_from_db()
        assert earned_credit.director_comment == "Declined due to insufficient documentation"
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.DECLINED
        assert result == earned_credit
        assert earned_credit.issued_date is not None
        assert earned_credit.issued_by is not None
        mock_project_service.create_project.assert_not_called()
        mock_credit_issuance_service.issue_credits.assert_not_called()

    def test_update_earned_credit_cas_director_missing_bccr_fields(self):
        # Arrange
        with pgtrigger.ignore("compliance.ComplianceEarnedCredit:restrict_bccr_fields_unless_not_issued"):
            earned_credit = make_recipe(
                'compliance.tests.utils.compliance_earned_credit',
                issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
                bccr_holding_account_id=None,  # Missing holding account ID
                analyst_suggestion=ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE,
            )
        payload = {
            "director_decision": ComplianceEarnedCredit.IssuanceStatus.APPROVED.value,
            "director_comment": "Approved for issuance",
        }

        # Act & Assert
        with pytest.raises(
            UserError, match="BCCR Trading Name and Holding Account ID are required to update earned credits"
        ):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.cas_director
            )

    def test_update_earned_credit_cas_director_analyst_not_approved(self):
        # Arrange
        earned_credit = self.earned_credit_base
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.analyst_suggestion = (
            ComplianceEarnedCredit.AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID
        )  # Not ready to approve
        earned_credit.save()

        payload = {
            "director_decision": ComplianceEarnedCredit.IssuanceStatus.APPROVED.value,
            "director_comment": "Approved for issuance",
        }

        # Act & Assert
        with pytest.raises(UserError, match="Credits cannot be issued until analyst has reviewed and approved"):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.cas_director
            )

    def test_update_earned_credit_cas_director_invalid_status(self):
        # Arrange
        earned_credit = self.earned_credit_base
        earned_credit.issuance_status = (
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        )  # Invalid status for director
        earned_credit.analyst_suggestion = ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE
        earned_credit.save()

        payload = {
            "director_decision": ComplianceEarnedCredit.IssuanceStatus.APPROVED.value,
            "director_comment": "Approved for issuance",
        }

        # Act & Assert
        with pytest.raises(
            UserError, match="Credits can only be updated by CAS directors when the user has requested issuance"
        ):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.cas_director
            )

    def test_update_earned_credit_invalid_director_decision(self):
        # Arrange
        earned_credit = self.earned_credit_base
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.analyst_suggestion = ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE
        earned_credit.save()

        payload = {
            "director_decision": "INVALID_STATUS",
            "director_comment": "Approved for issuance",
        }  # Invalid decision

        # Act & Assert
        with pytest.raises(UserError, match="Invalid director decision provided"):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, self.cas_director
            )

    def test_update_earned_credit_unauthorized_user(self):
        # Arrange
        unauthorized_user = make_recipe('registration.tests.utils.cas_admin')  # Not a CAS user
        earned_credit = self.earned_credit_no_bccr_fields
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        earned_credit.save()

        payload = {"bccr_trading_name": "New Trading Name", "bccr_holding_account_id": "123456789012345"}

        # Act & Assert
        with pytest.raises(UserError, match="This user is not authorized to update earned credit"):
            ComplianceEarnedCreditsService.update_earned_credit(
                earned_credit.compliance_report_version_id, payload, unauthorized_user
            )

    def test_update_earned_credit_no_record_found(self):
        # Arrange
        compliance_report_version = make_recipe('compliance.tests.utils.compliance_report_version')
        # No earned credit record created
        payload = {"bccr_trading_name": self.bccr_trading_name, "bccr_holding_account_id": self.bccr_holding_account_id}

        # Act & Assert
        with pytest.raises(UserError, match="No earned credit record found for this compliance report version"):
            ComplianceEarnedCreditsService.update_earned_credit(
                compliance_report_version.id, payload, self.industry_user
            )

    def test_update_earned_credit_preserves_other_fields(self):
        # Arrange
        original_earned_credits_amount = 150
        original_issued_date = "2024-01-15"

        earned_credit = self.earned_credit_no_bccr_fields
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        earned_credit.earned_credits_amount = original_earned_credits_amount
        earned_credit.issued_date = original_issued_date
        earned_credit.save()

        payload = {"bccr_trading_name": self.bccr_trading_name, "bccr_holding_account_id": self.bccr_holding_account_id}

        # Act
        ComplianceEarnedCreditsService.update_earned_credit(
            earned_credit.compliance_report_version_id, payload, self.industry_user
        )

        # Assert
        earned_credit.refresh_from_db()
        assert earned_credit.bccr_trading_name == self.bccr_trading_name
        assert earned_credit.bccr_holding_account_id == self.bccr_holding_account_id
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        assert earned_credit.earned_credits_amount == original_earned_credits_amount
        assert str(earned_credit.issued_date) == original_issued_date
