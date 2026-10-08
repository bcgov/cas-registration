from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS


class CommentThreadModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe("reporting.tests.utils.comment_thread")

        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report", "report", None, None),
            ("facility", "facility", None, None),
            ("report_version", "report version", None, None),
            ("comments", "comment", None, None),
        ]
