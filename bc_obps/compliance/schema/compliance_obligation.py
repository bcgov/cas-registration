from ninja import ModelSchema
from compliance.models.compliance_obligation import ComplianceObligation


class ComplianceObligationOut(ModelSchema):
    """Schema for compliance obligation output"""

    class Meta:
        model = ComplianceObligation
        fields = [
            'id',
        ]
