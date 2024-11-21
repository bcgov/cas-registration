from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_attachment import ReportAttachment


class ReportAdditionalDataTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportAttachment()
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("attachment", "attachment", None, None),
            ("attachment_type", "attachment type", None, None),
            ("attachment_name", "attachment name", None, None),
        ]
