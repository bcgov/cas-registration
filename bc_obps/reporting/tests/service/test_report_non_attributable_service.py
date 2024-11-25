import pytest
from model_bakery import baker
from reporting.models import ReportNonAttributableEmissions
from reporting.schema.report_non_attributable_emissions import ReportNonAttributableIn
from reporting.service.report_non_attributable_service import ReportNonAttributableService

pytestmark = pytest.mark.django_db


class TestReportNonAttributableService:
    def setup_method(self):
        # Create test data using model_bakery recipes
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report", report_version=self.report_version
        )
        self.facility_id = self.facility_report.facility.id
        self.report_version_id = self.report_version.id

        self.test_data = [
            {
                "id": 1,
                "emission_category": baker.make_recipe("reporting.tests.utils.emission_category"),
                "gas_type": [baker.make_recipe("reporting.tests.utils.gas_type")],
                "activity": "Test Activity 1",
                "source_type": "Test Source 1",
            },
            {
                "id": 2,
                "emission_category": baker.make_recipe("reporting.tests.utils.emission_category"),
                "gas_type": [baker.make_recipe("reporting.tests.utils.gas_type")],
                "activity": "Test Activity 2",
                "source_type": "Test Source 2",
            },
        ]

    def test_get_report_non_attributable_by_version_id(self):
        # Create initial data
        for data in self.test_data:
            emission = ReportNonAttributableEmissions.objects.create(
                facility_report=self.facility_report,
                emission_category=data["emission_category"],
                activity=data["activity"],
                source_type=data["source_type"],
                report_version=self.report_version,  # Ensure report_version is set
            )
            emission.gas_type.set(data["gas_type"])

        # Test the service
        result = ReportNonAttributableService.get_report_non_attributable_by_version_id(
            self.report_version_id, self.facility_id
        )

        assert len(result) == len(self.test_data)
        assert all(isinstance(emission, ReportNonAttributableEmissions) for emission in result)

    def test_save_report_non_attributable_emissions(self):
        new_data = [
            ReportNonAttributableIn(
                id=1,
                activity="Test Activity 3",
                source_type="Test Source 3",
                emission_category=self.test_data[0]["emission_category"].category_name,
                gas_type=[gas.chemical_formula for gas in self.test_data[0]["gas_type"]],
            ),
            ReportNonAttributableIn(
                id=2,
                activity="Test Activity 4",
                source_type="Test Source 4",
                emission_category=self.test_data[1]["emission_category"].category_name,
                gas_type=[gas.chemical_formula for gas in self.test_data[1]["gas_type"]],
            ),
        ]

        # Ensure report_version is passed to the service method
        result = ReportNonAttributableService.save_report_non_attributable_emissions(
            self.report_version_id, self.facility_id, new_data
        )

        assert len(result) == len(new_data)
        for i, emission in enumerate(result):
            assert emission.activity == new_data[i].activity
            assert emission.report_version.id == self.report_version_id

    def test_delete_existing_reports(self):
        report_to_delete = ReportNonAttributableEmissions.objects.create(
            facility_report=self.facility_report,
            emission_category=self.test_data[0]["emission_category"],
            activity="Test Activity to Delete",
            source_type="Test Source to Delete",
            report_version=self.report_version,  # Ensure report_version is set
        )
        report_to_delete.gas_type.set(self.test_data[0]["gas_type"])

        # Call the service to delete reports
        ReportNonAttributableService.delete_existing_reports(self.report_version_id, self.facility_id)

        # Ensure the report is deleted
        assert not ReportNonAttributableEmissions.objects.filter(id=report_to_delete.id).exists()
