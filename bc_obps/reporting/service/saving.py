'''
Saving order:

1) validate that the configuration supports those sourcetypes / etc etc?
2) enter a row in the raw_data
2) create the stuff

http://localhost:3000/reporting/reports/1/facilities/f486f2fb-62ed-438d-bb3e-0819b51e3aff/activities/gsc_non_compression_non_processing


'''

data = {
    "schema": {
        "type": "object",
        "title": "General stationary non-compression and non-processing combustion",
        "properties": {
            "gscFuelOrWasteLinearFacilitiesUsefulEnergy": {
                "type": "boolean",
                "title": "General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy",
            },
            "gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy": {
                "type": "boolean",
                "title": "General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy",
            },
            "fieldProcessVentGasLinearFacilities": {
                "type": "boolean",
                "title": "Field gas or process vent gas combustion at a linear facilities operation",
            },
            "sourceTypes": {
                "type": "object",
                "title": "Source Types",
                "properties": {
                    "gscFuelOrWasteLinearFacilitiesUsefulEnergy": {
                        "type": "object",
                        "title": "General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy",
                        "properties": {
                            "units": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "fuels": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "fuelName": {
                                                        "enum": [
                                                            "Acetylene",
                                                            "Acid Gas",
                                                            "Aviation Gasoline",
                                                            "Biodiesel (100%)",
                                                            "Bituminous Coal",
                                                            "Butane",
                                                            "C/D Waste - Plastic",
                                                            "C/D Waste - Wood",
                                                            "Carpet fibre",
                                                            "Coal Coke",
                                                            "Comubstible Tall Oil",
                                                            "Concentrated Non-Condensible Gases (CNCGs)",
                                                            "Crude Sulfate Turpentine (CST)",
                                                            "Crude Tall Oil (CTO)",
                                                            "Diesel",
                                                            "Digester Gas",
                                                            "Dilute non-condensible gases (DNCGs)",
                                                            "Distilate Fuel Oil No.2",
                                                            "Ethanol (100%)",
                                                            "E-waste",
                                                            "Explosives",
                                                            "Field gas",
                                                            "HTCR PSA Tail gas",
                                                            "Hydrogen",
                                                            "Hydrogenator Outlet Gas",
                                                            "Isobutylene",
                                                            "Kerosene",
                                                            "Landfill Gas",
                                                            "Light Fuel Oil",
                                                            "Liquified Petroleum Gases (LPG)",
                                                            "Lubricants",
                                                            "Motor Gasoline",
                                                            "Motor Gasoline - Off-road",
                                                            "Municipal Solid Waste - non-biomass component",
                                                            "Municipal Solide Waste - biomass component",
                                                            "Naphtha",
                                                            "Natural Gas",
                                                            "Natural Gas Condensate",
                                                            "Nitrous Oxide",
                                                            "Petroleum Coke",
                                                            "Pentanes Plus",
                                                            "Plastics",
                                                            "Propane",
                                                            "Propylene",
                                                            "PSA Offgas",
                                                            "PSA Process Gas",
                                                            "RDU Offgas",
                                                            "Recycle Gas",
                                                            "Refinery Fuel Gas",
                                                            "Renewable Diesel",
                                                            "Renewable Natural Gas",
                                                            "Residual Fuel Oil (#5 & 6)",
                                                            "SMR PSA Tail Gas",
                                                            "Sodium Bicarbonate",
                                                            "Solid Byproducts",
                                                            "Sour Gas",
                                                            "Spent Pulping Liquor",
                                                            "Still gas",
                                                            "Sub-Bituminous Coal",
                                                            "Tires - biomass component",
                                                            "Tires - non-biomass component",
                                                            "Trona",
                                                            "Turpentine",
                                                            "Wood Waste",
                                                        ],
                                                        "type": "string",
                                                        "title": "Fuel Name",
                                                    },
                                                    "fuelUnit": {
                                                        "type": "string",
                                                        "title": "Fuel Unit",
                                                        "maxLength": 200,
                                                    },
                                                    "emissions": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "object",
                                                            "properties": {
                                                                "gasType": {
                                                                    "enum": ["CO2", "CH4", "N2O"],
                                                                    "type": "string",
                                                                    "title": "Gas Type",
                                                                },
                                                                "emission": {"type": "number", "title": "Emission"},
                                                                "equivalentEmission": {
                                                                    "type": "number",
                                                                    "title": "Equivalent Emission",
                                                                    "readOnly": true,
                                                                },
                                                            },
                                                            "dependencies": {
                                                                "gasType": {
                                                                    "oneOf": [
                                                                        {
                                                                            "properties": {
                                                                                "gasType": {"enum": ["CO2"]},
                                                                                "methodology": {
                                                                                    "title": "Methodology",
                                                                                    "type": "string",
                                                                                    "enum": [
                                                                                        "Default HHV/Default EF",
                                                                                        "Default EF",
                                                                                        "Measured HHV/Default EF",
                                                                                        "Measured Steam/Default EF",
                                                                                        "Measured CC",
                                                                                        "Measured Steam/Measured EF",
                                                                                        "Alternative Parameter Measurement",
                                                                                        "Replacement Methodology",
                                                                                    ],
                                                                                },
                                                                            },
                                                                            "dependencies": {
                                                                                "methodology": {
                                                                                    "oneOf": [
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Default HHV/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "fuelDefaultHighHeatingValue": {
                                                                                                    "type": "number",
                                                                                                    "title": "Fuel Default High Heating Value",
                                                                                                },
                                                                                                "unitFuelCo2DefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CO2 Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelCo2DefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-CO2 Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelCo2DefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CO2 Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelCo2DefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/fuel units",
                                                                                                    "title": "Unit-Fuel-CO2 Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured HHV/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelCo2DefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CO2 Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelCo2DefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-CO2 Default Emission Factor Units",
                                                                                                },
                                                                                                "fuelAnnualWeightedAverageHighHeatingValue": {
                                                                                                    "type": "number",
                                                                                                    "title": "Fuel Annual Weighted Average High Heating Value",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured Steam/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelAnnualSteamGenerated": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel Annual Steam Generated",
                                                                                                },
                                                                                                "boilerRatio": {
                                                                                                    "type": "number",
                                                                                                    "title": "Boiler Ratio",
                                                                                                },
                                                                                                "unitFuelCo2EmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CO2 Emission Factor",
                                                                                                },
                                                                                                "unitFuelCo2EmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-CO2 Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured CC"
                                                                                                    ]
                                                                                                },
                                                                                                "fuelAnnualWeightedAverageCarbonContentWeightFraction": {
                                                                                                    "type": "number",
                                                                                                    "title": "Fuel Annual Weighted Average Carbon Content (weight fraction)",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured Steam/Measured EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelAnnualSteamGenerated": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel Annual Steam Generated",
                                                                                                },
                                                                                                "unitFuelCo2MeasuredEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CO2 Measured Emission Factor",
                                                                                                },
                                                                                                "unitFuelCo2MeasuredEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/fuel units",
                                                                                                    "title": "Unit-Fuel-CO2 Measured Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Alternative Parameter Measurement"
                                                                                                    ]
                                                                                                },
                                                                                                "description": {
                                                                                                    "type": "string",
                                                                                                    "title": "Description",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Replacement Methodology"
                                                                                                    ]
                                                                                                },
                                                                                                "description": {
                                                                                                    "type": "string",
                                                                                                    "title": "Description",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                    ]
                                                                                }
                                                                            },
                                                                        },
                                                                        {
                                                                            "properties": {
                                                                                "gasType": {"enum": ["CH4"]},
                                                                                "methodology": {
                                                                                    "title": "Methodology",
                                                                                    "type": "string",
                                                                                    "enum": [
                                                                                        "Default HHV/Default EF",
                                                                                        "Default EF",
                                                                                        "Measured HHV/Default EF",
                                                                                        "Measured EF",
                                                                                        "Measured Steam/Default EF",
                                                                                        "Heat Input/Default EF",
                                                                                        "Alternative Parameter Measurement",
                                                                                        "Replacement Methodology",
                                                                                    ],
                                                                                },
                                                                            },
                                                                            "dependencies": {
                                                                                "methodology": {
                                                                                    "oneOf": [
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Default HHV/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "fuelDefaultHighHeatingValue": {
                                                                                                    "type": "number",
                                                                                                    "title": "Fuel Default High Heating Value",
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/fuel units",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured HHV/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "fuelAnnualWeightedAverageHighHeatingValue": {
                                                                                                    "type": "number",
                                                                                                    "title": "Fuel Annual Weighted Average High Heating Value",
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelCh4MeasuredEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CH4 Measured Emission Factor",
                                                                                                },
                                                                                                "unitFuelCh4MeasuredEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/fuel units",
                                                                                                    "title": "Unit-Fuel-CH4 Measured Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured Steam/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelAnnualSteamGenerated": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel Annual Steam Generated",
                                                                                                },
                                                                                                "boilerRatio": {
                                                                                                    "type": "number",
                                                                                                    "title": "Boiler Ratio",
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Heat Input/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelCh4DefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-CH4 Default Emission Factor Units",
                                                                                                },
                                                                                                "unitFuelHeatInput": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel Heat Input",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Alternative Parameter Measurement"
                                                                                                    ]
                                                                                                },
                                                                                                "description": {
                                                                                                    "type": "string",
                                                                                                    "title": "Description",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Replacement Methodology"
                                                                                                    ]
                                                                                                },
                                                                                                "description": {
                                                                                                    "type": "string",
                                                                                                    "title": "Description",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                    ]
                                                                                }
                                                                            },
                                                                        },
                                                                        {
                                                                            "properties": {
                                                                                "gasType": {"enum": ["N2O"]},
                                                                                "methodology": {
                                                                                    "title": "Methodology",
                                                                                    "type": "string",
                                                                                    "enum": [
                                                                                        "Default HHV/Default EF",
                                                                                        "Default EF",
                                                                                        "Measured HHV/Default EF",
                                                                                        "Measured EF",
                                                                                        "Measured Steam/Default EF",
                                                                                        "Heat Input/Default EF",
                                                                                        "Alternative Parameter Measurement",
                                                                                        "Replacement Methodology",
                                                                                    ],
                                                                                },
                                                                            },
                                                                            "dependencies": {
                                                                                "methodology": {
                                                                                    "oneOf": [
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Default HHV/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "fuelDefaultHighHeatingValue": {
                                                                                                    "type": "number",
                                                                                                    "title": "Fuel Default High Heating Value",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/fuel units",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured HHV/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "fuelAnnualWeightedAverageHighHeatingValue": {
                                                                                                    "type": "number",
                                                                                                    "title": "Fuel Annual Weighted Average High Heating Value",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelN2OMeasuredEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-N2O Measured Emission Factor",
                                                                                                },
                                                                                                "unitFuelN2OMeasuredEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/fuel units",
                                                                                                    "title": "Unit-Fuel-N2O Measured Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Measured Steam/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelAnnualSteamGenerated": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel Annual Steam Generated",
                                                                                                },
                                                                                                "boilerRatio": {
                                                                                                    "type": "number",
                                                                                                    "title": "Boiler Ratio",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Heat Input/Default EF"
                                                                                                    ]
                                                                                                },
                                                                                                "unitFuelHeatInput": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel Heat Input",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactor": {
                                                                                                    "type": "number",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor",
                                                                                                },
                                                                                                "unitFuelN2ODefaultEmissionFactorFieldUnits": {
                                                                                                    "type": "string",
                                                                                                    "default": "kg/GJ",
                                                                                                    "title": "Unit-Fuel-N2O Default Emission Factor Units",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Alternative Parameter Measurement"
                                                                                                    ]
                                                                                                },
                                                                                                "description": {
                                                                                                    "type": "string",
                                                                                                    "title": "Description",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            "properties": {
                                                                                                "methodology": {
                                                                                                    "enum": [
                                                                                                        "Replacement Methodology"
                                                                                                    ]
                                                                                                },
                                                                                                "description": {
                                                                                                    "type": "string",
                                                                                                    "title": "Description",
                                                                                                },
                                                                                            }
                                                                                        },
                                                                                    ]
                                                                                }
                                                                            },
                                                                        },
                                                                    ]
                                                                }
                                                            },
                                                        },
                                                        "title": "Emission Data",
                                                    },
                                                    "annualFuelAmount": {
                                                        "type": "number",
                                                        "title": "Annual Fuel Amount",
                                                    },
                                                    "fuelClassification": {
                                                        "type": "string",
                                                        "title": "Fuel Classification",
                                                        "maxLength": 200,
                                                    },
                                                },
                                            },
                                            "title": "Fuel Data",
                                        },
                                        "description": {"type": "string", "title": "Description", "default": ""},
                                        "gscUnitName": {
                                            "type": "string",
                                            "title": "GSC Unit Name",
                                            "maxLength": 200,
                                        },
                                        "gscUnitType": {
                                            "enum": [
                                                "Boiler",
                                                "Kiln",
                                                "Other",
                                            ],
                                            "type": "string",
                                            "title": "GSC Unit Type",
                                        },
                                    },
                                },
                                "title": "Units",
                            }
                        },
                    }
                },
            },
        },
    }
}
