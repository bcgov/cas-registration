from common.tests.utils.helpers import BaseTestCase
from registration.models import ReportingActivity
from reporting.models import ReportOperation


class ReportOperationModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportOperation.objects.create(
            operator_legal_name="Legal Name",
            operator_trade_name="Trade Name",
            operation_name="Operation Name",
            operation_type="sfo",
            operation_bcghgid="A fake BC GHG ID",
            bc_obps_regulated_operation_id="123456789",
            operation_representative_name="Kar Bonn",
        )
        cls.test_object.activities.add(ReportingActivity.objects.first())
        cls.field_data = [
            ("id", "ID", None, None),
            ("report", "report", None, None),
            ("operator_legal_name", "operator legal name", 1000, None),
            ("operator_trade_name", "operator trade name", 1000, None),
            ("operation_name", "operation name", 1000, None),
            ("operation_type", "operation type", 1000, None),
            ("operation_bcghgid", "operation bcghgid", 1000, None),
            ("bc_obps_regulated_operation_id", "bc obps regulated operation id", 255, None),
            ("operation_representative_name", "operation representative name", 10000, None),
            ("activities", "activities", None, 1),
        ]
