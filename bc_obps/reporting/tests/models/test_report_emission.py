from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from reporting.tests.utils.report_data_bakers import report_emission_baker


class ReportEmissionModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_emission_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("gas_type", "gas type", None, None),
            ("report_source_type", "report source type", None, None),
            ("report_fuel", "report fuel", None, None),
            ("report_methodology", "report methodology", None, None),
            ("emission_categories", "emission categories", None, 0),
        ]
