from typing import Literal

from django.http import HttpRequest
from django.db.models import Prefetch
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.models import Activity, RegulatedProduct
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from .permissions import approved_industry_user_report_version_composite_auth
from ..models import (
    ReportVersion,
    FacilityReport,
    ReportActivity,
    ReportNonAttributableEmissions,
    ReportNewEntrant,
)
from ..schema.report_final_review import ReportVersionSchema
from .router import router


@router.get(
    "/report-version/{version_id}/final-review",
    response={200: ReportVersionSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch final review data for a given report version ID.",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_final_review_data(request: HttpRequest, version_id: int) -> tuple[Literal[200], ReportVersion]:
    # Fetch the report version data
    report_version = (
        ReportVersion.objects.select_related(
            "report_operation", "report_verification", "report_additional_data", "report_person_responsible"
        )
        .prefetch_related(
            "report_electricity_import_data",
            "report_compliance_summary",
            "report_products",
            "report_operation_representatives",
            Prefetch(
                "report_new_entrant",
                queryset=ReportNewEntrant.objects.prefetch_related("report_new_entrant_emission", "productions"),
            ),
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
                ),
            ),
            Prefetch("report_operation__activities", queryset=Activity.objects.all()),
            Prefetch("report_operation__regulated_products", queryset=RegulatedProduct.objects.all()),
        )
        .get(id=version_id)
    )
    return 200, report_version
