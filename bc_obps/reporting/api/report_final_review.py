from django.http import HttpRequest
from ninja.responses import Response
from django.db.models import Prefetch
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from ..models import ReportVersion, FacilityReport, ReportRawActivityData
from ..schema.report_final_review import ReportVersionSchema
from .router import router


@router.get(
    "/report-version/{version_id}/final-review",
    response={200: ReportVersionSchema, 404: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch final review data for a given report version ID.",
)
def get_report_final_review_data(request: HttpRequest, version_id: int):
    try:
        report = (
            ReportVersion.objects.select_related(
                "report_operation", "report_verification", "report_additional_data", "report_person_responsible"
            )
            .prefetch_related(
                "report_electricity_import_data",
                "report_new_entrant",
                "report_compliance_summary",
                "report_operation_representatives",
                Prefetch(
                    "facility_reports",
                    queryset=FacilityReport.objects.prefetch_related(
                        Prefetch("reportrawactivitydata_records", queryset=ReportRawActivityData.objects.all())
                    ),
                ),
            )
            .get(id=version_id)
        )
    except ReportVersion.DoesNotExist:
        return Response({"message": "ReportVersion not found"}, status=404)

    return report
