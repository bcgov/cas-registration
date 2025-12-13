from decimal import Decimal
from registration.models import Operation
from reporting.models import ReportingYear
from compliance.models import CompliancePeriod, ComplianceReportVersion

from model_bakery.baker import make_recipe


class BaseComplianceTestInfrastructure:
    def __init__(self, reporting_year: int):
        ## REPORTING YEAR
        if ReportingYear.objects.filter(pk=reporting_year).exists():
            self.reporting_year = ReportingYear.objects.get(pk=reporting_year)
        else:
            self.reporting_year = make_recipe('reporting.tests.utils.reporting_year', reporting_year=reporting_year)
        ## COMPLIANCE PERIOD
        if CompliancePeriod.objects.filter(reporting_year=self.reporting_year).exists():
            self.compliance_period = CompliancePeriod.objects.get(reporting_year=reporting_year)
        else:
            self.compliance_period = make_recipe(
                'compliance.tests.utils.compliance_period',
                reporting_year=self.reporting_year,
                start_date=f'{reporting_year}-01-01',
                end_date=f'{reporting_year}-12-31',
                compliance_deadline=f'{reporting_year + 1}-11-30',
                invoice_generation_date=f'{reporting_year + 1}-11-01',
            )
        ## OPERATION
        self.operation = make_recipe(
            'registration.tests.utils.operation',
            bc_obps_regulated_operation=make_recipe('registration.tests.utils.boro_id'),
            status=Operation.Statuses.REGISTERED,
        )
        ## EMISSION REPORT
        self.report = make_recipe(
            'reporting.tests.utils.report',
            operator=self.operation.operator,
            operation=self.operation,
            reporting_year=self.reporting_year,
        )
        ## INITIAL EMISSION REPORT VERSION
        self.initial_report_version = make_recipe('reporting.tests.utils.report_version', report=self.report)
        ## INITIAL REPORT COMPLIANCE SUMMARY
        self.initial_report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            report_version=self.initial_report_version,
            excess_emissions=0,
            credited_emissions=0,
        )
        ## COMPLIANCE REPORT
        self.compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period=self.compliance_period
        )
        ## INITIAL COMPLIANCE REPORT VERSION
        self.initial_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.initial_report_compliance_summary,
            excess_emissions_delta_from_previous=0,
            credited_emissions_delta_from_previous=0,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=False,
            previous_version=None,
        )


class InitialComplianceObligation(BaseComplianceTestInfrastructure):
    def __init__(self, reporting_year):
        super().__init__(reporting_year)
        self.initial_compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.initial_compliance_report_version,
        )
        self.initial_report_compliance_summary.excess_emissions = Decimal('100')


class InitialComplianceEarnedCredit(BaseComplianceTestInfrastructure):
    def __init__(self, reporting_year):
        super().__init__(reporting_year)
        self.initial_compliance_earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.initial_compliance_report_version,
        )
        self.initial_report_compliance_summary.credited_emissions = Decimal('100')


class ComplianceTestHelper:
    @classmethod
    def build_initial_compliance_report(
        cls,
        reporting_year: int = 2025,
        crv_status: ComplianceReportVersion.ComplianceStatus = ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
    ):
        """
        Generates all the initial base data objects for testing the compliance module.

        Args:
            reporting_year (Optional): An integer defining the reporting year to use when generating the report data. Defaults to 2025.
            crv_status (Optional): A ComplianceReportVersion status. Defaults to NO_OBLIGATION_OR_EARNED_CREDITS. Used to dynamically build objects beyond the base infrastructure

        Returns:
            A set of initial compliance data matching the needs of the crv_status arg.
        """

        match crv_status:
            case ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET:
                t = InitialComplianceObligation(reporting_year)
                t.initial_compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
                ## INVOICE STUFF & EXCESS EMISSIONS
            case ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET:
                t = InitialComplianceObligation(reporting_year)
                t.initial_compliance_report_version.status = (
                    ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
                )
                ## INVOICE STUFF & EXCESS EMISSIONS
            case ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION:
                t = InitialComplianceObligation(reporting_year)
                t.initial_compliance_report_version.status = (
                    ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
                )
                ## EXCESS EMISSIONS
            case ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS:
                t = InitialComplianceEarnedCredit(reporting_year)
                ## CREDITED EMISSIONS
            case ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS:
                t = BaseComplianceTestInfrastructure(reporting_year)
            case ComplianceReportVersion.ComplianceStatus.SUPERCEDED:
                t = BaseComplianceTestInfrastructure(reporting_year)
                t.initial_compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.SUPERCEDED

        return t
