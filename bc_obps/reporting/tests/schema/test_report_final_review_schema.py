import pytest
from model_bakery import baker
from reporting.schema.report_final_review import FacilityReportSchema


@pytest.mark.django_db
class TestReportFinalReviewSchema:

    def test_report_products_should_only_resolve_regulated_products(self):
        facility_report = baker.make_recipe("reporting.tests.utils.facility_report")
        report_products = [
            baker.make_recipe(
                "reporting.tests.utils.report_product",
                facility_report=facility_report,
                report_version=facility_report.report_version,
                product__is_regulated=True,
                product__name="Regulated Product 1",
            ),
            baker.make_recipe(
                "reporting.tests.utils.report_product",
                facility_report=facility_report,
                report_version=facility_report.report_version,
                product__is_regulated=True,
                product__name="Regulated Product 2",
            ),
            baker.make_recipe(
                "reporting.tests.utils.report_product",
                facility_report=facility_report,
                report_version=facility_report.report_version,
                product__is_regulated=False,
                product__name="Unregulated Product 1",
            ),
        ]

        resolved = FacilityReportSchema.resolve_report_products(facility_report)

        assert resolved == {
            "Regulated Product 1": report_products[0],
            "Regulated Product 2": report_products[1],
        }
