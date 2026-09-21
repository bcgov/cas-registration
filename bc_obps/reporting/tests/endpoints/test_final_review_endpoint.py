from model_bakery import baker
from model_bakery.baker import make_recipe
from decimal import Decimal

import pytest
from reporting.models import (
    ReportEmissionAllocation,
    ProductEmissionIntensity,
)
from registration.utils import custom_reverse_lazy
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models.emission_category import EmissionCategory


@pytest.mark.django_db
class TestReportFinalReview(CommonTestSetup):
    def setup_method(self):
        super().setup_method()

        self.emission_category_ = EmissionCategory.objects.get(
            category_name="Stationary fuel combustion emissions", category_type="basic"
        )
        self.activity_1 = make_recipe("reporting.tests.utils.activity", name="very fake activity")
        self.activity_2 = make_recipe("reporting.tests.utils.activity", name="fake activity")
        self.regulated_product_1 = make_recipe(
            "registration.tests.utils.regulated_product", name='Test Cement equivalent'
        )
        self.regulated_product_2 = make_recipe(
            "registration.tests.utils.regulated_product", name='Test Chemicals: pure hydrogen peroxide'
        )
        self.unregulated_product = make_recipe(
            "registration.tests.utils.regulated_product",
            name="Test Unregulated Product",
            is_regulated=False,
        )
        self.report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=baker.make_recipe("reporting.tests.utils.report"),
            report_type="Annual Report",
            status="Draft",
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)
        self.report_operation = baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
            registration_purpose=self.report_version.report.operation.registration_purpose,
            operation_name="Test Operation",
        )
        self.report_operation.activities.set([self.activity_1, self.activity_2])
        self.report_operation.regulated_products.set(
            [self.regulated_product_1, self.regulated_product_2, self.unregulated_product]
        )
        self.report_operation.naics_code_id = 1
        self.report_operation.save()
        self.report_version.report.reporting_year_id = 2024
        self.report_version.report.save()
        self.report_operation_representative = baker.make_recipe(
            'reporting.tests.utils.report_operation_representative',
            report_version=self.report_version,
            representative_name="Test Representative",
        )
        self.report_person_responsible = make_recipe(
            'reporting.tests.utils.report_person_responsible', report_version=self.report_version
        )
        self.report_non_attributable_emissions = baker.make_recipe(
            "reporting.tests.utils.report_non_attributable_emissions",
            report_version=self.report_version,
            emission_category=self.emission_category_,
        )
        self.compliance_summary = baker.make_recipe(
            "reporting.tests.utils.report_compliance_summary", report_version=self.report_version
        )
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            facility_name="test facility name",
        )
        self.report_product_1 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.report_version,
            facility_report=self.facility_report,
            product_id=self.regulated_product_1.id,
            annual_production=Decimal('100002'),
            production_data_apr_dec=Decimal('50000'),
        )
        self.report_product_2 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.report_version,
            facility_report=self.facility_report,
            product_id=self.regulated_product_2.id,
            annual_production=Decimal('100000'),
            production_data_apr_dec=Decimal('1000'),
        )
        self.report_product_3 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.report_version,
            facility_report=self.facility_report,
            product_id=self.unregulated_product.id,
            annual_production=Decimal('0'),
            production_data_apr_dec=Decimal('0'),
        )
        self.product_emission_intensity_1 = ProductEmissionIntensity.objects.create(
            product=self.regulated_product_1,
            product_weighted_average_emission_intensity='0.6262',
            valid_from='2023-01-01',
            valid_to='9999-12-31',
        )
        self.product_emission_intensity_2 = ProductEmissionIntensity.objects.create(
            product=self.regulated_product_2,
            product_weighted_average_emission_intensity='0.7321',
            valid_from='2023-01-01',
            valid_to='9999-12-31',
        )
        self.report_activity = baker.make_recipe(
            "reporting.tests.utils.report_activity",
            report_version=self.report_version,
            facility_report=self.facility_report,
            activity=self.activity_1,
        )
        self.report_raw_activity_data = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
            report_version=self.report_version,
            facility_report=self.facility_report,
            activity=self.activity_1,
            json_data={
                "testSourceType": True,
                "sourceTypes": {"testSourceType": {"prop1": "value1", "prop3": "value3"}},
            },
        )
        self.report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=self.report_version,
            facility_report=self.facility_report,
            allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.OTHER,
            allocation_other_methodology_description="Test description",
        )
        self.report_product_emission_allocation = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=self.report_version,
            report_emission_allocation=self.report_emission_allocation,
            report_product=self.report_product_1,
            emission_category=self.emission_category_,
            allocated_quantity=100.5,
        )
        self.additional_reporting_data = make_recipe(
            "reporting.tests.utils.report_additional_data",
            report_version=self.report_version,
        )
        self.reportnonattributableemissions_records = baker.make_recipe(
            "reporting.tests.utils.report_non_attributable_emissions",
            report_version=self.report_version,
            facility_report=self.facility_report,
            emission_category=self.emission_category_,
        )
        self.endpoint_under_test = f"/report-version/{self.report_version.id}/final-review"

    def test_get_report_final_review_data_success(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_final_review_data",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 200
        response_data = response.json()

        # Basic report info
        assert response_data["report_type"] == "Annual Report"
        assert response_data["status"] == "Draft"

        # Operation info
        report_op = response_data["report_operation"]
        assert report_op["operation_name"] == "Test Operation"
        assert report_op["activities"] == "very fake activity; fake activity"
        assert (
            report_op["regulated_products"]
            == "Test Cement equivalent; Test Chemicals: pure hydrogen peroxide; Test Unregulated Product"
        )
        assert report_op["representatives"] == "Test Representative"

        # Facility reports
        facility_reports = response_data["facility_reports"]
        assert len(facility_reports) == 1

        print(facility_reports)

        facility_response = facility_reports["test facility name"]

        assert facility_response["facility_name"] == "test facility name"

        # Activity data
        activity_data = facility_response["activity_data"]
        assert len(activity_data) == 1
        for activity_name, activity_details in activity_data.items():
            assert "activity" in activity_details
            assert activity_name == activity_details["activity"]
            assert "source_types" in activity_details

        # Report products
        report_products = facility_response["report_products"]
        assert len(report_products) == 2
        for product_name, product_details in report_products.items():
            assert "product" in product_details
            assert product_name == product_details["product"]
            assert "unit" in product_details
            assert "annual_production" in product_details

        # Report emission allocations
        allocation = facility_response["report_emission_allocation"]
        product_allocations = allocation["report_product_emission_allocations"]
        assert allocation["allocation_methodology"] == "Other"

        # The schema returns the result from the report product emission allocation service
        # One record per non-other-excluded emission category
        assert len(EmissionCategory.objects.exclude(category_type="other_excluded")) == 12
        assert len(product_allocations) == 12

        for emission_allocation in product_allocations:
            assert "emission_category_name" in emission_allocation
            assert "products" in emission_allocation
            products = emission_allocation["products"]
            assert len(products) == 3
            for product in products:
                assert "report_product_id" in product
                assert "product_name" in product
                assert "allocated_quantity" in product

    def test_get_report_version_facility_report_success(self):
        """
        Test the /report-version/{version_id}/final-review/{facility_id}/facility-reports endpoint.
        """
        endpoint = custom_reverse_lazy(
            "get_report_version_facility_report",
            kwargs={
                "version_id": self.report_version.id,
                "facility_id": str(self.facility_report.facility_id),
            },
        )

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint)
        assert response.status_code == 200
        data = response.json()

        # Basic facility info
        assert data["facility"] == str(self.facility_report.facility_id)
        assert data["facility_name"] == self.facility_report.facility_name

        expected_activity_data = {}
        for raw_activity in self.report_version.facility_reports.first().reportrawactivitydata_records.all():
            activity_name = raw_activity.activity.name
            expected_activity_data[activity_name] = {
                "activity": activity_name,
                "source_types": raw_activity.json_data.get("sourceTypes", {}),
            }

        assert data["activity_data"] == {
            'very fake activity': {
                'activity': 'very fake activity',
                'source_types': {
                    'testSourceType': {
                        'prop1': 'value1',
                        'prop3': 'value3',
                    },
                },
            },
        }

        expected_report_products = {
            'Test Cement equivalent': {
                'product': 'Test Cement equivalent',
                'unit': 'N/A',
                'annual_production': 100002.0,
                'production_data_jan_mar': None,
                'production_data_apr_dec': 50000.0,
                'production_methodology': 'OBPS Calculator',
                'production_methodology_description': None,
                'storage_quantity_start_of_period': None,
                'storage_quantity_end_of_period': None,
                'quantity_sold_during_period': None,
                'quantity_throughput_during_period': None,
            },
            'Test Chemicals: pure hydrogen peroxide': {
                'product': 'Test Chemicals: pure hydrogen peroxide',
                'unit': 'N/A',
                'annual_production': 100000.0,
                'production_data_jan_mar': None,
                'production_data_apr_dec': 1000.0,
                'production_methodology': 'OBPS Calculator',
                'production_methodology_description': None,
                'storage_quantity_start_of_period': None,
                'storage_quantity_end_of_period': None,
                'quantity_sold_during_period': None,
                'quantity_throughput_during_period': None,
            },
        }
        assert data["report_products"] == expected_report_products

        # Emission summary
        assert "emission_summary" in data

        # Report emission allocations
        assert "report_emission_allocation" in data
        allocation = data["report_emission_allocation"]
        assert allocation["allocation_methodology"] == self.report_emission_allocation.allocation_methodology

        product_allocations = allocation["report_product_emission_allocations"]
        for emission_allocation in product_allocations:
            assert "emission_category_name" in emission_allocation
            assert "products" in emission_allocation
            for product in emission_allocation["products"]:
                assert "report_product_id" in product
                assert "product_name" in product
                assert "allocated_quantity" in product
