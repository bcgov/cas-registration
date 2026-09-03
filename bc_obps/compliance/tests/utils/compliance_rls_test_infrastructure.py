from model_bakery.baker import make_recipe
from registration.models.user_operator import UserOperator
from reporting.models import Report
from compliance.models import ComplianceReport, ComplianceReportVersion, CompliancePeriod


class ComplianceReportRlsTestSetup:
    """
    This class is used to create the report entities commonly used when testing RLS policies.
    """

    approved_user_operator: UserOperator
    report_2011: Report
    report_2012: Report
    compliance_report_2010: ComplianceReport
    compliance_report_2013: ComplianceReport
    compliance_report_version_2010: ComplianceReportVersion
    compliance_report_version_2013: ComplianceReportVersion
    compliance_period_2011: CompliancePeriod
    compliance_period_2012: CompliancePeriod

    def __init__(self):

        self.approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        operation = make_recipe('registration.tests.utils.operation', operator=self.approved_user_operator.operator)
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=self.approved_user_operator.operator,
            operation=operation,
            start_date='2009-01-01',
            end_date='2012-12-31',
        )
        reporting_year_2010 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2010)
        compliance_period_2010 = make_recipe(
            'compliance.tests.utils.compliance_period', reporting_year=reporting_year_2010
        )
        reporting_year_2011 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2011)
        self.compliance_period_2011 = make_recipe(
            'compliance.tests.utils.compliance_period', reporting_year=reporting_year_2011
        )
        # Outside bounds of access
        reporting_year_2012 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2012)
        self.compliance_period_2012 = make_recipe(
            'compliance.tests.utils.compliance_period', reporting_year=reporting_year_2012
        )
        reporting_year_2013 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2013)
        compliance_period_2013 = make_recipe(
            'compliance.tests.utils.compliance_period', reporting_year=reporting_year_2013
        )

        # 2010 - Within access bounds
        report_2010 = make_recipe(
            'reporting.tests.utils.report',
            operation=operation,
            operator=self.approved_user_operator.operator,
            reporting_year=reporting_year_2010,
        )
        report_version_2010 = make_recipe('reporting.tests.utils.report_version', report=report_2010)
        report_compliance_summary_2010 = make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            report_version=report_version_2010,
            excess_emissions=0,
            credited_emissions=0,
        )
        self.compliance_report_2010 = make_recipe(
            'compliance.tests.utils.compliance_report', report=report_2010, compliance_period=compliance_period_2010
        )
        self.compliance_report_version_2010 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report_2010,
            report_compliance_summary=report_compliance_summary_2010,
        )
        self.report_2011 = make_recipe(
            'reporting.tests.utils.report',
            operation=operation,
            operator=self.approved_user_operator.operator,
            reporting_year=reporting_year_2011,
        )

        # 2013 report - Outside bounds of access
        report_2013 = make_recipe(
            'reporting.tests.utils.report',
            operation=operation,
            operator=self.approved_user_operator.operator,
            reporting_year=reporting_year_2013,
        )
        report_version_2013 = make_recipe('reporting.tests.utils.report_version', report=report_2013)
        report_compliance_summary_2013 = make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            report_version=report_version_2013,
            excess_emissions=0,
            credited_emissions=0,
        )
        self.compliance_report_2013 = make_recipe(
            'compliance.tests.utils.compliance_report', report=report_2013, compliance_period=compliance_period_2013
        )
        self.compliance_report_version_2013 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report_2013,
            report_compliance_summary=report_compliance_summary_2013,
        )
        # 2012 report - non-matching user operator
        self.report_2012 = make_recipe(
            'reporting.tests.utils.report',
            reporting_year=reporting_year_2012,
        )
