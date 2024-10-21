import pytest
from reporting.service.report_product_service import ReportProductService
from model_bakery.baker import make_recipe
from reporting.tests.utils import baker_recipes


pytestmark = pytest.mark.django_db


class TestReportingYearService:
    def test_save_data(self):

        make_recipe(baker_recipes.facility_report)

        ReportProductService.save_production_data()

    # Test saving deletes stuff gone
    # Test saving saves new stuff
    # Test saving updates existing stuff
    # Test saving errors out if no product_id

    # Test the created_at and created_by

    # Test retrieves the right data
