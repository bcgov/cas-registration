from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.bakers import report_person_responsible_baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportPersonResponsibleTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_person_responsible_baker()
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("first_name", "first name", None, None),
            ("last_name", "last name", None, None),
            ("position_title", "position title", None, None),
            ("email", "email", None, None),
            ("phone_number", "phone number", None, None),
            ("street_address", "street address", None, None),
            ("municipality", "municipality", None, None),
            ("province", "province", None, None),
            ("postal_code", "postal code", None, None),
            ("business_role", "business role", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_person_responsible")
