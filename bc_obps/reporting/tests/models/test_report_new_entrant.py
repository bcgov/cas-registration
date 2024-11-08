from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.report_data_bakers import report_new_entrant_baker
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS


class ReportNewEntrantModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_new_entrant_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("authorization_date", "authorization date", None, None),
            ("first_shipment_date", "first shipment date", None, None),
            ("new_entrant_period_start", "new entrant period start", None, None),
            ("assertion_statement", "assertion statement", None, None),
            ("flaring_emissions", "flaring emissions", None, None),
            ("fugitive_emissions", "fugitive emissions", None, None),
            ("industrial_process_emissions", "industrial process emissions", None, None),
            ("on_site_transportation_emissions", "on site transportation emissions", None, None),
            ("stationary_fuel_combustion_emissions", "stationary fuel combustion emissions", None, None),
            ("venting_emissions_useful", "venting emissions useful", None, None),
            ("venting_emissions_non_useful", "venting emissions non useful", None, None),
            ("emissions_from_waste", "emissions from waste", None, None),
            ("emissions_from_wastewater", "emissions from wastewater", None, None),
            ("co2_emissions_from_excluded_woody_biomass", "co2 emissions from excluded woody biomass", None, None),
            ("other_emissions_from_excluded_biomass", "other emissions from excluded biomass", None, None),
            ("emissions_from_excluded_non_biomass", "emissions from excluded non biomass", None, None),
            ("emissions_from_line_tracing", "emissions from line tracing", None, None),
            ("emissions_from_fat_oil", "emissions from fat oil", None, None),
            ("report_new_entrant_production", "report new entrant production", None, None),
        ]
