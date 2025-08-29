from model_bakery import baker
from model_bakery.baker import make_recipe
from decimal import Decimal

from registration.models import Operation
from reporting.models import (
    ReportEmissionAllocation,
    ProductEmissionIntensity,
)
from registration.utils import custom_reverse_lazy
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportFinalReview(CommonTestSetup):
    def setup_method(self):
        super().setup_method()

        self.emission_category_ = make_recipe("reporting.tests.utils.emission_category", category_type="basic")
        self.activity_1 = make_recipe("reporting.tests.utils.activity")
        self.activity_2 = make_recipe("reporting.tests.utils.activity")
        self.regulated_product_1 = make_recipe("registration.tests.utils.regulated_product", name='Cement equivalent')
        self.regulated_product_2 = make_recipe(
            "registration.tests.utils.regulated_product", name='Chemicals: pure hydrogen peroxide'
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
        self.report_operation.regulated_products.set([self.regulated_product_1, self.regulated_product_2])
        Operation.objects.filter(pk=self.report_version.report.operation.id).update(naics_code_id=1)
        self.report_version.report.reporting_year_id = 2024
        self.report_version.report.save()
        self.report_operation_representative = baker.make_recipe(
            'reporting.tests.utils.report_operation_representative', report_version=self.report_version
        )
        self.report_person_responsible = make_recipe(
            'reporting.tests.utils.report_person_responsible', report_version=self.report_version
        )
        self.report_non_attributable_emissions = baker.make_recipe(
            "reporting.tests.utils.report_non_attributable_emissions", report_version=self.report_version
        )
        self.compliance_summary = baker.make_recipe(
            "reporting.tests.utils.report_compliance_summary", report_version=self.report_version
        )
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report", report_version=self.report_version
        )
        self.report_product_1 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.report_version,
            product_id=self.regulated_product_1.id,
            annual_production=Decimal('100000'),
            production_data_apr_dec=Decimal('50000'),
        )
        self.report_product_2 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.report_version,
            product_id=self.regulated_product_2.id,
            annual_production=Decimal('100000'),
            production_data_apr_dec=Decimal('25000'),
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
            facility_report=self.facility_report,
            activity=self.activity_1,
        )
        self.report_raw_activity_data = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
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
        assert response_data["report_type"] == self.report_version.report_type
        assert response_data["status"] == self.report_version.status

        # Operation info
        report_op = response_data["report_operation"]
        assert report_op["operation_name"] == self.report_version.report_operation.operation_name

        assert isinstance(report_op["activities"], str)
        assert self.activity_1.name in report_op["activities"]
        assert self.activity_2.name in report_op["activities"]

        assert isinstance(report_op["regulated_products"], str)
        assert self.regulated_product_1.name in report_op["regulated_products"]
        assert self.regulated_product_2.name in report_op["regulated_products"]

        assert isinstance(report_op["representatives"], str)
        assert self.report_operation_representative.representative_name in report_op["representatives"]

        # Facility reports
        facility_reports = response_data["facility_reports"]
        assert len(facility_reports) == self.report_version.facility_reports.count()

        sorted_facilities_response = sorted(facility_reports.values(), key=lambda x: x["facility_name"])
        sorted_facilities_original = sorted(
            list(self.report_version.facility_reports.all()), key=lambda x: x.facility_name
        )

        for i, facility_response in enumerate(sorted_facilities_response):
            original_fr = sorted_facilities_original[i]
            assert facility_response["facility_name"] == original_fr.facility_name

            # Activity data
            activity_data = facility_response["activity_data"]
            assert len(activity_data) == original_fr.reportrawactivitydata_records.count()
            for activity_name, activity_details in activity_data.items():
                assert "activity" in activity_details
                assert activity_name == activity_details["activity"]
                assert "source_types" in activity_details

            # Report products
            report_products = facility_response["report_products"]
            assert len(report_products) == original_fr.report_products.count()
            for product_name, product_details in report_products.items():
                assert "product" in product_details
                assert product_name == product_details["product"]
                assert "unit" in product_details
                assert "annual_production" in product_details

            # Report emission allocations
            allocation = facility_response["report_emission_allocation"]
            product_allocations = allocation["report_product_emission_allocations"]
            assert allocation["allocation_methodology"] == self.report_emission_allocation.allocation_methodology

            for emission_allocation in product_allocations:
                assert "emission_category_name" in emission_allocation
                assert "products" in emission_allocation
                products = emission_allocation["products"]
                for product in products:
                    assert "report_product_id" in product
                    assert "product_name" in product
                    assert "allocated_quantity" in product

    def test_get_report_final_review_data_for_lfo_success(self):
        """
        Test the /report-version/{version_id}/final-review-lfo endpoint.
        """
        endpoint = custom_reverse_lazy(
            "get_report_final_review_data_for_lfo",
            kwargs={"version_id": self.report_version.id},
        )

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint)
        assert response.status_code == 200
        data = response.json()

        assert data["report_type"] == self.report_version.report_type
        assert data["status"] == self.report_version.status

        # Facility reports are included
        assert "facility_reports" in data
        assert isinstance(data["facility_reports"], list)
        assert any(fr["facility"] == str(self.facility_report.facility_id) for fr in data["facility_reports"])

        assert "report_operation" in data
        assert "report_person_responsible" in data
        assert "report_additional_data" in data

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

        assert data["facility"] == str(self.facility_report.facility_id)
        assert data["facility_name"] == self.facility_report.facility_name

        activity_data = data["activity_data"]
        for activity_name, details in activity_data.items():
            assert "activity" in details
            assert activity_name == details["activity"]

        report_products = data["report_products"]
        for product_name, details in report_products.items():
            assert "product" in details
            assert product_name == details["product"]

        assert "emission_summary" in data

        assert "report_emission_allocation" in data
