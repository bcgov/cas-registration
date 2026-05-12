from typing import ClassVar

from django.core.exceptions import ObjectDoesNotExist

from reporting.models.report_additional_data import ReportAdditionalData
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


class RequiredFieldsAdditionalReportingDataValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "additional_reporting_data"
    SECTION_TITLE: ClassVar[str] = "Additional reporting data"

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = []

    @classmethod
    def get_object_to_validate(
        cls,
        report_version: ReportVersion,
    ) -> ReportAdditionalData:
        return report_version.report_additional_data

    @classmethod
    def get_custom_missing_fields(
        cls,
        report_version: ReportVersion,
    ) -> list[str]:
        report_additional_data = report_version.report_additional_data

        if not report_additional_data.capture_emissions:
            return []

        capture_fields = [
            report_additional_data.emissions_on_site_use,
            report_additional_data.emissions_on_site_sequestration,
            report_additional_data.emissions_off_site_transfer,
        ]

        if all(field is None for field in capture_fields):
            return ["At least one emissions capture type must be provided"]

        return []

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        try:
            cls.get_object_to_validate(report_version)
        except ObjectDoesNotExist:
            return {
                f"error_required_fields_{cls.SECTION}": cls.build_error(
                    report_version_id=report_version.id,
                    missing_field_labels=[cls.SECTION_TITLE],
                )
            }

        missing_field_labels = cls.get_custom_missing_fields(report_version)

        if not missing_field_labels:
            return {}

        return {
            f"error_required_fields_{cls.SECTION}": cls.build_error(
                report_version_id=report_version.id,
                missing_field_labels=missing_field_labels,
            )
        }


def applies(flow: ReportingFlow) -> bool:
    return RequiredFieldsAdditionalReportingDataValidator.applies(flow)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    return RequiredFieldsAdditionalReportingDataValidator.validate(report_version)
