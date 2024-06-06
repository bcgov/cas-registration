from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import ADDRESS_FIXTURE, TIMESTAMP_COMMON_FIELDS, USER_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE, DOCUMENT_FIXTURE
from registration.tests.utils.bakers import multiple_operator_baker


class MultipleOperatorModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, USER_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE, DOCUMENT_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = multiple_operator_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operator_index", "operator index", None, None),
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", None, None),
            ("bc_corporate_registry_number", "bc corporate registry number", None, None),
            ("business_structure", "business structure", None, None),
            ("website", "website", 200, None),
            ("percentage_ownership", "percentage ownership", None, None),
            ("physical_address", "physical address", None, None),
            ("mailing_address_same_as_physical", "mailing address same as physical", None, None),
            ("mailing_address", "mailing address", None, None),
            ("operation", "operation", None, None),
        ]
