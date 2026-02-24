from compliance.models.compliance_period import CompliancePeriod
from ninja import ModelSchema

class CompliancePeriodOut(ModelSchema):
    """
    Schema for the get compliance period endpoint request output
    """

    class Meta:
        model = CompliancePeriod
        fields = [
            'start_date',
            'end_date',
            'compliance_deadline',
            'invoice_generation_date',
            'reporting_year'
        ]