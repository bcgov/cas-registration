from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import OuterRef, QuerySet
from reporting.models.configuration_element import ConfigurationElement
from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import ReportValidationError
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


def annotated_report_methodology(report_version_id: int) -> QuerySet[ReportMethodology]:
    config_element = ConfigurationElement.objects.filter(
        activity_id=OuterRef("report_emission__report_source_type__report_activity__activity_id"),
        source_type_id=OuterRef("report_emission__report_source_type__source_type_id"),
        gas_type_id=OuterRef("report_emission__gas_type_id"),
        methodology_id=OuterRef("methodology_id"),
        valid_from__valid_from__year__lte=OuterRef("report_version__report__reporting_year_id"),
        valid_to__valid_to__year__gte=OuterRef("report_version__report__reporting_year_id"),
    ).values("id")[:1]

    return ReportMethodology.objects.filter(
        report_version_id=report_version_id,
    ).annotate(
        matching_config_id=config_element,
    )


def validate_configuration_elements_present(report_version: ReportVersion) -> dict[str, ReportValidationError]:

    missing_config = (
        annotated_report_methodology(report_version.id).filter(matching_config_id__isnull=True).values("id")  # type: ignore
    )

    if missing_config.exists():
        raise SystemError(
            f"Missing configuration elements for report methodology IDs: {str.join(', ', [str(m['id']) for m in missing_config])}"
        )

    return {}


def validate_reporting_fields(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validate that for each ReportMethodology record, the reported fields are
    - either listed in its configuration ConfigurationElementReportingField models
    - or are a Unit field for an available reporting field (i.e. fieldSlug + "FieldUnits")
    """
    methodology_records = annotated_report_methodology(report_version.id).annotate(
        allowed_slugs=(
            ConfigurationElement.objects.filter(id=OuterRef("matching_config_id"))
            .annotate(slugs=ArrayAgg("reporting_fields__slug"))
            .values("slugs")
        )
    )

    for record in methodology_records:
        reported_slugs = {r.replace("FieldUnits", "") for r in record.json_data.keys()}
        allowed_slugs = set(record.allowed_slugs)

        if not reported_slugs.issubset(allowed_slugs):
            raise SystemError(
                f"ReportMethodology ID {record.id} has reporting fields {reported_slugs - allowed_slugs} which are not in the allowed fields {allowed_slugs} of its matching configuration element."
            )

    return {}


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validator ensuring that all the activity data reported has a matching configuration
    defined for the reporting year of the report.

    For each ReportMethodlogy record:
    - Collect ReportMethodology -> ReportEmission (Gas Type) -> ReportSourceType -> ReportActivity -> Report (Reporting Year)
    - Validate that there is a ConfigurationElement record matching that combination
    - Validate that the extra reporting fields reported are in that configuration element
    """

    validate_configuration_elements_present(report_version)
    validate_reporting_fields(report_version)

    # This validator only raises system errors
    # Errors found by this validator are not expected to be fixable by users, but rather indicate a bug or malicious manipulation of data inputs.
    return {}
