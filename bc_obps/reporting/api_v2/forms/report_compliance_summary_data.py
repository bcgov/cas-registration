from typing import List, Literal, Optional, Tuple
from django.http import HttpRequest
from ninja import Schema
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from reporting.api_v2.forms.form_response_builder import FormResponseBuilder
from reporting.api_v2.forms.form_schema import ReportingFormSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_version import ReportVersion
from reporting.schema.compliance_data import ComplianceDataSchemaOut
from reporting.schema.generic import Message
from reporting.service.compliance_service.compliance_service import ComplianceService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.facility_report_service import FacilityReportService
from reporting.utils import is_operation_opted_out

from ..router import router


class ComplianceSummaryFormRegulatoryValuesSchema(Schema):
    initial_compliance_period: str
    compliance_period: str


class ComplianceSummaryFormProductSchema(Schema):
    name: str
    annual_production: str
    jan_mar_production: Optional[str] = None
    apr_dec_production: Optional[str] = None
    emission_intensity: str
    allocated_industrial_process_emissions: str
    allocated_compliance_emissions: str
    reduction_factor: str
    tightening_rate: str


class ComplianceSummaryFormPayloadSchema(Schema):
    emissions_attributable_for_reporting: str
    reporting_only_emissions: str
    emissions_attributable_for_compliance: str
    emissions_limit: str
    excess_emissions: str
    credited_emissions: str
    regulatory_values: ComplianceSummaryFormRegulatoryValuesSchema
    products: List[ComplianceSummaryFormProductSchema]
    reporting_year: int
    is_operation_opted_out: bool


@router.get(
    "report-version/{version_id}/forms/compliance-data",
    response={
        200: ReportingFormSchema[ComplianceSummaryFormPayloadSchema],
        custom_codes_4xx: Message,
    },
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for the compliance summary page from multiple data sources.""",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def get_compliance_summary_form_data(
    request: HttpRequest,
    version_id: int,
) -> Tuple[Literal[200], dict]:
    compliance_data = ComplianceService.get_calculated_compliance_data(version_id)
    compliance_schema = ComplianceDataSchemaOut.from_orm(compliance_data)
    facility_id = FacilityReportService.get_facility_report_by_version_id(version_id)

    report_version = ReportVersion.objects.select_related(
        "report",
        "report_operation",
    ).get(id=version_id)

    builder = FormResponseBuilder(version_id).operation_data()

    if facility_id is not None:
        builder = builder.facility_data(facility_id)

    base_response = builder.build()
    report_data = base_response["report_data"]
    reporting_year = report_data["reporting_year"]

    payload = ComplianceSummaryFormPayloadSchema(
        emissions_attributable_for_reporting=str(compliance_schema.emissions_attributable_for_reporting),
        reporting_only_emissions=str(compliance_schema.reporting_only_emissions),
        emissions_attributable_for_compliance=str(compliance_schema.emissions_attributable_for_compliance),
        emissions_limit=str(compliance_schema.emissions_limit),
        excess_emissions=str(compliance_schema.excess_emissions),
        credited_emissions=str(compliance_schema.credited_emissions),
        regulatory_values=ComplianceSummaryFormRegulatoryValuesSchema(
            initial_compliance_period=str(compliance_schema.regulatory_values.initial_compliance_period),
            compliance_period=str(compliance_schema.regulatory_values.compliance_period),
        ),
        products=[
            ComplianceSummaryFormProductSchema(
                name=product.name,
                annual_production=str(product.annual_production),
                jan_mar_production=(
                    str(product.jan_mar_production) if product.jan_mar_production is not None else None
                ),
                apr_dec_production=(
                    str(product.apr_dec_production) if product.apr_dec_production is not None else None
                ),
                emission_intensity=str(product.emission_intensity),
                allocated_industrial_process_emissions=str(product.allocated_industrial_process_emissions),
                allocated_compliance_emissions=str(product.allocated_compliance_emissions),
                reduction_factor=str(product.reduction_factor),
                tightening_rate=str(product.tightening_rate),
            )
            for product in compliance_schema.products
        ],
        reporting_year=reporting_year,
        is_operation_opted_out=is_operation_opted_out(
            operation_opted_out_final_reporting_year=report_version.report_operation.operation_opted_out_final_reporting_year,
            reporting_year=report_version.report.reporting_year_id,
        ),
    )

    response = builder.payload(payload.dict()).build()

    return 200, response
