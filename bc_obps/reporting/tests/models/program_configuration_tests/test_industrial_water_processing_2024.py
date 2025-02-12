from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest


class IndustrialWasterWaterProcessing2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "Industrial wastewater processing"
        cls.year = 2024
        cls.config_element_count = 11
        cls.config = {
            "Industrial wastewater process using anaerobic digestion": {
                "CH4": {
                    "Chemical Oxygen Demand": 1,
                    "Biochemical Oxygen Demand": 1,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "Nitrogen in effluent": 1,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Oil-water separators": {
                "CH4": {
                    "Default conversion factor": 0,
                    "Measured conversion factor": 1,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
        }
