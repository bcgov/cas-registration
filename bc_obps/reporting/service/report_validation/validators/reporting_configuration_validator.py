from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import ReportValidationError
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validator ensuring that all the activity data reported has a matching configuration
    defined for the reporting year of the report.

    For each ReportMethodlogy record:
    - Collect ReportMethodology -> ReportEmission (Gas Type) -> ReportSourceType -> ReportActivity -> Report (Reporting Year)
    - Validate that there is a ConfigurationElement record matching that combination
    - Validate that the extra reporting fields reported are in that configuration element
    """

    report_methodology_records = ReportMethodology.objects.select_related(
        "report_emission",
        "report_emission__report_source_type",
        "report_emission__report_source_type__report_activity",
    ).filter(report_version_id=report_version.id)
