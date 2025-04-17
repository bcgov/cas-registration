from django.test import TestCase
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from reporting.service.report_activity_validation_service import ReportActivityValidationService

# a copy of test data generated on the Electricity Generation Activity form
test_data = {
    'fuelCombustionForElectricityGeneration': True,
    'sourceTypes': {
        'fuelCombustionForElectricityGeneration': {
            'units': [
                {
                    'fuels': [
                        {
                            'fuelType': {
                                'fuelName': 'Acid Gas',
                                'fuelUnit': 'Sm^3',
                                'fuelClassification': 'Non-biomass',
                            },
                            'emissions': [
                                {
                                    'gasType': 'CH4',
                                    'emission': 777,
                                    'equivalentEmission': 'Value will be computed upon saving',
                                    'methodology': {
                                        'methodology': 'Default EF',
                                        'unitFuelCh4DefaultEf': 888,
                                        'unitFuelCh4DefaultEfFieldUnits': 'g/fuel units',
                                    },
                                }
                            ],
                            'fuelDescription': 'test description',
                            'annualFuelAmount': 666,
                        }
                    ],
                    'netPower': 555,
                    'unitName': 'test unit',
                    'unitType': 'Kiln',
                    'generationType': 'Cogeneration',
                    'nameplateCapacity': 444,
                    'cycleType': 'Topping',
                    'thermalOutput': 111,
                    'supplementalFiringPurpose': 'Industrial output',
                    'steamHeatAcquisitionAmount': 222,
                    'steamHeatAcquisitionProvider': '333',
                },
                {
                    'fuels': [
                        {
                            'fuelType': {
                                'fuelName': 'Diesel',
                                'fuelUnit': 'kilolitres',
                                'fuelClassification': 'Non-biomass',
                            },
                            'emissions': [
                                {
                                    'gasType': 'N2O',
                                    'emission': 4444,
                                    'equivalentEmission': 'Value will be computed upon saving',
                                    'methodology': {
                                        'methodology': 'Heat Input/Default EF',
                                        'unitFuelHeatInput': 5555,
                                        'unitFuelN2OHeatInputDefaultEf': 6666,
                                        'unitFuelN2OHeatInputDefaultEfFieldUnits': 'g/GJ',
                                    },
                                }
                            ],
                            'fuelDescription': '2222',
                            'annualFuelAmount': 3333,
                        }
                    ],
                    'netPower': 1111,
                    'unitName': 'test unit 2',
                    'unitType': 'Other',
                    'generationType': 'Non-Cogeneration',
                    'nameplateCapacity': 999,
                },
            ]
        }
    },
}


