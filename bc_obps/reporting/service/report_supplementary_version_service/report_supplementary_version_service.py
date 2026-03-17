from django.db import transaction

from reporting.models import ReportVersion
from reporting.service.report_supplementary_version_service.report_supplementary_cloning import clone_all
from service.report_version_service import ReportVersionService
from service.reporting_year_service import ReportingYearService


class ReportSupplementaryVersionService:

    @staticmethod
    @transaction.atomic
    def create_or_clone_report_version(report_version_id: int) -> ReportVersion:
        """
        Creates a supplementary (cloned copy) or blank report version depending on whether
        the registration purpose, operator, or reporting year have changed.
        """
        report_version = ReportVersion.objects.select_related(
            "report__operation", "report__reporting_year", "report_operation"
        ).get(id=report_version_id)
        operation = report_version.report.operation
        operator_changed = operation.operator_id != report_version.report.operator_id
        purpose_changed = operation.registration_purpose != report_version.report_operation.registration_purpose

        current_year = ReportingYearService.get_current_reporting_year()
        is_past_year = report_version.report.reporting_year.reporting_year < current_year.reporting_year

        should_clone = not purpose_changed or operator_changed or is_past_year

        if should_clone:
            return ReportSupplementaryVersionService._create_supplementary_version(
                report_version, operator_changed, purpose_changed
            )

        return ReportVersionService.create_report_version(report_version.report)

    @staticmethod
    @transaction.atomic
    def _create_supplementary_version(
        report_version: ReportVersion,
        operator_changed: bool = False,
        purpose_changed: bool = False,
    ) -> ReportVersion:
        """
        Creates a new Draft version by cloning the data from the source version..
        """
        source = ReportSupplementaryVersionService._resolve_source_version(
            report_version, operator_changed, purpose_changed
        )

        if source is None:
            raise ValueError(
                "Cannot create supplementary version: no submitted version found matching the new registration purpose."
            )

        new_version = ReportVersion.objects.create(
            report=report_version.report,
            report_type=source.report_type,
            status=ReportVersion.ReportVersionStatus.Draft,
            is_latest_submitted=False,
        )

        clone_all(source, new_version)
        return new_version

    @staticmethod
    def _resolve_source_version(
        report_version: ReportVersion,
        operator_changed: bool,
        purpose_changed: bool,
    ) -> ReportVersion | None:
        """
        Returns the version to clone from.
        - If both the operator and registration purpose have changed, returns the latest
          submitted version from the original operator with the matching registration purpose.
        - Otherwise, returns the current report version.
        """
        if purpose_changed:
            matching_versions = ReportVersion.objects.filter(
                report__operation=report_version.report.operation,
                report__reporting_year=report_version.report.reporting_year,
                report_operation__registration_purpose=report_version.report_operation.registration_purpose,
                status=ReportVersion.ReportVersionStatus.Submitted,
            )
            if operator_changed:
                matching_versions = matching_versions.filter(report__operator_id=report_version.report.operator_id)
            return matching_versions.order_by("-created_at").first()
        return report_version
