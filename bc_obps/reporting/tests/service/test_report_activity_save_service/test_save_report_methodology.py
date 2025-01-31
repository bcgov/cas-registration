from django.test import TestCase
from reporting.models.methodology import Methodology
from reporting.tests.utils.report_data_bakers import report_emission_baker
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from model_bakery.baker import make_recipe


class TestSaveReportMethodology(TestCase):
    def test_save_methodology(self):
        test_infrastructure = TestInfrastructure.build()
        report_activity = test_infrastructure.make_report_activity()
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")
        report_emission = report_emission_baker()

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_methodology(
            report_emission,
            {
                "id": 9001,
                "methodology": "Default HHV/Default EF",
                "fuelDefaultHighHeatingValue": 11,
                "unitFuelCo2DefaultEmissionFactor": 23,
                "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
            },
        )

        assert return_value.json_data == {
            "fuelDefaultHighHeatingValue": 11,
            "unitFuelCo2DefaultEmissionFactor": 23,
            "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
        }
        assert return_value.methodology_id == 1
        assert return_value.report_emission_id == report_emission.id
        assert return_value.report_version == test_infrastructure.report_version

    def test_update_emission(self):
        test_infrastructure = TestInfrastructure.build()
        report_activity = test_infrastructure.make_report_activity()
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")
        report_emission = report_emission_baker()

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_methodology(
            report_emission,
            {
                "id": 9001,
                "methodology": "Default HHV/Default EF",
            },
        )

        updated_return_value = service_under_test.save_methodology(
            report_emission,
            {
                "id": 9001,
                "methodology": "Default HHV/Default EF",
                "unitFuelCo2DefaultEmissionFactor": 3,
                "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
            },
        )

        assert return_value.id == updated_return_value.id
        assert return_value.json_data == {}
        assert updated_return_value.json_data == {
            "unitFuelCo2DefaultEmissionFactor": 3,
            "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
        }
        assert updated_return_value.methodology_id == Methodology.objects.get(name="Default HHV/Default EF").id
