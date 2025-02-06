from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest


class OGExtractionNonCompressionNonProcessing2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "Non-compression and non-processing activities that are oil and gas extraction and gas processing activities"
        cls.year = 2024
        cls.config_element_count = 182
        cls.config = {
            "Natural gas pneumatic high bleed device venting": {
                "CO2": {
                    "WCI.363 (a)(1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (a)(1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic pump venting": {
                "CO2": {
                    "WCI.363 (a.1)(1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (a.1)(1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic low bleed device venting": {
                "CO2": {
                    "WCI.363 (b)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (b)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Natural gas pneumatic intermittent bleed device venting": {
                "CO2": {
                    "WCI.363 (b.1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (b.1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Dehydrator venting": {
                "CO2": {
                    "WCI.363 (d)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (d)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Well venting for liquids unloading": {
                "CO2": {
                    "WCI.363 (e)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (e)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Gas well venting during well completions and workovers with or without hydraulic fracturing": {
                "CO2": {
                    "WCI.363 (f)(1)": 0,
                    "WCI.363 (f)(2)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (f)(1)": 0,
                    "WCI.363 (f)(2)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Drilling flaring": {
                "CO2": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Drilling venting": {
                "CO2": {
                    "WCI.363 (o)": 0,
                    "2009 API Compendium": 0,
                    "Other Methodology": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (o)": 0,
                    "2009 API Compendium": 0,
                    "Other Methodology": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Hydraulic fracturing flaring": {
                "CO2": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Blowdown venting": {
                "CO2": {
                    "WCI.363 (g)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (g)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Releases from tanks used for storage, production or processing": {
                "CO2": {
                    "WCI.363 (h)(1)": 0,
                    "WCI.363 (h)(2)": 0,
                    "WCI.363 (h)(3)": 0,
                    "WCI.363 (h)(4)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (h)(1)": 0,
                    "WCI.363 (h)(2)": 0,
                    "WCI.363 (h)(3)": 0,
                    "WCI.363 (h)(4)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Well testing venting": {
                "CO2": {
                    "WCI.363 (i)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (i)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Well testing flaring": {
                "CO2": {
                    "WCI.363 (i)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (i)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.363 (i)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Associated gas venting": {
                "CO2": {
                    "WCI.363 (j)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (j)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Associated gas flaring": {
                "CO2": {
                    "WCI.363 (j)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (j)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.363 (j)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Flaring stacks": {
                "CO2": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "N2O": {
                    "WCI.363 (k)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Equipment leaks detected using leak detection and leaker emission factor methods": {
                "CO2": {
                    "WCI.363 (n)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (n)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Population count sources": {
                "CO2": {
                    "WCI.363 (o)": 0,
                    "2009 API Compendium": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (o)": 0,
                    "2009 API Compendium": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Transmission storage tanks": {
                "CO2": {
                    "WCI.363 (h.1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (h.1)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Enhanced oil recovery injection pump blowdowns": {
                "CO2": {
                    "WCI.363 (t)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Produced water dissolved carbon dioxide and methane": {
                "CO2": {
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide": {
                "CO2": {
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                }
            },
            "Other venting sources": {
                "CO2": {
                    "2009 API Compendium": 0,
                    "Other Methodology": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "2009 API Compendium": 0,
                    "Other Methodology": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Other fugitive sources": {
                "CO2": {
                    "2009 API Compendium": 0,
                    "Other Methodology": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "2009 API Compendium": 0,
                    "Other Methodology": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
            "Third party line hits with release of gas": {
                "CO2": {
                    "WCI.363 (g.1)(i)": 0,
                    "WCI.363 (g.1)(ii)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
                "CH4": {
                    "WCI.363 (g.1)(i)": 0,
                    "WCI.363 (g.1)(ii)": 0,
                    "Alternative Parameter Measurement": 1,
                    "Replacement Methodology": 1,
                },
            },
        }
