import logging
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.base import (
    VALIDATOR_REGISTRY,
    ReportValidator,
)
from reporting.service.reporting_flow_service import resolve_flow

# Importing the validators package loads every validator module. Each module
# defines a ReportValidator subclass; ReportValidator.__init_subclass__ then
# registers it into VALIDATOR_REGISTRY.
from . import validators  # noqa: F401

logger = logging.getLogger(__name__)


class ReportValidationService:
    @staticmethod
    def validate_report_version(
        version_id: int,
        tag: ValidationTags | None = None,
    ) -> dict[str, ReportValidationError]:
        report_version = ReportVersion.objects.select_related(
            "report_operation",
        ).get(id=version_id)

        flow = resolve_flow(report_version)
        errors: dict[str, ReportValidationError] = {}

        for validator_cls in VALIDATOR_REGISTRY:
            if tag is not None and tag not in validator_cls.TAGS:
                continue
            if not validator_cls.applies(flow):
                continue
            errors.update(validator_cls.validate(report_version, flow))

        return errors


__all__ = ["ReportValidationService", "VALIDATOR_REGISTRY", "ReportValidator"]
