from typing import ClassVar

from reporting.models.report_operation import ReportOperation
from reporting.models.report_operation_representative import (
    ReportOperationRepresentative,
)
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import ReportValidationError
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.required_fields.base_required_fields_validator import (
    BaseRequiredFieldsValidator,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.reporting_flow_service import ReportingFlow, resolve_flow

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]

OPERATION_REPRESENTATIVE_LABEL = "Operation representative name"


class RequiredFieldsReportOperationInformationValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "review_operation_information"
    SECTION_TITLE: ClassVar[str] = "Review operation information"

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = [
        {"field": "operation_name", "label": "Operation name", "field_type": "scalar"},
        {"field": "operator_legal_name", "label": "Operator legal name", "field_type": "scalar"},
        {"field": "activities", "label": "Activities", "field_type": "m2m"},
        {"field": "regulated_products", "label": "Regulated products", "field_type": "m2m"},
    ]

    @classmethod
    def get_required_fields(
        cls,
        flow: ReportingFlow | None = None,
    ) -> list[RequiredFieldConfig]:
        if flow == ReportingFlow.EIO:
            return [
                field for field in cls.REQUIRED_FIELDS if field["field"] not in {"activities", "regulated_products"}
            ]
        elif flow in {ReportingFlow.REPORTING_ONLY_SFO, ReportingFlow.REPORTING_ONLY_LFO}:
            return [field for field in cls.REQUIRED_FIELDS if field["field"] != "regulated_products"]

        return cls.REQUIRED_FIELDS

    @classmethod
    def get_object_to_validate(cls, report_version: ReportVersion) -> ReportOperation:
        return report_version.report_operation

    @classmethod
    def get_custom_missing_fields(cls, report_version: ReportVersion) -> list[str]:
        has_selected_representative = ReportOperationRepresentative.objects.filter(
            report_version__id=report_version.id,
            selected_for_report=True,
        ).exists()

        if has_selected_representative:
            return []

        return [OPERATION_REPRESENTATIVE_LABEL]


def applies(flow: ReportingFlow) -> bool:
    return RequiredFieldsReportOperationInformationValidator.applies(flow)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    flow = resolve_flow(report_version)
    return RequiredFieldsReportOperationInformationValidator.validate(
        report_version,
        flow,
    )
