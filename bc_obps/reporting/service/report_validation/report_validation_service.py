from functools import reduce
from typing import Any, List

from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from . import validators
import logging

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
    """
    A service to validate reports before submission

    Strategy:
    - validators are collected at startup
    - filtered by TAGS (broad filtering)
    - optionally filtered by `applies()` (flow / section applicability)
    - then executed
    """

    validation_plugins = collect_validation_plugins()

    @staticmethod
    def validate_report_version(
        version_id: int,
        tag: ValidationTags | None = None,
    ) -> dict[str, ReportValidationError]:

        report_version = ReportVersion.objects.get(id=version_id)

        results: List[dict[str, ReportValidationError]] = []

        for validation_plugin in ReportValidationService.validation_plugins:

            # Tag filtering
            if tag is not None and tag not in getattr(validation_plugin, "TAGS", []):
                continue

            # Applicability filtering
            applies = getattr(validation_plugin, "applies", None)
            if callable(applies):
                try:
                    if not applies(report_version):
                        continue
                except Exception as e:
                    logger.error(f'Validator applies() failed: {validation_plugin} - {str(e)}')
                    continue

            # Execute validator
            result = validation_plugin.validate(report_version)
            results.append(result)

        # Aggregate the results in one dictionary, by key
        return reduce(lambda acc, curr: {**acc, **curr}, results, {})
