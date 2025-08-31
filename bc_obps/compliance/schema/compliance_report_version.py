from decimal import Decimal
from typing import Optional
from ninja import ModelSchema, Field
from compliance.models.compliance_report_version import ComplianceReportVersion
from reporting.models.report_operation import ReportOperation

# report aliases
OPERATOR_NAME_ALIAS = "report_compliance_summary.report_version.report.operator.legal_name"
OPERATION_NAME_ALIAS = "report_compliance_summary.report_version.report_operation.operation_name"
OPERATION_BCGHG_ID_ALIAS = "report_compliance_summary.report_version.report.operation.bcghg_id.id"

# reporting_year aliases
REPORTING_YEAR_ALIAS = "report_compliance_summary.report_version.report.reporting_year.reporting_year"

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
    excess_emissions: Decimal = Field(
        ..., alias=EXCESS_EMISSIONS_ALIAS
    )  # for supplementary reports, this is the delta from the previous report
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
    credited_emissions: Decimal = Field(..., alias=CREDITED_EMISSIONS_ALIAS)
    compliance_charge_rate: Optional[Decimal] = None
    equivalent_value: Optional[Decimal] = None
    outstanding_balance_tco2e: Optional[Decimal] = None
    outstanding_balance_equivalent_value: Optional[Decimal] = None
    penalty_status: Optional[str] = Field(None, alias=OBLIGATION_PENALTY_STATUS_ALIAS)

    class Meta:
        model = ComplianceReportVersion
        fields = ['id', 'status']


class OperationByComplianceSummaryOut(ModelSchema):
    class Meta:
        model = ReportOperation
        fields = ['operation_name']
