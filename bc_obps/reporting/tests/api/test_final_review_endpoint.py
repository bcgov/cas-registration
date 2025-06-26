from model_bakery import baker
from model_bakery.baker import make_recipe
from decimal import Decimal

from registration.models import Operation
from reporting.models import ReportEmissionAllocation, ProductEmissionIntensity
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
                "sourceTypes": {
                    "testSourceType": {
                        "prop1": "value1",
                        "prop3": "value3",
                    }
                },
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
        """
        Tests that the endpoint successfully fetches final review data for a given
        report version ID and returns it in the expected schema format.
        """

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

        assert response_data["id"] == self.report_version.id
        assert response_data["report_type"] == self.report_version.report_type
        assert response_data["status"] == self.report_version.status

        assert "report_operation" in response_data
        assert (
            response_data["report_operation"]["operation_name"] == self.report_version.report_operation.operation_name
        )
        assert "activities" in response_data["report_operation"]
        assert "regulated_products" in response_data["report_operation"]
        assert "representatives" in response_data["report_operation"]
        assert (
            self.report_version.report_operation.activities.first().name
            in response_data["report_operation"]["activities"]
        )

        if self.report_version.report_person_responsible:
            assert "report_person_responsible" in response_data
            assert (
                response_data["report_person_responsible"]["first_name"]
                == self.report_version.report_person_responsible.first_name
            )

        # Assert ReportAdditionalData (can be None)
        if self.report_version.report_additional_data:
            assert "report_additional_data" in response_data
            assert (
                response_data["report_additional_data"]["capture_emissions"]
                == self.report_version.report_additional_data.capture_emissions
            )

        assert "report_electricity_import_data" in response_data
        assert isinstance(response_data["report_electricity_import_data"], list)
        assert (
            len(response_data["report_electricity_import_data"])
            == self.report_version.report_electricity_import_data.count()
        )

        assert "report_new_entrant" in response_data
        assert isinstance(response_data["report_new_entrant"], list)
        assert len(response_data["report_new_entrant"]) == self.report_version.report_new_entrant.count()

        assert "facility_reports" in response_data
        assert isinstance(response_data["facility_reports"], list)
        assert len(response_data["facility_reports"]) == self.report_version.facility_reports.count()

        if response_data["facility_reports"]:
            response_facilities = sorted(response_data["facility_reports"], key=lambda x: x["facility_name"])
            original_facilities = sorted(
                list(self.report_version.facility_reports.all()), key=lambda x: x.facility_name
            )

            for i, facility_response in enumerate(response_facilities):
                original_fr = original_facilities[i]
                assert facility_response["facility_name"] == original_fr.facility_name

                assert "raw_activity_data" in facility_response
                assert isinstance(facility_response["raw_activity_data"], list)
                assert len(facility_response["raw_activity_data"]) == original_fr.reportrawactivitydata_records.count()
                if facility_response["raw_activity_data"]:
                    assert "activity" in facility_response["raw_activity_data"][0]
                    assert (
                        original_fr.reportrawactivitydata_records.first().activity.name
                        in facility_response["raw_activity_data"][0]["activity"]
                    )

                assert "report_products" in facility_response
                assert isinstance(facility_response["report_products"], list)
                assert len(facility_response["report_products"]) == original_fr.report_products.count()
                if facility_response["report_products"]:
                    assert "product" in facility_response["report_products"][0]

                assert "reportnonattributableemissions_records" in facility_response
                assert isinstance(facility_response["reportnonattributableemissions_records"], list)
                if original_fr.reportnonattributableemissions_records.exists():
                    assert (
                        len(facility_response["reportnonattributableemissions_records"])
                        == original_fr.reportnonattributableemissions_records.count()
                    )

                assert "emission_summary" in facility_response

                assert "reportemissionallocation_records" in facility_response
                assert isinstance(facility_response["reportemissionallocation_records"], list)
                assert (
                    len(facility_response["reportemissionallocation_records"])
                    == original_fr.reportemissionallocation_records.count()
                )
                if facility_response["reportemissionallocation_records"]:
                    first_allocation = facility_response["reportemissionallocation_records"][0]
                    assert "allocation_methodology" in first_allocation
                    assert "reportproductemissionallocation_records" in first_allocation
                    assert isinstance(first_allocation["reportproductemissionallocation_records"], list)
                    assert (
                        len(first_allocation["reportproductemissionallocation_records"])
                        == self.report_emission_allocation.reportproductemissionallocation_records.count()
                    )
