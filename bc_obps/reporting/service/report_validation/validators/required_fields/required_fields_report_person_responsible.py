from typing import ClassVar

from reporting.models.report_person_responsible import ReportPersonResponsible
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.required_fields.base_required_fields_validator import (
    BaseRequiredFieldsValidator,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.reporting_flow_service import ReportingFlow


TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


class RequiredFieldsPersonResponsibleValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "person_responsible"
    SECTION_TITLE: ClassVar[str] = "Person responsible"

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = [
        {"field": "first_name", "label": "First name", "field_type": "scalar"},
        {"field": "last_name", "label": "Last name", "field_type": "scalar"},
        {"field": "email", "label": "Business email address", "field_type": "scalar"},
        {"field": "phone_number", "label": "Business telephone number", "field_type": "scalar"},
        {"field": "street_address", "label": "Business mailing address", "field_type": "scalar"},
        {"field": "municipality", "label": "Municipality", "field_type": "scalar"},
        {"field": "province", "label": "Province", "field_type": "scalar"},
        {"field": "postal_code", "label": "Postal code", "field_type": "scalar"},
        {"field": "business_role", "label": "Job title / position", "field_type": "scalar"},
    ]

    @classmethod
    def get_object_to_validate(
        cls,
        report_version: ReportVersion,
    ) -> ReportPersonResponsible:
        return report_version.report_person_responsible


def applies(flow: ReportingFlow) -> bool:
    return RequiredFieldsPersonResponsibleValidator.applies(flow)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    return RequiredFieldsPersonResponsibleValidator.validate(report_version)
