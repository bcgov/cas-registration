from typing import ClassVar

from reporting.models.report_new_entrant import ReportNewEntrant
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import (
    ValidationTags,
)
from reporting.service.report_validation.validators.required_fields.base_required_fields_validator import (
    BaseRequiredFieldsValidator,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.reporting_flow_service import ReportingFlow

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


class RequiredFieldsNewEntrantInformationValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "new_entrant_information"
    SECTION_TITLE: ClassVar[str] = "New entrant information"

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = [
        {
            "field": "authorization_date",
            "label": "Authorization date",
            "field_type": "scalar",
        },
        {
            "field": "first_shipment_date",
            "label": "Date of first shipment",
            "field_type": "scalar",
        },
        {
            "field": "new_entrant_period_start",
            "label": "Date new entrant period began",
            "field_type": "scalar",
        },
    ]

    @classmethod
    def get_object_to_validate(
        cls,
        report_version: ReportVersion,
    ) -> ReportNewEntrant:
        return report_version.report_new_entrant.get()


def applies(flow: ReportingFlow) -> bool:
    return RequiredFieldsNewEntrantInformationValidator.applies(flow)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    return RequiredFieldsNewEntrantInformationValidator.validate(report_version)
