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
REPORTING_YEAR_ALIAS = "compliance_report.compliance_period.end_date.year"

# report_compliance_summary aliases
EXCESS_EMISSIONS_ALIAS = "report_compliance_summary.excess_emissions"
ATTRIBUTABLE_EMISSIONS_ALIAS = "report_compliance_summary.emissions_attributable_for_compliance"
EMISSIONS_LIMIT_ALIAS = "report_compliance_summary.emissions_limit"
CREDITED_EMISSIONS_ALIAS = "report_compliance_summary.credited_emissions"

# obligation aliases
OBLIGATION_ID_ALIAS = "obligation.obligation_id"
OBLIGATION_PENALTY_STATUS_ALIAS = "obligation.penalty_status"

# compliance_earned_credits aliases
ISSUANCE_STATUS_ALIAS = "compliance_earned_credit.issuance_status"


class ComplianceReportVersionListOut(ModelSchema):
    operator_name: str = Field(..., alias=OPERATOR_NAME_ALIAS)
    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    obligation_id: Optional[str] = Field(None, alias=OBLIGATION_ID_ALIAS)
    outstanding_balance_tco2e: Optional[Decimal] = None
    excess_emissions: Decimal = Field(..., alias=EXCESS_EMISSIONS_ALIAS)
    issuance_status: Optional[str] = Field(None, alias=ISSUANCE_STATUS_ALIAS)
    penalty_status: Optional[str] = Field(None, alias=OBLIGATION_PENALTY_STATUS_ALIAS)
    invoice_number: Optional[str] = Field(None, alias="obligation.elicensing_invoice.invoice_number")

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
    compliance_charge_rate: Optional[Decimal] = None
    equivalent_value: Optional[Decimal] = None
    outstanding_balance_tco2e: Optional[Decimal] = None
    outstanding_balance_equivalent_value: Optional[Decimal] = None

    class Meta:
        model = ComplianceReportVersion
        fields = ['id', 'status']


class OperationByComplianceSummaryOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ['name']
