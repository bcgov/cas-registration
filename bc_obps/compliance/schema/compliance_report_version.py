from decimal import Decimal
from typing import Optional
from ninja import ModelSchema, Field
from compliance.models.compliance_report_version import ComplianceReportVersion
from registration.models import Operation

# report aliases
OPERATOR_NAME_ALIAS = "compliance_report.report.operator.legal_name"
OPERATION_NAME_ALIAS = "compliance_report.report.operation.name"
OPERATION_BCGHG_ID_ALIAS = "compliance_report.report.operation.bcghg_id.id"

# reporting_year aliases
REPORTING_YEAR_ALIAS = "compliance_report.compliance_period.reporting_year.reporting_year"

# compliance_charge_rate aliases
CHARGE_RATE_ALIAS = "compliance_report.compliance_period.reporting_year.compliance_charge_rate.rate"

# report_compliance_summary aliases
EXCESS_EMISSIONS_ALIAS = "report_compliance_summary.excess_emissions"
ATTRIBUTABLE_EMISSIONS_ALIAS = "report_compliance_summary.emissions_attributable_for_compliance"
EMISSIONS_LIMIT_ALIAS = "report_compliance_summary.emissions_limit"
CREDITED_EMISSIONS_ALIAS = "report_compliance_summary.credited_emissions"

# obligation aliases
OBLIGATION_ID_ALIAS = "obligation.obligation_id"
OBLIGATION_FEE_AMOUNT_DOLLARS_ALIAS = "obligation.fee_amount_dollars"
OBLIGATION_PENALTY_STATUS_ALIAS = "obligation.penalty_status"

# compliance_earned_credits aliases
ISSUANCE_STATUS_ALIAS = "compliance_earned_credit.issuance_status"

# elicensing_invoice aliases
OUTSTANDING_BALANCE_ALIAS = (
    "obligation.elicensing_invoice.outstanding_balance"
)
INVOICE_FEE_BALANCE_ALIAS = (
    "obligation.elicensing_invoice.invoice_fee_balance"
)

class ComplianceReportVersionListOut(ModelSchema):
    operator_name: str = Field(..., alias=OPERATOR_NAME_ALIAS)
    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    obligation_id: Optional[str] = Field(None, alias=OBLIGATION_ID_ALIAS)
    outstanding_balance: Optional[Decimal] = None
    excess_emissions: Decimal = Field(..., alias=EXCESS_EMISSIONS_ALIAS)
    issuance_status: Optional[str] = Field(None, alias=ISSUANCE_STATUS_ALIAS)
    penalty_status: Optional[str] = Field(None, alias=OBLIGATION_PENALTY_STATUS_ALIAS)

    class Meta:
        model = ComplianceReportVersion
        fields = ['id', 'status']


class ComplianceReportVersionOut(ModelSchema):
    obligation_id: Optional[str] = Field(None, alias=OBLIGATION_ID_ALIAS)
    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    operation_bcghg_id: Optional[str] = Field(None, alias=OPERATION_BCGHG_ID_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    excess_emissions: Decimal = Field(..., alias=EXCESS_EMISSIONS_ALIAS)
    emissions_attributable_for_compliance: Decimal = Field(..., alias=ATTRIBUTABLE_EMISSIONS_ALIAS)
    emissions_limit: Decimal = Field(..., alias=EMISSIONS_LIMIT_ALIAS)
    credited_emissions: Decimal = Field(..., alias=CREDITED_EMISSIONS_ALIAS)
    fee_amount_dollars: Decimal = Field(..., alias=OBLIGATION_FEE_AMOUNT_DOLLARS_ALIAS)
    outstanding_balance: Optional[Decimal] = Field(
        None, alias=OUTSTANDING_BALANCE_ALIAS
    )      
    invoice_fee_balance: Optional[Decimal] = Field(
        None, alias=INVOICE_FEE_BALANCE_ALIAS
    )  
    compliance_charge_rate: Optional[Decimal] = None 
   
    class Meta:
        model = ComplianceReportVersion
        fields = ['id', 'status']


    @staticmethod
    def resolve_compliance_charge_rate(obj: ComplianceReportVersion) -> Optional[Decimal]:
        """Determine the charge_rate"""
        reporting_year = obj.compliance_report.compliance_period.reporting_year
        compliance_charge_rate_obj = reporting_year.compliance_charge_rate.first()
        return compliance_charge_rate_obj.rate if compliance_charge_rate_obj else None



# To be handled in issue #117

# class ComplianceSummaryIssuanceOut(ModelSchema):
#     """Schema for compliance summary issuance data"""

#     operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
#     reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
#     excess_emissions_percentage: Optional[Union[Decimal, int]] = None
#     earned_credits: Optional[int]
#     earned_credits_issued: bool
#     issuance_status: str

#     class Meta:
#         model = ComplianceReportVersion
#         fields = [
#             'id',
#             # 'emissions_attributable_for_compliance',
#             # 'emission_limit',
#             # 'excess_emissions',
#         ]


class OperationByComplianceSummaryOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ['name']