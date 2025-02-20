from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest


class PetroleumRefining2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "Petroleum refining"
        cls.year = 2024
        cls.config_element_count = 93
        cls.config = {
            "Catalyst regeneration": {
                "CO2": {
                    "CEMS": 0,
                    "WCI.203(a)(1)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.203(a)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.203(a)(3)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Process vents": {
                "CO2": {
                    "CEMS": 0,
                    "WCI.203(b)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.203(b)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.203(b)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Asphalt production": {
                "CO2": {
                    "CEMS": 0,
                    "WCI.203(c)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.203(c)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Sulphur recovery": {
                "CO2": {
                    "CEMS": 0,
                    "WCI.203(d)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases": {
                "CO2": {
                    "WCI.203(e)(1)": 0,
                    "WCI.203(e)(2)(A)(i)": 0,
                    "WCI.203(e)(2)(A)(ii)": 0,
                    "WCI.203(e)(B)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.203(e)(1)": 0,
                    "WCI.203(e)(3)(A)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.203(e)(1)": 0,
                    "WCI.203(e)(3)(B)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Above-ground storage tanks at refineries": {
                "CH4": {
                    "WCI.203(f)(1)": 0,
                    "WCI.203(f)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Oil-water separators at refineries": {
                "CH4": {
                    "Default conversion factor": 0,
                    "Measured conversion factor": 1,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Equipment leaks": {
                "CH4": {
                    "WCI.203(i)(1)": 0,
                    "WCI.203(i)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Wastewater processing using anaerobic digestion at refineries": {
                "CH4": {
                    "Chemical Oxygen Demand": 1,
                    "Biochemical Oxygen Demand": 1,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "Nitrogen in effluent": 1,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Uncontrolled blowdown systems used at refineries": {
                "CO2": {
                    "CEMS": 0,
                    "WCI.203(b)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.203(b)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.203(b)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Loading operations at refineries and terminals": {
                "CH4": {
                    "WCI.203(l)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Delayed coking units at refineries": {
                "CH4": {
                    "WCI.203(m)(1)": 0,
                    "WCI.203(m)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Coke calcining at refineries": {
                "CO2": {
                    "CEMS": 0,
                    "WCI.203(j)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "Default emission factor": 0,
                    "Measured emission factor": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "Default emission factor": 0,
                    "Measured emission factor": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
        }
