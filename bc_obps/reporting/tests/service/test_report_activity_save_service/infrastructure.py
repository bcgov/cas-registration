from registration.models.activity import Activity
from registration.models.user import User
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.configuration import Configuration
from reporting.models.facility_report import FacilityReport
from reporting.models.report_activity import ReportActivity
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_unit import ReportUnit
from model_bakery.baker import make_recipe, make
from reporting.models.report_version import ReportVersion


def get_report_unit_by_index(
    report_activity: ReportActivity, source_type_index: int, report_unit_index: int
) -> ReportUnit:
    return report_activity.reportsourcetype_records.order_by('id')[source_type_index].reportunit_records.order_by("id")[
        report_unit_index
    ]


def get_report_fuel_by_index(
    report_activity: ReportActivity, source_type_index: int, report_unit_index: int | None, report_fuel_index: int
) -> ReportFuel:
    has_fuel_data = (
        get_report_unit_by_index(report_activity, source_type_index, report_unit_index)
        if report_unit_index is not None
        else report_activity.reportsourcetype_records.order_by('id')[source_type_index]
    )
    return has_fuel_data.reportfuel_records.order_by('id')[report_fuel_index]


class TestInfrastructure:
    facility_report: FacilityReport
    report_version: ReportVersion
    user: User
    configuration: Configuration
    activity: Activity
    activity_json_schema: ActivityJsonSchema
    activity_source_type_json_schema: ActivitySourceTypeJsonSchema

    @classmethod
    def build(cls):
        t = TestInfrastructure()
        t.facility_report = make_recipe(
            'reporting.tests.utils.facility_report',
        )
        t.facility_report.refresh_from_db()
        t.report_version = t.facility_report.report_version
        t.user = make_recipe('registration.tests.utils.industry_operator_user')
        t.configuration = Configuration.objects.get(
            valid_from__lte=t.facility_report.created_at, valid_to__gte=t.facility_report.created_at
        )
        t.activity = make_recipe("reporting.tests.utils.activity")
        t.activity_json_schema = make_recipe(
            "reporting.tests.utils.activity_json_schema",
            activity=t.activity,
            valid_from=t.configuration,
            valid_to=t.configuration,
        )
        t.activity_source_type_json_schema = make_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            activity=t.activity,
            valid_from=t.configuration,
            valid_to=t.configuration,
        )

        return t

    @classmethod
    def build_from_real_config(cls, activity_slug="gsc_non_compression"):
        t = TestInfrastructure()
        t.facility_report = make_recipe('reporting.tests.utils.facility_report')
        t.facility_report.refresh_from_db()
        t.report_version = t.facility_report.report_version
        t.user = make_recipe('registration.tests.utils.industry_operator_user')
        t.configuration = Configuration.objects.get(
            valid_from__lte=t.facility_report.created_at, valid_to__gte=t.facility_report.created_at
        )
        t.activity = Activity.objects.get(slug=activity_slug)
        t.activity_json_schema = ActivityJsonSchema.objects.get(
            activity=t.activity,
            valid_from=t.configuration,
            valid_to=t.configuration,
        )

        return t

    @classmethod
    def build_with_defined_report_version(cls, report_version):
        t = TestInfrastructure()
        t.facility_report = make_recipe(
            'reporting.tests.utils.facility_report',
            report_version=report_version,
        )
        t.facility_report.refresh_from_db()
        t.report_version = report_version
        t.user = make_recipe('registration.tests.utils.industry_operator_user')
        t.configuration = Configuration.objects.get(
            valid_from__lte=t.facility_report.created_at, valid_to__gte=t.facility_report.created_at
        )
        t.activity = Activity.objects.get(slug="gsc_non_compression")
        t.activity_json_schema = ActivityJsonSchema.objects.get(
            activity=t.activity,
            valid_from=t.configuration,
            valid_to=t.configuration,
        )
        return t

    def make_activity_source_type(self, **kwargs):
        return make_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            activity=self.activity,
            valid_from=self.configuration,
            valid_to=self.configuration,
            **kwargs
        )

    def make_report_activity(self, **kwargs):
        return make(
            ReportActivity,
            activity=self.activity,
            activity_base_schema=self.activity_json_schema,
            facility_report=self.facility_report,
            report_version=self.facility_report.report_version,
            json_data={"test": "test"},
            **kwargs
        )
