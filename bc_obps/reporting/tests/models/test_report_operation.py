from common.tests.utils.helpers import BaseTestCase
from registration.models import Activity, RegulatedProduct
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportOperation
from reporting.tests.utils.bakers import report_version_baker


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
            report_version=report_version_baker(report_operation=None),
        )
        cls.test_object.activities.add(Activity.objects.first())
        cls.test_object.regulated_products.add(RegulatedProduct.objects.first())
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("operator_legal_name", "operator legal name", 1000, None),
            ("operator_trade_name", "operator trade name", 1000, None),
            ("operation_name", "operation name", 1000, None),
            ("operation_type", "operation type", 1000, None),
            ("operation_bcghgid", "operation bcghgid", 1000, None),
            ("bc_obps_regulated_operation_id", "bc obps regulated operation id", 255, None),
            ("activities", "activities", None, 1),
            ("regulated_products", "regulated products", None, 1),
        ]
