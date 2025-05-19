from decimal import Decimal
from typing import cast, Optional
from ninja import ModelSchema, Field
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.schema.compliance_obligation import ComplianceObligationOut

# Constants for field aliases
OPERATION_NAME_ALIAS = "compliance_report.report.operation.name"
REPORTING_YEAR_ALIAS = "compliance_report.compliance_period.end_date.year"
OBLIGATION_ID_ALIAS = "obligation.obligation_id"


class ComplianceReportVersionListOut(ModelSchema):
    """Schema for compliance summary list output"""

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    status: str
    obligation_id: Optional[str] = Field(None, alias=OBLIGATION_ID_ALIAS)
    outstanding_balance: Optional[Decimal] = None

    class Meta:
        model = ComplianceReportVersion
        fields = [
            'id',
        ]

    @staticmethod
    def resolve_operation_name(obj: ComplianceReportVersion) -> str:
        """Get the operation name from the nested relationship"""
        try:
            return obj.compliance_report.report.operation.name
        except AttributeError:
            return ""

    @staticmethod
    def resolve_reporting_year(obj: ComplianceReportVersion) -> int:
        """Get the reporting year from the compliance period"""
        try:
            return obj.compliance_report.compliance_period.end_date.year
        except AttributeError:
            return 0


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
    obligation_id: Optional[str] = Field(None, alias=OBLIGATION_ID_ALIAS)

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


class RequestIssuanceTrackStatusOut(ModelSchema):
    """Schema for request issuance track status data"""

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    bccr_trading_name: str
    earned_credits: int
    issuance_status: str
    directors_comments: str

    class Meta:
        model = ComplianceReportVersion
        fields = [
            'id',
        ]

    @staticmethod
    def resolve_operation_name(obj: ComplianceReportVersion) -> str:
        """Get the operation name from the nested relationship"""
        if obj.compliance_report.report.operation:
            return obj.compliance_report.report.operation.name
        return ""

    @staticmethod
    def resolve_bccr_trading_name(obj: ComplianceReportVersion) -> str:
        """Get the BCCR trading name from the issuance request"""
        if obj.issuance_request:
            return obj.issuance_request.bccr_trading_name
        return ""

    @staticmethod
    def resolve_earned_credits(obj: ComplianceReportVersion) -> int:
        """Get the earned credits from the issuance request"""
        if obj.issuance_request and obj.issuance_request.earned_credits is not None:
            return obj.issuance_request.earned_credits
        return 0

    @staticmethod
    def resolve_issuance_status(obj: ComplianceReportVersion) -> str:
        """Get the issuance status from the issuance request"""
        if obj.issuance_request:
            return obj.issuance_request.status
        return ""

    @staticmethod
    def resolve_directors_comments(obj: ComplianceReportVersion) -> str:
        """Get the director's comments from the issuance request"""
        if obj.issuance_request:
            return obj.issuance_request.directors_comments
        return ""
