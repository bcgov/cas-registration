import pytest
from reporting.service.review_changes_service.report_review_changes_service import (
    ReportReviewChangesService,
    _is_false_positive_product_change,
    _normalize_products,
    _get_field_display_title,
)

pytestmark = pytest.mark.django_db

BASE_PATH = "reporting.service.review_changes_service.report_review_changes_service"


@pytest.fixture
def mock_detect_renames(mocker):
    return mocker.patch(
        f"{BASE_PATH}.detect_renames",
        return_value=[],
    )


@pytest.fixture
def mock_diff_sections(mocker):
    return mocker.patch(
        f"{BASE_PATH}.diff_sections",
        return_value=[],
    )


@pytest.fixture
def mock_fix_facility_uuid_in_path(mocker):
    return mocker.patch(
        f"{BASE_PATH}.fix_facility_uuid_in_path",
        side_effect=lambda path, _: path,
    )


@pytest.fixture
def mock_get_reporting_field_titles(mocker):
    return mocker.patch(
        f"{BASE_PATH}._get_reporting_field_display_titles",
        return_value={"total_emissions": "Total Emissions Field"},
    )


class TestGetFieldDisplayTitle:
    def test_parses_nested_bracket_notation_correctly(self):
        titles = {"target_field": "Target Display Name"}
        path = "root['facility_reports']['uuid-123']['target_field']"
        assert _get_field_display_title(path, titles) == "Target Display Name"

    def test_handles_trailing_array_indices_safely(self):
        titles = {"target_field": "Target Display Name"}
        path = "root['facility_reports'][0]"
        assert _get_field_display_title(path, titles) is None


class TestNormalizeProducts:
    def test_normalizes_products_by_name_and_allocated_quantity(self):
        products = [
            {"product_name": "Product B", "allocated_quantity": 50, "report_product_id": 2},
            {"product_name": "Product A", "allocated_quantity": 100, "report_product_id": 1},
        ]
        result = _normalize_products(products)
        assert result == [("Product A", 100), ("Product B", 50)]

    def test_returns_none_for_malformed_product(self):
        products = [{"product_name": "Product A", "allocated_quantity": 100}, "invalid-product"]
        assert _normalize_products(products) is None


class TestIsFalsePositiveProductChange:
    def test_returns_true_when_product_allocations_are_equivalent(self):
        change = {
            "old_value": {
                "products": [{"product_name": "Product A", "allocated_quantity": 100, "report_product_id": 1}]
            },
            "new_value": {
                "products": [{"product_name": "Product A", "allocated_quantity": 100, "report_product_id": 2}]
            },
        }
        assert _is_false_positive_product_change(change) is True

    def test_returns_true_when_products_are_same_but_order_changed(self):
        change = {
            "old_value": {
                "products": [
                    {"product_name": "Product A", "allocated_quantity": 100, "report_product_id": 1},
                    {"product_name": "Product B", "allocated_quantity": 50, "report_product_id": 2},
                ]
            },
            "new_value": {
                "products": [
                    {"product_name": "Product B", "allocated_quantity": 50, "report_product_id": 22},
                    {"product_name": "Product A", "allocated_quantity": 100, "report_product_id": 11},
                ]
            },
        }
        assert _is_false_positive_product_change(change) is True

    def test_returns_false_when_allocated_quantity_changed(self):
        change = {
            "old_value": {"products": [{"product_name": "Product A", "allocated_quantity": 100}]},
            "new_value": {"products": [{"product_name": "Product A", "allocated_quantity": 200}]},
        }

        assert _is_false_positive_product_change(change) is False

    def test_returns_false_when_product_name_changed(self):
        change = {
            "old_value": {"products": [{"product_name": "Product A", "allocated_quantity": 100}]},
            "new_value": {"products": [{"product_name": "Product B", "allocated_quantity": 100}]},
        }

        assert _is_false_positive_product_change(change) is False

    def test_returns_false_when_old_or_new_value_is_not_dict(self):
        change = {
            "old_value": "bad-value",
            "new_value": {"products": []},
        }

        assert _is_false_positive_product_change(change) is False


class TestReportReviewChangesService:
    def test_get_report_version_diff_changes_success(
        self,
        mock_get_reporting_field_titles,
        mock_detect_renames,
        mock_diff_sections,
        mock_fix_facility_uuid_in_path,
    ):

        prev = {"total_emissions": 500, "status": "draft"}
        curr = {"total_emissions": 750, "status": "submitted"}

        results = ReportReviewChangesService.get_report_version_diff_changes(prev, curr)

        # "status" is noisy, so it should be skipped; only total_emissions remains
        assert len(results) == 1
        assert results == [
            {
                "field": "root['total_emissions']",
                "field_display_title": "Total Emissions Field",
                "old_value": 500,
                "new_value": 750,
                "change_type": "modified",
            }
        ]
        assert results[0]["old_value"] == 500
        assert results[0]["new_value"] == 750
        assert results[0]["field_display_title"] == "Total Emissions Field"

    def test_get_report_version_diff_changes_ignores_report_product_id_only_change(
        self,
        mock_get_reporting_field_titles,
        mock_detect_renames,
        mock_diff_sections,
        mock_fix_facility_uuid_in_path,
    ):
        prev = {
            "report_compliance_summary": {
                "products": [
                    {
                        "name": "Product A",
                        "allocated_quantity": 100,
                        "report_product_id": 1,
                    }
                ]
            }
        }
        curr = {
            "report_compliance_summary": {
                "products": [
                    {
                        "name": "Product A",
                        "allocated_quantity": 100,
                        "report_product_id": 2,
                    }
                ]
            }
        }

        results = ReportReviewChangesService.get_report_version_diff_changes(prev, curr)

        assert results == []
