from django.http import HttpRequest
from typing import Literal, Tuple
from ninja import Schema
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from reporting.api_v2.forms.form_response_builder import FormResponseBuilder
from reporting.api_v2.forms.form_schema import ReportingFormSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_version import ReportVersion
from reporting.schema.compliance_data import (
    ComplianceDataSchemaOut,
    RegulatoryValuesSchema,
    ReportProductComplianceSchema,
)
from reporting.schema.generic import Message
from reporting.service.compliance_service.compliance_service import ComplianceService
from reporting.utils import is_operation_opted_out
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.facility_report_service import FacilityReportService
from ..router import router


# API response schema
class ComplianceSummaryFormPayloadSchema(Schema):
    emissions_attributable_for_reporting: float
    reporting_only_emissions: float
    emissions_attributable_for_compliance: float
    emissions_limit: float
    excess_emissions: float
    credited_emissions: float
    regulatory_values: RegulatoryValuesSchema
    products: list[ReportProductComplianceSchema]
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
    facility_id = FacilityReportService.get_facility_report_by_version_id(version_id)

    report_version = ReportVersion.objects.select_related(
        "report",
        "report_operation",
    ).get(id=version_id)

    builder = FormResponseBuilder(version_id).operation_data()

    if facility_id is not None:
        builder = builder.facility_data(facility_id)

    base_payload = ComplianceDataSchemaOut.from_orm(compliance_data).dict()

    payload = {
        **base_payload,
        "is_operation_opted_out": is_operation_opted_out(
            operation_opted_out_final_reporting_year=(
                report_version.report_operation.operation_opted_out_final_reporting_year
            ),
            reporting_year=report_version.report.reporting_year_id,
        ),
    }

    response = builder.payload(payload).build()

    return 200, response
