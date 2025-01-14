from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.report_data_bakers import report_operation_representative_baker
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS


class ReportOperationRepresentativeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_operation_representative_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("representative_name", "representative name", None, None),
            ("selected_for_report", "selected for report", None, None),
        ]