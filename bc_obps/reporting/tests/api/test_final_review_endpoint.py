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
        return super().setup_method()

    def test_get_report_final_review_data_success(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

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

        assert response_data["report_type"] == self.report_version.report_type
        assert response_data["status"] == self.report_version.status

        assert "report_operation" in response_data
        assert (
            response_data["report_operation"]["operation_name"] == self.report_version.report_operation.operation_name
        )
        assert "activities" in response_data["report_operation"]
        assert "regulated_products" in response_data["report_operation"]
        assert "representatives" in response_data["report_operation"]

        # Convert facility_reports dict → list if needed
        facility_reports = response_data.get("facility_reports")
        if isinstance(facility_reports, dict):
            facility_reports = list(facility_reports.values())

        assert isinstance(facility_reports, list)
        assert len(facility_reports) == self.report_version.facility_reports.count()

        for i, facility_response in enumerate(sorted(facility_reports, key=lambda x: x["facility_name"])):
            original_fr = sorted(list(self.report_version.facility_reports.all()), key=lambda x: x.facility_name)[i]
            assert facility_response["facility_name"] == original_fr.facility_name

            # Convert activity_data dict → list if needed
            activity_data = facility_response.get("activity_data")
            if isinstance(activity_data, dict):
                activity_data = list(activity_data.values())

            assert isinstance(activity_data, list)
            assert len(activity_data) == original_fr.reportrawactivitydata_records.count()

            if activity_data:
                assert "activity" in activity_data[0]
                assert original_fr.reportrawactivitydata_records.first().activity.name in activity_data[0]["activity"]

            # Convert report_products dict → list if needed
            report_products = facility_response.get("report_products")
            if isinstance(report_products, dict):
                report_products = list(report_products.values())

            assert isinstance(report_products, list)
            assert len(report_products) == original_fr.report_products.count()

            # Convert report_emission_allocation['report_product_emission_allocations'] dict → list
            allocation = facility_response.get("report_emission_allocation", {})
            product_allocations = allocation.get("report_product_emission_allocations", [])
            if isinstance(product_allocations, dict):
                product_allocations = list(product_allocations.values())

            assert isinstance(product_allocations, list)
            assert allocation.get("allocation_methodology") == self.report_emission_allocation.allocation_methodology

            for emission_allocation in product_allocations:
                assert "emission_category_name" in emission_allocation
                assert "products" in emission_allocation
                products = emission_allocation["products"]
                if isinstance(products, dict):
                    products = list(products.values())
                for product in products:
                    assert "report_product_id" in product
                    assert "product_name" in product
                    assert "allocated_quantity" in product
