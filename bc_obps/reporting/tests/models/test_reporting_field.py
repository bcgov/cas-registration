from common.tests.utils.helpers import BaseTestCase
from reporting.models import ReportingField

class ReportingFieldTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportingField.objects.create(
            field_name="testReportingField",
            field_type="testFieldType"
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("field_name", "field name", 1000, None),
            ("field_type", "field type", 1000, None),
            ("configuration_elements", "configuration element", None, None)
        ]
