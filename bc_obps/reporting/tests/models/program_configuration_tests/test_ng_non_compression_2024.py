from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest


class NaturalGasNonCompressionNonProcessing2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission"
        cls.year = 2024
        cls.config_element_count = 91
        cls.config = {
            "Natural gas pneumatic high bleed device venting": {
                "CO2": {
                    "WCI.353 (a)(1)": 0,
                    "WCI.353 (a)(2)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (a)(1)": 0,
                    "WCI.353 (a)(2)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic pump venting": {
                "CO2": {
                    "WCI.353 (a.1)(1)": 0,
                    "WCI.353 (a.1)(2)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (a.1)(1)": 0,
                    "WCI.353 (a.1)(2)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic low bleed device venting": {
                "CO2": {
                    "WCI.353 (b)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (b)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic intermittent bleed device venting": {
                "CO2": {
                    "WCI.353 (b.1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (b.1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Blowdown venting": {
                "CO2": {
                    "WCI.353 (c)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (c)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Flaring stacks": {
                "CO2": {
                    "WCI.353 (d)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (d)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.353 (d)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Equipment leaks detected using leak detection and leaker emission factor methods": {
                "CO2": {
                    "WCI.353 (g)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (g)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Population count sources": {
                "CO2": {
                    "WCI.353 (h)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (h)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Transmission storage tanks": {
                "CO2": {
                    "WCI.353 (m)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (m)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Other venting sources": {
                "CO2": {
                    "CEPEI Methodology Manual": 0,
                    "Other CGA Methodology": 1,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "CEPEI Methodology Manual": 0,
                    "Other CGA Methodology": 1,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Other fugitive sources": {
                "CO2": {
                    "CEPEI Methodology Manual": 0,
                    "Other CGA Methodology": 1,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "CEPEI Methodology Manual": 0,
                    "Other CGA Methodology": 1,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Third party line hits with release of gas": {
                "CO2": {
                    "WCI.353 (c.1)(i)": 0,
                    "WCI.353 (c.1)(ii)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (c.1)(i)": 0,
                    "WCI.353 (c.1)(ii)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
        }
