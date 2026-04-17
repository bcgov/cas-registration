from enum import StrEnum
from registration.models import Operation
from reporting.models.report_version import ReportVersion


class ReportingFlow(StrEnum):
    EIO = "EIO"
    SFO = "SFO"
    LFO = "LFO"
    NEW_ENTRANT_SFO = "NEW_ENTRANT_SFO"
    NEW_ENTRANT_LFO = "NEW_ENTRANT_LFO"
    REPORTING_ONLY_SFO = "REPORTING_ONLY_SFO"
    REPORTING_ONLY_LFO = "REPORTING_ONLY_LFO"


def resolve_flow(report_version: ReportVersion) -> ReportingFlow:
    report_operation = report_version.report_operation

    operation_type = report_operation.operation_type
    registration_purpose = report_operation.registration_purpose

    if registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
        return ReportingFlow.EIO

    if operation_type == Operation.Types.SFO:
        if registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
            return ReportingFlow.NEW_ENTRANT_SFO
        if registration_purpose == Operation.Purposes.REPORTING_OPERATION:
            return ReportingFlow.REPORTING_ONLY_SFO
        return ReportingFlow.SFO

    if operation_type == Operation.Types.LFO:
        if registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
            return ReportingFlow.NEW_ENTRANT_LFO
        if registration_purpose == Operation.Purposes.REPORTING_OPERATION:
            return ReportingFlow.REPORTING_ONLY_LFO
        return ReportingFlow.LFO

    raise ValueError(
        f"Unable to resolve reporting flow for operation type {operation_type} "
        f"and registration purpose {registration_purpose}"
    )
