from decimal import Decimal
from typing import Optional
from ninja import ModelSchema, Field
from compliance.models.compliance_report_version import ComplianceReportVersion
from registration.models import Operation

# Constants for field aliases
OPERATOR_NAME_ALIAS = "compliance_report.report.operator.legal_name"
OPERATION_NAME_ALIAS = "compliance_report.report.operation.name"
REPORTING_YEAR_ALIAS = "compliance_report.compliance_period.end_date.year"
OBLIGATION_ID_ALIAS = "obligation.obligation_id"


class ComplianceReportVersionListOut(ModelSchema):
    operator_name: str = Field(..., alias=OPERATOR_NAME_ALIAS)
    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    obligation_id: Optional[str] = Field(None, alias=OBLIGATION_ID_ALIAS)
    outstanding_balance: Optional[Decimal] = None
    excess_emissions: Decimal = Field(..., alias="report_compliance_summary.excess_emissions")
    issuance_status: Optional[str] = Field(None, alias="compliance_earned_credit.issuance_status")

    class Meta:
        model = ComplianceReportVersion
        fields = ['id', 'status']


class ComplianceReportVersionOut(ModelSchema):
    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    operation_bcghg_id: Optional[str] = Field(None, alias="report_version.report.operation.bcghg_id.id")
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    excess_emissions: Decimal = Field(..., alias="report_compliance_summary.excess_emissions")
    credited_emissions: Decimal = Field(..., alias="report_compliance_summary.credited_emissions")
    outstanding_balance: Optional[Decimal] = None
    obligation_id: Optional[str] = Field(None, alias=OBLIGATION_ID_ALIAS)

    class Meta:
        model = ComplianceReportVersion
        fields = ['id', 'status']


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
