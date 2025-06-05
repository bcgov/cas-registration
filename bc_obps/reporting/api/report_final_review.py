from django.http import HttpRequest
from ninja.responses import Response
from django.db.models import Prefetch
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.models import Activity, RegulatedProduct
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from ..models import (
    ReportVersion,
    FacilityReport,
    ReportActivity,
    ReportNonAttributableEmissions,
    ReportEmissionAllocation,
    ReportProductEmissionAllocation,
)
from ..schema.report_final_review import ReportVersionSchema
from .router import router
from ..service.compliance_service import ComplianceService
from ..service.emission_category_service import EmissionCategoryService
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.get(
    "/report-version/{version_id}/final-review",
    response={200: ReportVersionSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch final review data for a given report version ID.",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_final_review_data(request: HttpRequest, version_id: int) -> Response:
    try:
        report = (
            ReportVersion.objects.select_related(
                "report_operation", "report_verification", "report_additional_data", "report_person_responsible"
            )
            .prefetch_related(
                "report_electricity_import_data",
                "report_new_entrant",
                "report_compliance_summary",
                "report_products",
                "report_operation_representatives",
                "reportemissionallocation_records",
                Prefetch(
                    "report_non_attributable_emissions",
                    queryset=ReportNonAttributableEmissions.objects.prefetch_related("emission_category", "gas_type"),
                ),
                Prefetch(
                    "facility_reports",
                    queryset=FacilityReport.objects.prefetch_related(
                        Prefetch(
                            "reportactivity_records",
                            queryset=ReportActivity.objects.select_related("activity", "activity_base_schema"),
                        ),
                        Prefetch(
                            "reportemissionallocation_records",
                            queryset=ReportEmissionAllocation.objects.prefetch_related(
                                Prefetch(
                                    "reportproductemissionallocation_records",
                                    queryset=ReportProductEmissionAllocation.objects.select_related(
                                        "report_product", "emission_category"
                                    ),
                                )
                            ),
                        ),
                    ),
                ),
                Prefetch("report_operation__activities", queryset=Activity.objects.all()),
                Prefetch("report_operation__regulated_products", queryset=RegulatedProduct.objects.all()),
            )
            .get(id=version_id)
        )
    except ReportVersion.DoesNotExist:
        return Response({"message": "ReportVersion not found"}, status=404)

    for facility in report.facility_reports.all():
        facility.emission_summary = EmissionCategoryService.get_facility_emission_summary_form_data(facility.id)  # type: ignore

    compliance_summary = ComplianceService.get_calculated_compliance_data(version_id)

    serialized_report = ReportVersionSchema.from_orm(report)
    data = serialized_report.dict()
    data["report_compliance_summary"] = compliance_summary

    return Response(data, status=200)
