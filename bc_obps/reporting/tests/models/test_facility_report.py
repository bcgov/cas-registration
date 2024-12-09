from common.tests.utils.helpers import BaseTestCase
from registration.models import Activity
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from registration.tests.utils.bakers import facility_baker
from reporting.models import FacilityReport
from reporting.tests.utils.bakers import report_version_baker


class FacilityReportModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        f = facility_baker()

        cls.test_object = FacilityReport.objects.create(
            facility=f,
            facility_name=f.name,
            facility_type=f.type,
            facility_bcghgid=f.bcghg_id,
            report_version=report_version_baker(),
        )
        cls.test_object.activities.add(Activity.objects.first())
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility", "facility", None, None),
            ("facility_name", "facility name", 1000, None),
            ("facility_type", "facility type", 1000, None),
            ("facility_bcghgid", "facility bcghgid", 1000, None),
            ("activities", "activities", None, 1),
            ("reportactivity_records", "report activity", None, 0),
            ("reportrawactivitydata_records", "report raw activity data", None, 0),
            ("report_products", "report product", None, 0),
            ("reportnonattributableemissions_records", "report non attributable emissions", None, 0),
            ("reportproductemissionallocation_records", "report product emission allocation", None, 0),
        ]
