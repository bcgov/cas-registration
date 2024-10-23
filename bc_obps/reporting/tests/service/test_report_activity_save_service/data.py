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
                            "emissions": [
                                {
                                    "gasType": "CH4",
                                    "test_emission_number": 12345,
                                    "test_emission_bool": True,
                                    "test_emission_str": "test",
                                    "methodology": "Default EV",
                                    "methodology_field_1": 123,
                                    "method_field_2": "Some description",
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
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                },
                                {
                                    "gasType": "N2O",
                                },
                            ],
                        },
                        {
                            "fuelType": {
                                "fuelName": "Plastics",
                            },
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                },
                                {
                                    "gasType": "N2O",
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
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                },
                                {
                                    "gasType": "N2O",
                                },
                            ],
                        },
                        {
                            "fuelType": {
                                "fuelName": "Wood Waste",
                            },
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                },
                                {
                                    "gasType": "N2O",
                                },
                            ],
                        },
                    ]
                },
            ]
        },
    },
}
