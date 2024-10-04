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
                            "fuelName": "C/D Waste - Plastic",
                            "emissions": [
                                {
                                    "gasType": "CH4",
                                    "test_emission_number": 12345,
                                    "test_emission_bool": True,
                                    "test_emission_str": "test",
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
                            "fuelName": "Diesel",
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
                            "fuelName": "Plastics",
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
                            "fuelName": "Kerosene",
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
                            "fuelName": "Wood Waste",
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


no_emission_test_data = {
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
                            "fuelName": "C/D Waste - Plastic",
                            "emissions": [],
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
                            "fuelName": "Diesel",
                            "emissions": [],
                        },
                        {
                            "fuelName": "Plastics",
                            "emissions": [],
                        },
                    ]
                },
                {
                    "fuels": [
                        {
                            "fuelName": "Diesel",
                            "emissions": [],
                        },
                        {
                            "fuelName": "Plastics",
                            "emissions": [],
                        },
                    ]
                },
            ]
        },
    },
}
