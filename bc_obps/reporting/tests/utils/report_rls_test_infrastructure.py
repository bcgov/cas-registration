from model_bakery.baker import make_recipe
from registration.models.operation import Operation
from registration.models.user_operator import UserOperator
from reporting.models.facility_report import FacilityReport
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from reporting.tests.utils.bakers import report_baker


class ReportRlsSetup:
    """
    This class is used to create the report entities commonly used when testing RLS policies.
    """

    approved_user_operator: UserOperator
    operation: Operation
    report: Report
    report_version: ReportVersion
    facility_report: FacilityReport

    def __init__(self):
        self.approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        self.operation = make_recipe(
            'registration.tests.utils.operation', operator=self.approved_user_operator.operator
        )
        self.report = report_baker(
            operation=self.operation,
            operator=self.approved_user_operator.operator,
        )
        self.report_version = make_recipe("reporting.tests.utils.report_version", report=self.report)
        self.facility_report = make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            facility__operation=self.operation,
        )
