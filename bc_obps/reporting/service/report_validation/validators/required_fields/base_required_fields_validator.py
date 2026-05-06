from typing import Any, ClassVar
from uuid import UUID

from django.core.exceptions import ObjectDoesNotExist

from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.report_validation.validators.required_fields.utils import (
    applies_to_section,
    collect_missing_fields,
)
from reporting.service.reporting_flow_service import ReportingFlow


class BaseRequiredFieldsValidator:
    SECTION: ClassVar[str]
    SECTION_TITLE: ClassVar[str]
    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]]

    @classmethod
    def applies(cls, flow: ReportingFlow) -> bool:
        return applies_to_section(flow, cls.SECTION)

    @classmethod
    def get_required_fields(
        cls,
        flow: ReportingFlow | None = None,
    ) -> list[RequiredFieldConfig]:
        return cls.REQUIRED_FIELDS

    @classmethod
    def get_object_to_validate(cls, report_version: ReportVersion) -> Any:
        raise NotImplementedError

    @classmethod
    def get_custom_missing_fields(
        cls,
        report_version: ReportVersion,
    ) -> list[str]:
        return []

    @classmethod
    def build_error(
        cls,
        *,
        report_version_id: int,
        missing_field_labels: list[str],
        facility_id: UUID | None = None,
        facility_name: str | None = None,
    ) -> ReportValidationError:
        return ReportValidationError(
            severity=Severity.ERROR,
            message="Required fields are empty.",
            key=ReportValidationErrorKey.ERROR_REQUIRED_FIELDS,
            context=ErrorContext(
                report_version_id=report_version_id,
                facility_id=facility_id,
                facility_name=facility_name,
                missing_fields=missing_field_labels,
                section=cls.SECTION,
                section_title=cls.SECTION_TITLE,
            ),
        )

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        required_fields = cls.get_required_fields(
            flow,
        )

        try:
            obj = cls.get_object_to_validate(report_version)
        except ObjectDoesNotExist:
            return {
                f"error_required_fields_{cls.SECTION}": cls.build_error(
                    report_version_id=report_version.id,
                    missing_field_labels=[field["label"] for field in required_fields]
                    + cls.get_custom_missing_fields(report_version),
                )
            }

        missing_field_labels = collect_missing_fields(
            obj,
            required_fields,
        )
        missing_field_labels += cls.get_custom_missing_fields(report_version)

        if not missing_field_labels:
            return {}

        return {
            f"error_required_fields_{cls.SECTION}": cls.build_error(
                report_version_id=report_version.id,
                missing_field_labels=missing_field_labels,
            )
        }
