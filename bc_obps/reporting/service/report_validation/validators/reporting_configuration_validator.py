from django.contrib.postgres.aggregates import ArrayAgg, StringAgg
from django.contrib.postgres.expressions import ArraySubquery
from django.db.models import F, OuterRef, Value
from django.db.models.functions import Replace
from reporting.models import report
from reporting.models.configuration_element import ConfigurationElement
from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_version import ReportVersion
from reporting.models.reporting_field import ReportingField
from reporting.service.report_validation.report_validation_error import ReportValidationError
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


def annotated_report_methodology(report_version_id: int):
    config_element = ConfigurationElement.objects.filter(
        activity_id=OuterRef("report_emission__report_source_type__report_activity__activity_id"),
        source_type_id=OuterRef("report_emission__report_source_type__source_type_id"),
        gas_type_id=OuterRef("report_emission__gas_type_id"),
        methodology_id=OuterRef("methodology_id"),
        valid_from__valid_from__year__lte=OuterRef("report_version__report__reporting_year_id"),
        valid_to__valid_to__year__gte=OuterRef("report_version__report__reporting_year_id"),
    ).values("id")[:1]

    return (
        ReportMethodology.objects.select_related(
            "report_emission",
            "report_emission__report_source_type",
            "report_emission__report_source_type__report_activity",
            "report_version__report",
        )
        .filter(
            report_version_id=report_version_id,
        )
        .annotate(
            matching_config=config_element,
        )
    )


def validate_configuration_elements_present(report_version: ReportVersion) -> dict[str, ReportValidationError]:

    missing_config = annotated_report_methodology(report_version.id).filter(matching_config__isnull=True).values("id")

    if missing_config.exists():
        raise SystemError(
            f"Missing configuration elements for report methodology IDs: {str.join(" ", [m['id'] for m in missing_config])}"
        )


def validate_reporting_fields(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validate that for each ReportMethodology record, the reported fields are
    - either listed in its configuration ConfigurationElementReportingField models
    - or are a Unit field for an available reporting field (i.e. fieldSlug + "FieldUnits")
    """
    methodology_records = annotated_report_methodology(report_version.id).annotate(
        allowed_slugs=(
            ConfigurationElement.objects.filter(id=OuterRef("matching_config"))
            .annotate(slugs=ArrayAgg("reporting_fields__slug"))
            .values("slugs")
        )
    )

    for key in methodology_records.json_data.keys():
        slug = key.replace("FieldUnits", "")
        if not methodology_records.matching_config.reporting_fields.filter(slug=slug).exists():
            raise SystemError(
                f"Missing reporting field with slug '{slug}' in configuration for ReportMethodology ID {rm.id} and report version ID {report_version.id}"
            )


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validator ensuring that all the activity data reported has a matching configuration
    defined for the reporting year of the report.

    For each ReportMethodlogy record:
    - Collect ReportMethodology -> ReportEmission (Gas Type) -> ReportSourceType -> ReportActivity -> Report (Reporting Year)
    - Validate that there is a ConfigurationElement record matching that combination
    - Validate that the extra reporting fields reported are in that configuration element
    """
