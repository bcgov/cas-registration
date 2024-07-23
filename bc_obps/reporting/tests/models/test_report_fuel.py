from common.tests.utils.helpers import BaseTestCase
from registration.models import ReportingActivity, RegulatedProduct
from reporting.models.report_activity import ReportActivity
from reporting.tests.utils.bakers import report_version_baker


class ReportActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportActivity.objects.create(
            facility_name="Test Facility 1",
            facility_type="SFO",
            facility_bcghgid="this is a non-conforming bcghgid",
            report_version=report_version_baker(),
        )
        cls.test_object.activities.add(ReportingActivity.objects.first())
        cls.test_object.products.add(RegulatedProduct.objects.first())
        cls.field_data = [
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility_name", "facility name", 1000, None),
            ("facility_type", "facility type", 1000, None),
            ("facility_bcghgid", "facility bcghgid", 1000, None),
            ("activities", "activities", None, 1),
            ("products", "products", None, 1),
        ]
