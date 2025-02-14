from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest


class ElectricityGeneration2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "Electricity generation"
        cls.year = 2024
        cls.config_element_count = 69
        cls.config = {
            "Fuel combustion for electricity generation": {
                "CO2": {
                    "Alternative Parameter Measurement Methodology": 0,
                    "Replacement Methodology": 0,
                    "CEMS": 0,
                    "Measured CC and MW": 3,
                },
                'CH4': {
                    'Default HHV/Default EF': 2,
                    'Default EF': 1,
                    'Measured HHV/Default EF': 2,
                    'Measured EF': 1,
                    'Measured Steam/Default EF': 3,
                    'Heat Input/Default EF': 2,
                    'Alternative Parameter Measurement Methodology': 1,
                    'Replacement Methodology': 1,
                },
                'N2O': {
                    'Default HHV/Default EF': 2,
                    'Default EF': 1,
                    'Measured HHV/Default EF': 2,
                    'Measured EF': 1,
                    'Measured Steam/Default EF': 3,
                    'Heat Input/Default EF': 2,
                    'Alternative Parameter Measurement Methodology': 1,
                    'Replacement Methodology': 1,
                },
            },
            "Acid gas scrubbers and acid gas reagents": {
                "CO2": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Acid gas": 0,
                },
            },
            "Cooling units": {
                "HFC-125 (C2HF5)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-134a (C2H2F4)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-134 (C2H2F4)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-143a (C2H3F3)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-143 (C2H3F3)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-152a (C2H4F2)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-227ea (C3HF7)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-236fa (C3H2F6)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-23 (CHF3)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-245ca (C3H3F5)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-32 (CH2F2)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-41 (CH3F)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
                "HFC-43-10mee (C5H2F10)": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                },
            },
            "Geothermal geyser steam or fluids": {
                "CO2": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Measured heat": 0,
                },
            },
            "Installation, maintenance, operation and decommissioning of electrical equipment": {
                "SF6": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                    "Mass balance": 0,
                    "Direct measurement": 0,
                },
            },
        }
