from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest


class NaturalGasOtherThanNonCompression2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "LNG activities"
        cls.year = 2024
        cls.config_element_count = 133
        cls.config = {
            "Natural gas pneumatic high bleed device venting": {
                "CO2": {
                    "WCI.353 (a)(1)": 0,
                    "WCI.353 (a)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (a)(1)": 0,
                    "WCI.353 (a)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic pump venting": {
                "CO2": {
                    "WCI.353 (a.1)(1)": 0,
                    "WCI.353 (a.1)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (a.1)(1)": 0,
                    "WCI.353 (a.1)(2)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic low bleed device venting": {
                "CO2": {
                    "WCI.353 (b)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (b)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic intermittent bleed device venting": {
                "CO2": {
                    "WCI.353 (b.1)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (b.1)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Acid gas removal venting or incineration": {
                "CO2": {
                    "WCI.353 (c)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                }
            },
            "Dehydrator venting": {
                "CO2": {
                    "WCI.353 (d)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (d)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Blowdown venting": {
                "CO2": {
                    "WCI.353 (c)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (c)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Releases from tanks used for storage, production or processing": {
                "CO2": {
                    "WCI.353 (h)(1)": 0,
                    "WCI.353 (h)(2)": 0,
                    "WCI.353 (h)(3)": 0,
                    "WCI.353 (h)(4)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (h)(1)": 0,
                    "WCI.353 (h)(2)": 0,
                    "WCI.353 (h)(3)": 0,
                    "WCI.353 (h)(4)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Flare stacks": {
                "CO2": {
                    "WCI.353 (d)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (d)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.353 (d)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Centrifugal compressor venting": {
                "CO2": {
                    "WCI.353 (e)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (e)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Reciprocating compressor venting": {
                "CO2": {
                    "WCI.353 (f)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (f)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Equipment leaks detected using leak detection and leaker emission factor methods": {
                "CO2": {
                    "WCI.353 (g)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (g)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Population count sources": {
                "CO2": {
                    "WCI.353 (h)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (h)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Transmission storage tanks": {
                "CO2": {
                    "WCI.353 (m)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (m)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Enhanced oil recovery injection pump blowdowns": {
                "CO2": {
                    "WCI.353 (t)": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Produced water dissolved carbon dioxide and methane": {
                "CO2": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide": {
                "CO2": {
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Other venting sources": {
                "CO2": {
                    "CEPEI Methodology Manual": 0,
                    "Other CGA Methodology": 1,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "CEPEI Methodology Manual": 0,
                    "Other CGA Methodology": 1,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Other fugitive sources": {
                "CO2": {
                    "CEPEI Methodology Manual": 0,
                    "Other CGA Methodology": 1,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "CEPEI Methodology Manual": 0,
                    "Other CGA Methodology": 1,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Third party line hits with release of gas": {
                "CO2": {
                    "WCI.353 (c.1)(i)": 0,
                    "WCI.353 (c.1)(ii)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.353 (c.1)(i)": 0,
                    "WCI.353 (c.1)(ii)": 0,
                    "CEPEI Methodology Manual": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
        }
