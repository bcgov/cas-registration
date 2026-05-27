from common.exceptions import UserError
from django.db.models import Exists, OuterRef
from reporting.models.configuration_element import ConfigurationElement
from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import ReportValidationError
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


def validate_configuration_elements_present(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    config_element = ConfigurationElement.objects.filter(
        activity_id=OuterRef("report_emission__report_source_type__report_activity__activity_id"),
        source_type_id=OuterRef("report_emission__report_source_type__source_type_id"),
        gas_type_id=OuterRef("report_emission__gas_type_id"),
        methodology_id=OuterRef("methodology_id"),
        valid_from__valid_from__year__lte=OuterRef("report_version__report__reporting_year_id"),
        valid_to__valid_to__year__gte=OuterRef("report_version__report__reporting_year_id"),
    ).values("id")[:1]

    missing_config = (
        ReportMethodology.objects.select_related(
            "report_emission",
            "report_emission__report_source_type",
            "report_emission__report_source_type__report_activity",
            "report_version__report",
        )
        .filter(report_version_id=report_version.id)
        .annotate(
            matching_config_exists=Exists(config_element),
        )
        .filter(matching_config_exists=False)
        .values("id")
    )

    if missing_config.exists():
        raise UserError


def validate_reporting_fields(report_version: ReportVersion) -> dict[str, ReportValidationError]:

    pass


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validator ensuring that all the activity data reported has a matching configuration
    defined for the reporting year of the report.

    For each ReportMethodlogy record:
    - Collect ReportMethodology -> ReportEmission (Gas Type) -> ReportSourceType -> ReportActivity -> Report (Reporting Year)
    - Validate that there is a ConfigurationElement record matching that combination
    - Validate that the extra reporting fields reported are in that configuration element
    """
