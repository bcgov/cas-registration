from typing import Any, Literal, Tuple
from reporting.service.report_sign_off_service import ReportSignOffAcknowledgements, ReportSignOffData
from reporting.schema.report_sign_off import ReportSignOffIn
from common.api.utils.current_user_utils import get_current_user_guid
from django.http import HttpRequest
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.service.report_submission_service import ReportSubmissionService
from service.error_service.custom_codes_4xx import generic_error_codes_4xx
from .router import router
from reporting.models.report_version import ReportVersion
from registration.models.operation import Operation
from service.report_version_service import ReportVersionService
from common.exceptions import Severity, UserError, UserErrorKey
from reporting.api_v2.forms.form_schema import ReportingFormSchema
from reporting.schema.report_validation_data import ReportValidationPayloadSchema
from reporting.api_v2.utils.build_user_error_response import build_user_error_response


def _get_required_report_sign_off_acknowledgements(
    payload: ReportSignOffIn,
    report_version: ReportVersion,
) -> list[bool]:
    report_operation = report_version.report_operation

    is_eio = report_operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
    is_supplementary = not ReportVersionService.is_initial_report_version(report_version.id)
    is_regulated = report_operation.registration_purpose in [
        Operation.Purposes.OBPS_REGULATED_OPERATION,
        Operation.Purposes.NEW_ENTRANT_OPERATION,
        Operation.Purposes.OPTED_IN_OPERATION,
    ]

    acknowledgements: list[bool] = [bool(payload.acknowledgement_of_records)]

    if is_eio:
        acknowledgements.extend(
            [
                bool(payload.acknowledgement_of_certification),
                bool(payload.acknowledgement_of_errors),
            ]
        )
    else:
        acknowledgements.extend(
            [
                bool(payload.acknowledgement_of_review),
                bool(payload.acknowledgement_of_information),
            ]
        )

    if is_supplementary:
        acknowledgements.append(bool(payload.acknowledgement_of_new_version))

        if is_regulated:
            acknowledgements.append(bool(payload.acknowledgement_of_corrections))
    elif not is_eio:
        acknowledgements.append(bool(payload.acknowledgement_of_possible_costs))

    return acknowledgements


@router.post(
    "report-version/{version_id}/submit",
    response={
        200: int,
        422: ReportingFormSchema[ReportValidationPayloadSchema],
        generic_error_codes_4xx: Message,
    },
    tags=EMISSIONS_REPORT_TAGS,
    description="""Submits a report version""",
    auth=approved_industry_user_report_version_composite_auth,
)
def submit_report_version(
    request: HttpRequest,
    version_id: int,
    payload: ReportSignOffIn,
) -> Tuple[Literal[200], int] | Tuple[Literal[422], dict[str, Any]]:
    report_version = ReportVersion.objects.select_related(
        "report_operation",
    ).get(id=version_id)

    required_acknowledgements = _get_required_report_sign_off_acknowledgements(
        payload,
        report_version,
    )

    if not all(required_acknowledgements):
        return 422, build_user_error_response(
            version_id=version_id,
            error=UserError(
                severity=Severity.ERROR,
                message="All required acknowledgements must be checked to submit the report.",
                key=UserErrorKey.GENERIC_ERROR,
                context={"section": "sign_off"},
            ),
        )

    data = ReportSignOffData(
        acknowledgements=ReportSignOffAcknowledgements(
            payload.acknowledgement_of_review,
            payload.acknowledgement_of_certification,
            payload.acknowledgement_of_records,
            payload.acknowledgement_of_information,
            payload.acknowledgement_of_possible_costs,
            payload.acknowledgement_of_errors,
            payload.acknowledgement_of_new_version,
            payload.acknowledgement_of_corrections,
        ),
        signature=payload.signature,
    )

    return (
        200,
        ReportSubmissionService.submit_report(
            version_id,
            get_current_user_guid(request),
            data,
        ).id,
    )
