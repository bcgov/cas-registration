from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ElicensingClientOperatorTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.elicensing_client_operator')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operator", "operator", None, None),
            ("client_object_id", "client object id", None, None),
            ("client_guid", "client guid", None, None),
            ("elicensing_invoices", "elicensing invoice", None, None),
        ]
