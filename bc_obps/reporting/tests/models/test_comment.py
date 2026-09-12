from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS


class CommentModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe("reporting.tests.utils.comment")

        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("comment_thread", "comment thread", None, None),
            ("report_version", "report version", None, None),
            ("comment", "comment", None, None),
        ]
