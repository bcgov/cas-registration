from typing import List, Literal, Tuple
import dataclasses

from django.http import HttpRequest
from ninja import Schema

from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from reporting.api_v2.forms.form_response_builder import FormResponseBuilder
from reporting.api_v2.forms.form_schema import ReportingFormSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.compliance_data import (
    RegulatoryValuesSchema,
    ReportProductComplianceSchema,
)
from reporting.schema.generic import Message
from reporting.service.compliance_service.compliance_service import ComplianceService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.facility_report_service import FacilityReportService

from ..router import router


class ComplianceSummaryFormPayloadSchema(Schema):
    emissions_attributable_for_reporting: float
    reporting_only_emissions: float
    emissions_attributable_for_compliance: float
    emissions_limit: float
    excess_emissions: float
    credited_emissions: float
    regulatory_values: RegulatoryValuesSchema
    products: List[ReportProductComplianceSchema]


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
    # Fetch data
    compliance_data = ComplianceService.get_calculated_compliance_data(version_id)
    facility_id = FacilityReportService.get_facility_report_by_version_id(version_id)

    # Build payload - compliance summary
    payload = {
        "emissions_attributable_for_reporting": compliance_data.emissions_attributable_for_reporting,
        "reporting_only_emissions": compliance_data.reporting_only_emissions,
        "emissions_attributable_for_compliance": compliance_data.emissions_attributable_for_compliance,
        "emissions_limit": compliance_data.emissions_limit,
        "excess_emissions": compliance_data.excess_emissions,
        "credited_emissions": compliance_data.credited_emissions,
        "regulatory_values": compliance_data.industry_regulatory_values,
        "products": [
            ReportProductComplianceSchema(
                **dataclasses.asdict(product),
                reduction_factor=float(
                    product.reduction_factor_override or compliance_data.industry_regulatory_values.reduction_factor
                ),
                tightening_rate=float(
                    product.tightening_rate_override or compliance_data.industry_regulatory_values.tightening_rate
                ),
            )
            for product in compliance_data.products
        ],
    }

    # Build form data response
    builder = FormResponseBuilder(version_id).payload(payload).operation_data()

    if facility_id is not None:
        builder = builder.facility_data(facility_id)

    response = builder.build()

    return 200, response
