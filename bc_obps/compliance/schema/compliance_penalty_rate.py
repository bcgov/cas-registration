from compliance.models.compliance_penalty_rate import CompliancePenaltyRate
from ninja import ModelSchema


class CompliancePenaltyRateOut(ModelSchema):
    """
    Schema for the get compliance penalty rate endpoint request output
    """

    class Meta:
        model = CompliancePenaltyRate
        fields = ['rate', 'is_current_rate']
