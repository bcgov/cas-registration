from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from ninja import ModelSchema


class ComplianceEarnedCreditsOut(ModelSchema):
    """Schema for compliance earned credits data"""

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    emissions_attributable_for_compliance: Optional[Decimal] = Field(None, alias=EMISSIONS_ATTRIBUTABLE_ALIAS)
    emission_limit: Optional[Decimal] = Field(None, alias=EMISSIONS_LIMIT_ALIAS)
    excess_emissions: Optional[Decimal] = Field(None, alias=EXCESS_EMISSIONS_ALIAS)
    earned_credits: Optional[int] = Field(None, alias="earned_credits_amount")
    issuance_status: Optional[str] = None
    earned_credits_issued: bool = False

    class Meta:
        model = ComplianceEarnedCredit
        fields = [
            'id',
        ]

    @staticmethod
    def resolve_earned_credits_issued(obj: ComplianceEarnedCredits) -> bool:
        """Determine if earned credits have been issued"""
        return obj.issuance_status == ComplianceEarnedCredits.IssuanceStatus.CREDITS_ISSUED
