from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.report_activity import ReportActivity
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from rls.tests.helpers import test_policies_for_industry_user


class ReportActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        report_version = report_version_baker()

        cls.test_object = ReportActivity.objects.create(
            report_version=report_version,
            json_data="{'test': 1}",
            activity_base_schema=ActivityJsonSchema.objects.first(),
            activity=ActivityJsonSchema.objects.first().activity,
            facility_report=make_recipe("reporting.tests.utils.facility_report"),
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("activity_base_schema", "activity base schema", None, None),
            ("activity", "activity", None, None),
            ("reportsourcetype_records", "report source type", None, 0),
            ("facility_report", "facility report", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_activity")

class ReportActivityRlsTest(BaseTestCase):

    def test_report_activity_rls_industry_user_success(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        operation = make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        facility_report = make_recipe("reporting.tests.utils.facility_report", facility__operation=operation)
        report_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            facility_report=facility_report,
        )
        random_operation = make_recipe('registration.tests.utils.operation')
        random_facility_report = make_recipe(
            "reporting.tests.utils.facility_report", facility__operation=random_operation
        )
        random_report_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            facility_report= random_facility_report,
            report_version=report_activity.report_version,
        )

        assert ReportActivity.objects.count() == 2

        def select_function(cursor):
            assert ReportActivity.objects.count() == 1

        test_policies_for_industry_user(ReportActivity, approved_user_operator.user, select_function=select_function)
