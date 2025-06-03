from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from ninja import ModelSchema


class ComplianceEarnedCreditsOut(ModelSchema):
    class Meta:
        model = ComplianceEarnedCredit
        fields = [
            "id",
            "earned_credits_amount",
            "issuance_status",
            "bccr_trading_name",
            "analyst_comment",
            "director_comment",
        ]
