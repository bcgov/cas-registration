from functools import reduce
from typing import Any, List

from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from . import validators


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

    Strategy: independent, plug-in validators are collected at start-up time, then run in a sequence.
    Errors are collected then returned in a dictionary.
    """

    validation_plugins = collect_validation_plugins()

    @staticmethod
    def validate_report_version(version_id: int) -> dict[str, ReportValidationError]:

        report_version = ReportVersion.objects.get(id=version_id)

        results: List[dict[str, ReportValidationError]] = [
            validation_plugin.validate(report_version)
            for validation_plugin in ReportValidationService.validation_plugins
        ]

        # Aggregate the results in one dictionary, by key
        error_dictionary: dict[str, ReportValidationError] = reduce(lambda acc, curr: {**acc, **curr}, results, {})

        return error_dictionary
