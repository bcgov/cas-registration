from common.tests.utils.helpers import BaseTestCase
from registration.models import ReportingActivity, RegulatedProduct
from reporting.models import ReportFacility
from reporting.tests.utils.bakers import report_baker


class ReportFacilityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportFacility.objects.create(
            facility_name="Test Facility 1",
            facility_type="SFO",
            facility_bcghgid="this is a non-conforming bcghgid",
            report=report_baker(),
        )
        cls.test_object.activities.add(ReportingActivity.objects.first())
        cls.test_object.products.add(RegulatedProduct.objects.first())
        cls.field_data = [
            ("id", "ID", None, None),
            ("report", "report", None, None),
            ("facility_name", "facility name", 1000, None),
            ("facility_type", "facility type", 1000, None),
            ("facility_bcghgid", "facility bcghgid", 1000, None),
            ("activities", "activities", None, 1),
            ("products", "products", None, 1),
        ]