class TestReportActivityValidationService(TestCase):
    '''
    These tests verify that the validation service catches where the test_data does not match the schema
    For each assertion, the test_data is modified to be invalid in some way, and then the validation service is called
    to ensure that the error is caught.
    Then the test_data is modified back to be valid and checked again before moving on to the next test.
    '''

    def setUp(self):
        self.TEST_ACTIVTIY_ID = 10  # the activity ID for the test data (Electricity Generation)
        self.ti = TestInfrastructure.build()

    def test_validation_catches_invalid_enum_values(self):
        # Show that the test_data is valid against the schema : expect no errors to be thrown
        ReportActivityValidationService.validate_report_activity(
            self.TEST_ACTIVTIY_ID, self.ti.report_version.id, test_data
        )

        units = test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units']

        proper_value = units[0]['fuels'][0]['emissions'][0]['methodology']['methodology']
        units[0]['fuels'][0]['emissions'][0]['methodology']['methodology'] = 'This is wrong!'
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        units[0]['fuels'][0]['emissions'][0]['methodology']['methodology'] = proper_value
        ReportActivityValidationService.validate_report_activity(
            self.TEST_ACTIVTIY_ID, self.ti.report_version.id, test_data
        )

        proper_value = units[1]['fuels'][0]['emissions'][0]['gasType']
        units[1]['fuels'][0]['emissions'][0]['gasType'] = 'N3O'
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        units[1]['fuels'][0]['emissions'][0]['gasType'] = proper_value
        ReportActivityValidationService.validate_report_activity(
            self.TEST_ACTIVTIY_ID, self.ti.report_version.id, test_data
        )

        proper_value = units[1]['fuels'][0]['fuelType']['fuelName']
        units[1]['fuels'][0]['fuelType']['fuelName'] = 'test fuel'
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        units[1]['fuels'][0]['fuelType']['fuelName'] = proper_value

    def test_validation_catches_type_changes(self):
        # Test that the test_data is valid against the schema : expect no errors to be thrown
        ReportActivityValidationService.validate_report_activity(
            self.TEST_ACTIVTIY_ID, self.ti.report_version.id, test_data
        )

        units = test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units']

        # expects an int but gets a string
        proper_value = units[1]['fuels'][0]['emissions'][0]['emission']
        units[1]['fuels'][0]['emissions'][0]['emission'] = str(proper_value)
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        units[1]['fuels'][0]['emissions'][0]['emission'] = proper_value
        ReportActivityValidationService.validate_report_activity(
            self.TEST_ACTIVTIY_ID, self.ti.report_version.id, test_data
        )

        # expects a string but gets an int
        proper_value = units[0]['fuels'][0]['fuelDescription']
        units[0]['fuels'][0]['fuelDescription'] = 1234
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        units[0]['fuels'][0]['fuelDescription'] = proper_value

        # expects an int but gets an object
        proper_value = units[0]['fuels'][0]['annualFuelAmount']
        units[0]['fuels'][0]['annualFuelAmount'] = {
            'methodology': 'Default EF',
            'unitFuelCh4DefaultEf': 888,
            'unitFuelCh4DefaultEfFieldUnits': 'g/fuel units',
        }
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        units[0]['fuels'][0]['annualFuelAmount'] = proper_value

        # expects an array but gets an object
        proper_value = test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units']
        test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units'] = {
            'fuels': [
                {
                    'fuelType': {
                        'fuelName': 'Acid Gas',
                        'fuelUnit': 'Sm^3',
                        'fuelClassification': 'Non-biomass',
                    },
                }
            ]
        }
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units'] = proper_value

        # expects an int but gets an array
        proper_value = units[1]['netPower']
        units[1]['netPower'] = [proper_value]
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        units[1]['netPower'] = proper_value

    def test_validation_catches_unknown_fields(self):
        # Test that the test_data is valid against the schema : expect no errors to be thrown
        ReportActivityValidationService.validate_report_activity(
            self.TEST_ACTIVTIY_ID, self.ti.report_version.id, test_data
        )

        units = test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units']

        units[0]['fuels'][0]['emissions'][0]['unknown_field'] = 'This is wrong!'
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        del units[0]['fuels'][0]['emissions'][0]['unknown_field']
        ReportActivityValidationService.validate_report_activity(
            self.TEST_ACTIVTIY_ID, self.ti.report_version.id, test_data
        )

        data_contents = test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units']
        del test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units']
        test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units_wrong'] = data_contents
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        del test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units_wrong']
        test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units'] = data_contents

    def test_validation_catches_incorrect_properties(self):
        # Test that the test_data is valid against the schema : expect no errors to be thrown
        ReportActivityValidationService.validate_report_activity(
            self.TEST_ACTIVTIY_ID, self.ti.report_version.id, test_data
        )

        units = test_data['sourceTypes']['fuelCombustionForElectricityGeneration']['units']

        # expects 'CH4' but gets 'CO2' (both valid enum options) but should Error because the dependant properties are not correct for 'CO2'
        proper_value = units[0]['fuels'][0]['emissions'][0]['gasType']
        units[0]['fuels'][0]['emissions'][0]['gasType'] = 'CO2'
        self.assertRaises(
            ValueError,
            ReportActivityValidationService.validate_report_activity,
            self.TEST_ACTIVTIY_ID,
            self.ti.report_version.id,
            test_data,
        )
        units[0]['fuels'][0]['emissions'][0]['gasType'] = proper_value
