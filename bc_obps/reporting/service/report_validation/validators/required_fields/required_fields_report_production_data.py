from typing import ClassVar
from django.db.models import Count, Prefetch
from reporting.service.report_product_service import ReportProductService
from registration.models.operation import Operation
from reporting.models.facility_report import FacilityReport
from reporting.models.report_product import ReportProduct
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.validators.required_fields.base_required_fields_validator import (
    BaseRequiredFieldsValidator,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.report_validation.validators.required_fields.utils import (
    collect_missing_fields_many,
)
from reporting.service.reporting_flow_service import ReportingFlow


class RequiredFieldsProductionDataValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "production_data"
    SECTION_TITLE: ClassVar[str] = "Production data"

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = [
        {"field": "product", "label": "Product", "field_type": "scalar"},
        {"field": "annual_production", "label": "Annual production", "field_type": "scalar"},
        {"field": "production_methodology", "label": "Production methodology", "field_type": "scalar"},
    ]

    @classmethod
    def requires_jan_mar(cls, report_version: ReportVersion) -> bool:
        report = report_version.report
        operation = report.operation

        return (
            report.reporting_year_id == 2025
            and operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
            and operation.opted_in_operation is not None
            and operation.opted_in_operation.final_reporting_year_id == 2025
        )

    @classmethod
    def get_product_missing_fields(
        cls,
        *,
        report_product: ReportProduct,
        reporting_year_id: int,
        requires_jan_mar: bool,
    ) -> list[str]:
        missing_fields: list[str] = []

        if reporting_year_id == 2024 and report_product.production_data_apr_dec is None:
            missing_fields.append("Apr-Dec production data")

        if requires_jan_mar and report_product.production_data_jan_mar is None:
            missing_fields.append("Jan-Mar production data")

        if (
            report_product.production_methodology == ReportProduct.ProductionMethodologyChoices.OTHER
            and not report_product.production_methodology_description
        ):
            missing_fields.append("Production methodology description")

        return missing_fields

    @classmethod
    def get_facility_missing_fields(
        cls,
        *,
        queryset: list[ReportProduct],
        report_version: ReportVersion,
        requires_jan_mar: bool,
    ) -> list[str]:
        missing_field_labels = collect_missing_fields_many(
            queryset,
            cls.REQUIRED_FIELDS,
        )

        for report_product in queryset:
            missing_field_labels.extend(
                cls.get_product_missing_fields(
                    report_product=report_product,
                    reporting_year_id=report_version.report.reporting_year_id,
                    requires_jan_mar=requires_jan_mar,
                )
            )

        return sorted(set(missing_field_labels))

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        errors: dict[str, ReportValidationError] = {}
        allowed_products = ReportProductService.get_allowed_products(report_version.id)

        # Skip if nothing should be reported
        if not allowed_products:
            return errors

        requires_jan_mar = cls.requires_jan_mar(report_version)

        facility_reports = (
            FacilityReport.objects.filter(report_version=report_version)
            .annotate(product_count=Count("report_products"))
            .prefetch_related(
                Prefetch(
                    "report_products",
                    queryset=ReportProduct.objects.filter(report_version=report_version),
                    to_attr="prefetched_report_products",
                )
            )
        )

        for facility_report in facility_reports:
            error_key = f"error_required_fields_{cls.SECTION}_facility_{facility_report.facility_id}"

            # No ReportProduct rows
            if facility_report.product_count == 0:
                missing_fields = [item["label"] for item in cls.REQUIRED_FIELDS]

                if report_version.report.reporting_year_id == 2024:
                    missing_fields.append("Apr-Dec production data")

                if requires_jan_mar:
                    missing_fields.append("Jan-Mar production data")

                errors[error_key] = cls.build_error(
                    report_version_id=report_version.id,
                    facility_id=facility_report.facility_id,
                    facility_name=facility_report.facility_name,
                    missing_field_labels=missing_fields,
                )
                continue

            missing_field_labels = cls.get_facility_missing_fields(
                queryset=facility_report.prefetched_report_products,
                report_version=report_version,
                requires_jan_mar=requires_jan_mar,
            )

            if missing_field_labels:
                errors[error_key] = cls.build_error(
                    report_version_id=report_version.id,
                    facility_id=facility_report.facility_id,
                    facility_name=facility_report.facility_name,
                    missing_field_labels=missing_field_labels,
                )

        return errors
