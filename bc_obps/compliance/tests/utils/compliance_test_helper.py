from decimal import Decimal
from registration.models import Operation
from reporting.models import ReportingYear, ReportVersion
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
        self.report_version = make_recipe('reporting.tests.utils.report_version', report=self.report)
        ## INITIAL REPORT COMPLIANCE SUMMARY
        self.report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            report_version=self.report_version,
            excess_emissions=0,
            credited_emissions=0,
        )
        ## COMPLIANCE REPORT
        self.compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period=self.compliance_period
        )
        ## INITIAL COMPLIANCE REPORT VERSION
        self.compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.report_compliance_summary,
            excess_emissions_delta_from_previous=0,
            credited_emissions_delta_from_previous=0,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=False,
            previous_version=None,
        )


class InitialComplianceObligation(BaseComplianceTestInfrastructure):
    def __init__(self, reporting_year):
        super().__init__(reporting_year)
        self.compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.compliance_report_version,
        )
        self.report_compliance_summary.excess_emissions = Decimal('100')


class InitialComplianceEarnedCredit(BaseComplianceTestInfrastructure):
    def __init__(self, reporting_year):
        super().__init__(reporting_year)
        self.compliance_earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.compliance_report_version,
            bccr_trading_name='test',
            bccr_holding_account_id='test',
        )
        self.report_compliance_summary.credited_emissions = Decimal('100')


class SupplementaryComplianceTestInfrastructure:
    def __init__(self, previous_data):
        ## ENSURE PREVIOUS EMISSION REPORT IS SUBMITTED
        previous_data.report_version.status = ReportVersion.ReportVersionStatus.Submitted
        previous_data.report_version.save()
        ## SUPPLEMENTARY EMISSION REPORT VERSION
        self.report_version = make_recipe(
            'reporting.tests.utils.report_version', report=previous_data.report_version.report
        )
        ## SUPPLEMENTARY REPORT COMPLIANCE SUMMARY
        self.report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            report_version=self.report_version,
            excess_emissions=0,
            credited_emissions=0,
        )
        ## SUPPLEMENTARY COMPLIANCE REPORT VERSION
        self.compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=previous_data.compliance_report_version.compliance_report,
            report_compliance_summary=self.report_compliance_summary,
            excess_emissions_delta_from_previous=0,
            credited_emissions_delta_from_previous=0,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=True,
            previous_version=previous_data.compliance_report_version,
        )


class SupplementaryComplianceObligation(SupplementaryComplianceTestInfrastructure):
    def __init__(self, previous_data):
        super().__init__(previous_data)
        self.compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.compliance_report_version,
        )
        self.report_compliance_summary.excess_emissions = Decimal('100')


class SupplementaryComplianceEarnedCredit(SupplementaryComplianceTestInfrastructure):
    def __init__(self, previous_data):
        super().__init__(previous_data)
        self.compliance_earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.compliance_report_version,
        )
        self.report_compliance_summary.credited_emissions = Decimal('100')


class ComplianceTestHelper:
    @staticmethod
    def generate_invoice_data(data):
        data.invoice = make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=data.compliance_report_version.compliance_report.compliance_period.compliance_deadline,
            outstanding_balance=Decimal("1000.00"),
            invoice_fee_balance=Decimal("1000.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        data.fee = make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=data.invoice,
            base_amount=Decimal("1000.00"),
        )
        data.compliance_obligation.elicensing_invoice = data.invoice
        data.compliance_obligation.save()

    @classmethod
    def build_test_data(
        cls,
        reporting_year: int = 2025,
        crv_status: ComplianceReportVersion.ComplianceStatus = ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
        create_invoice_data: bool = False,
        previous_data: BaseComplianceTestInfrastructure | SupplementaryComplianceTestInfrastructure | None = None,
    ):
        """
        Generates all the initial base data objects for testing the compliance module.
        Calling this function with no parameters will create a base set of test data with a crv status of NO_OBLIGATION_OR_EARNED_CREDITS for reporting_year 2025.

        Args:
            reporting_year (Optional): An integer defining the reporting year to use when generating the report data. Defaults to 2025.
            crv_status (Optional): A ComplianceReportVersion status. Defaults to NO_OBLIGATION_OR_EARNED_CREDITS. Used to dynamically build objects beyond the base infrastructure
            create_invoice_data (Optional): Boolean flag sets whether to create invoice and fee objects for an obligation. Default False.
            previous_data (Optional): The previous set of data to create a supplementary report from. Required for creating supplementary data. previous_data may be of type BaseComplianceTestInfrastructure | SupplementaryComplianceTestInfrastructure.

        Returns:
            A set of initial compliance data matching the needs of the crv_status arg.
        """

        match crv_status:
            case ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET:
                if previous_data:
                    t = SupplementaryComplianceObligation(previous_data)
                else:
                    t = InitialComplianceObligation(reporting_year)
                t.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
                t.compliance_report_version.save()
                t.report_compliance_summary.excess_emissions = Decimal('100')
                t.report_compliance_summary.save()
                if create_invoice_data:
                    cls.generate_invoice_data(t)

            case ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET:
                if previous_data:
                    t = SupplementaryComplianceObligation(previous_data)
                else:
                    t = InitialComplianceObligation(reporting_year)
                t.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
                t.compliance_report_version.save()
                t.report_compliance_summary.excess_emissions = Decimal('100')
                t.report_compliance_summary.save()
                if create_invoice_data:
                    cls.generate_invoice_data(t)
                    t.invoice.outstanding_balance = Decimal('0')

            case ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION:
                if previous_data:
                    t = SupplementaryComplianceObligation(previous_data)
                else:
                    t = InitialComplianceObligation(reporting_year)
                t.compliance_report_version.status = (
                    ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
                )
                t.compliance_report_version.save()
                t.report_compliance_summary.excess_emissions = Decimal('100')
                t.report_compliance_summary.save()

            case ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS:
                if previous_data:
                    t = SupplementaryComplianceEarnedCredit(previous_data)
                else:
                    t = InitialComplianceEarnedCredit(reporting_year)
                t.report_compliance_summary.credited_emissions = Decimal('100')
                t.report_compliance_summary.save()
                t.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
                t.compliance_report_version.save()

            case ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS:
                if previous_data:
                    t = SupplementaryComplianceTestInfrastructure(previous_data)
                else:
                    t = BaseComplianceTestInfrastructure(reporting_year)

            case ComplianceReportVersion.ComplianceStatus.SUPERCEDED:
                if previous_data:
                    t = SupplementaryComplianceTestInfrastructure(previous_data)
                else:
                    t = BaseComplianceTestInfrastructure(reporting_year)
                t.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.SUPERCEDED
                t.compliance_report_version.save()

        return t
