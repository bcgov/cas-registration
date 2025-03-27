from typing import Callable, List

from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_result import (
    ReportValidationResult,
)
from . import validators


def build_validation_plugins():
    validation_plugins = [validators.__dict__.get(plugin_name) for plugin_name in validators.__all__]

    for plugin in validation_plugins:
        if not hasattr(plugin, "validate"):
            raise AttributeError(
                f"Plugin {plugin.__name__} needs to expose a `validate(report_version: ReportVersion) -> ReportValidationResult` function"
            )
        if not isinstance(plugin.validate, Callable):
            raise AttributeError(f"{plugin.__name__}'s validate attribute must be a function")

    return validation_plugins


class ReportValidationService:
    """
    A service to validate reports before submission

    Strategy: independent, plug-in validators will
    """

    validation_plugins = build_validation_plugins()

    @staticmethod
    def validate_report_version(version_id: int) -> None:
        """
        Future implementation could create a specific exception housing all the issues a report would have
        Django-ninja could then have a special way of parsing that error with a custom error code.

        Validates that the report meets necessary requirements before submission:
        - If report verification is required, ensures that a `ReportVerification` entry exists.
        - If a verification statement is required, ensures the presence of a corresponding attachment.
        """
        report_version = ReportVersion.objects.get(id=version_id)

        results: List[ReportValidationResult] = [
            validation_plugin.validate(report_version)
            for validation_plugin in ReportValidationService.validation_plugins
        ]

        # Aggregate the results
        return ReportValidationResult(
            valid=all([result.valid for result in results]),
            errors={k: v for result in results for k, v in result.errors.items()},
        )
