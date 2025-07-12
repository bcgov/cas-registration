from ninja import ModelSchema, Schema
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.schema.elicensing_payments import ElicensingPaymentListOut
from decimal import Decimal


class ComplianceObligationOut(ModelSchema):
    """Schema for compliance obligation output"""

    class Meta:
        model = ComplianceObligation
        fields = [
            'id',
        ]


class ObligationWithPaymentsOut(Schema):
    """Schema for obligation data with payments"""

    reporting_year: int
    outstanding_balance: Decimal
    equivalent_value: Decimal
    obligation_id: str
    data_is_fresh: bool
    payments: ElicensingPaymentListOut
