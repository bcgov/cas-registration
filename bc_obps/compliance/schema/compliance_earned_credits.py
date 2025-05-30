from compliance.models.compliance_earned_credits import ComplianceEarnedCredits
from ninja import ModelSchema


class ComplianceEarnedCreditsOut(ModelSchema):
    class Meta:
        model = ComplianceEarnedCredits
        fields = ["id", "earned_credits_amount", "issuance_status", "bccr_trading_name", "analyst_comment", "director_comment"]
