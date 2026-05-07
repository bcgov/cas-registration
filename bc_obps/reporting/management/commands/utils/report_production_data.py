from django.db import transaction

from registration.models import RegulatedProduct
from reporting.models.facility_report import FacilityReport
from reporting.models.report_product import ReportProduct
from reporting.models.report_version import ReportVersion


@transaction.atomic()
def prepare_production_data_for_submission(
    report_version: ReportVersion,
) -> None:
    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    for facility_report in facility_reports:
        create_report_product_for_facility_report(facility_report)


def create_report_product_for_facility_report(
    facility_report: FacilityReport,
) -> ReportProduct:
    product = get_default_regulated_product()
    reporting_year = facility_report.report_version.report.reporting_year.reporting_year
    report_product, _ = ReportProduct.objects.get_or_create(
        facility_report=facility_report,
        product=product,
        defaults={
            "report_version": facility_report.report_version,
            "annual_production": 100,
            "production_methodology": ReportProduct.ProductionMethodologyChoices.OBPS_CALCULATOR,
            "production_data_apr_dec": 75 if reporting_year == 2024 else 0,
            "production_data_jan_mar": 25 if reporting_year == 2025 else 0,
        },
    )

    return report_product


def get_default_regulated_product() -> RegulatedProduct:
    product = RegulatedProduct.objects.first()

    if product is None:
        raise RuntimeError("No RegulatedProduct found")

    return product
