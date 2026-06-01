KG_GJ_UNITS = "kg/GJ"

test_data = {
    "test_activity_number": 12345,
    "test_activity_bool": True,
    "test_activity_str": "act",
    "gscFuelOrWasteLinearFacilitiesUsefulEnergy": True,
    "fieldProcessVentGasLinearFacilities": True,
    "sourceTypes": {
        "gscFuelOrWasteLinearFacilitiesUsefulEnergy": {
            "test_st_number": 12345,
            "test_st_bool": True,
            "test_st_str": "st",
            "units": [
                {
                    "test_unit_number": 12345,
                    "test_unit_bool": True,
                    "test_unit_str": "unit",
                    "description": "test description",
                    "fuels": [
                        {
                            "test_fuel_number": 12345,
                            "test_fuel_bool": True,
                            "test_fuel_str": "test",
                            "fuelType": {
                                "fuelName": "C/D Waste - Plastic",
                            },
                            "annualFuelAmount": 100,
                            "emissions": [
                                {
                                    "gasType": "CH4",
                                    "test_emission_number": 12345,
                                    "test_emission_bool": True,
                                    "test_emission_str": "test",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Default HHV/Default EF",
                                        "fuelDefaultHighHeatingValue": 10,
                                        "unitFuelCo2DefaultEmissionFactor": 20,
                                        "unitFuelCo2DefaultEmissionFactorFieldUnits": KG_GJ_UNITS,
                                    },
                                },
                            ],
                        },
                    ],
                }
            ],
        },
        "fieldProcessVentGasLinearFacilities": {
            "units": [
                {
                    "fuels": [
                        {
                            "fuelType": {
                                "fuelName": "Diesel",
                            },
                            "annualFuelAmount": 10500,
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Default HHV/Default EF",
                                        "fuelDefaultHighHeatingValue": 11,
                                        "unitFuelCo2DefaultEmissionFactor": 23,
                                        "unitFuelCo2DefaultEmissionFactorFieldUnits": KG_GJ_UNITS,
                                    },
                                },
                                {
                                    "gasType": "N2O",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Default EF",
                                        "unitFuelCo2DefaultEmissionFactor": 3,
                                        "unitFuelCo2DefaultEmissionFactorFieldUnits": KG_GJ_UNITS,
                                    },
                                },
                            ],
                        },
                        {
                            "fuelType": {
                                "fuelName": "Plastics",
                            },
                            "annualFuelAmount": 800,
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Measured HHV/Default EF",
                                        "unitFuelCo2DefaultEmissionFactor": 4,
                                        "unitFuelCo2DefaultEmissionFactorFieldUnits": KG_GJ_UNITS,
                                        "fuelAnnualWeightedAverageHighHeatingValue": 4,
                                    },
                                },
                                {
                                    "gasType": "N2O",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Measured Steam/Default EF",
                                        "unitFuelAnnualSteamGenerated": 5,
                                        "boilerRatio": 5,
                                        "unitFuelCo2EmissionFactor": 5,
                                        "unitFuelCo2EmissionFactorFieldUnits": KG_GJ_UNITS,
                                    },
                                },
                            ],
                        },
                    ]
                },
                {
                    "fuels": [
                        {
                            "fuelType": {
                                "fuelName": "Kerosene",
                            },
                            "annualFuelAmount": 4500,
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Measured CC",
                                        "fuelAnnualWeightedAverageCarbonContentWeightFraction": 6,
                                    },
                                },
                                {
                                    "gasType": "N2O",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Measured Steam/Measured EF",
                                        "unitFuelAnnualSteamGenerated": 7,
                                        "unitFuelCo2MeasuredEmissionFactor": 7,
                                        "unitFuelCo2MeasuredEmissionFactorFieldUnits": "kg/fuel units",
                                    },
                                },
                            ],
                        },
                        {
                            "fuelType": {
                                "fuelName": "Wood Waste",
                            },
                            "annualFuelAmount": 3000,
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Alternative Parameter Measurement Methodology",
                                        "description": "eight",
                                    },
                                },
                                {
                                    "gasType": "N2O",
                                    "emission": 1,
                                    "methodology": {
                                        "methodology": "Replacement Methodology",
                                        "description": "nine",
                                    },
                                },
                            ],
                        },
                    ]
                },
            ]
        },
    },
}
