from typing import Any, List
import logging

from reporting.service.reporting_flow_service import resolve_flow
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from . import validators

logger = logging.getLogger(__name__)


def collect_validation_plugins() -> List[Any]:
    validation_plugins = [validators.__dict__.get(plugin_name) for plugin_name in validators.__all__]

    for plugin in validation_plugins:
        if not plugin:
            raise AttributeError("Invalid plugin registration - None plugin found.")
        if not hasattr(plugin, "validate"):
            raise AttributeError(
                f"Plugin {plugin.__name__} needs to expose a `validate(report_version: ReportVersion) -> ReportValidationResult` function"
            )
        if not callable(plugin.validate):
            raise AttributeError(f"{plugin.__name__}'s `validate` attribute must be callable")

    return validation_plugins


class ReportValidationService:
    validation_plugins = collect_validation_plugins()

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

        for validation_plugin in ReportValidationService.validation_plugins:
            if tag is not None and tag not in getattr(validation_plugin, "TAGS", []):
                continue

            applies = getattr(validation_plugin, "applies", None)
            if callable(applies) and not applies(flow):
                continue

            errors.update(validation_plugin.validate(report_version))

        return errors
