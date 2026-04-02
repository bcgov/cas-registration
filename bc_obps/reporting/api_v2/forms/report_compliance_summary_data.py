from django.http import HttpRequest
from ninja import Schema
from typing import List, Literal, Tuple
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from reporting.api_v2.forms.form_schema import ReportingFormSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.compliance_data import (
    ComplianceDataSchemaOut,
    RegulatoryValuesSchema,
    ReportProductComplianceSchema,
)
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.api_v2.forms.form_response_builder import FormResponseBuilder
from reporting.service.compliance_service.compliance_service import ComplianceService
from ..router import router


class ComplianceDataSchemaSerialized(Schema):
    emissions_attributable_for_reporting: float
    reporting_only_emissions: float
    emissions_attributable_for_compliance: float
    emissions_limit: float
    excess_emissions: float
    credited_emissions: float
    regulatory_values: RegulatoryValuesSchema
    products: List[ReportProductComplianceSchema]


@router.get(
    "report-version/{version_id}/forms/compliance-summary-data",
    response={
        200: ReportingFormSchema[ComplianceDataSchemaSerialized],
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
    # Get compliance dataclass
    compliance_data = ComplianceService.get_calculated_compliance_data(version_id)

    # Trigger compliance schema resolvers through model_validate
    # Return a dict for FormResponseBuilder payload through model_dump
    payload = ComplianceDataSchemaOut.model_validate(
        compliance_data,
        from_attributes=True,
    ).model_dump(exclude_none=True)

    # Build standardized form builder response
    response = FormResponseBuilder(version_id).operation_data().payload(payload).build()

    return 200, response
