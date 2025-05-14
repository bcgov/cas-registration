from decimal import Decimal
from typing import cast, Optional
from ninja import ModelSchema, Field
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.schema.compliance_obligation import ComplianceObligationOut

# Constants for field aliases
OPERATION_NAME_ALIAS = "report_version.report.operation.name"
REPORTING_YEAR_ALIAS = "compliance_period.end_date.year"


class ComplianceReportVersionListOut(ModelSchema):
    """Schema for compliance summary list output"""

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    status: str
    obligation_id: Optional[str] = Field(None, alias="obligation.obligation_id")
    outstanding_balance: Optional[Decimal] = None

    class Meta:
        model = ComplianceReportVersion
        fields = [
            'id',
        ]


class ComplianceReportVersionOut(ModelSchema):
    """Schema for compliance summary output"""

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    operation_bcghg_id: str = Field(..., alias="report_version.report.operation.bcghg_id.id")
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    status: str = Field(..., alias="compliance_status")
    obligation: ComplianceObligationOut
    excess_emissions: Decimal = Field(..., alias="report_compliance_summary.excess_emissions")
    credited_emissions: Decimal = Field(..., alias="report_compliance_summary.credited_emissions")
    outstanding_balance: Optional[Decimal] = None
    obligation_id: Optional[str] = Field(None, alias="obligation.obligation_id")

    class Meta:
        model = ComplianceReportVersion
        fields = ['id']

    @staticmethod
    def resolve_excess_emissions(obj: ComplianceReportVersion) -> Decimal:
        return cast(Decimal, round(obj.report_compliance_summary.excess_emissions))


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
