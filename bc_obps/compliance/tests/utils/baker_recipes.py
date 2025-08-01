from model_bakery.recipe import Recipe, foreign_key
from compliance.models import (
    CompliancePeriod,
    ComplianceReportVersion,
    ComplianceObligation,
    ComplianceReport,
    ComplianceEarnedCredit,
    ComplianceChargeRate,
    ElicensingClientOperator,
    ElicensingInvoice,
    ElicensingLineItem,
    ElicensingPayment,
    ElicensingAdjustment,
    CompliancePenaltyRate,
    CompliancePenalty,
    CompliancePenaltyAccrual,
    ElicensingInterestRate,
)
from reporting.tests.utils.baker_recipes import report, report_compliance_summary, reporting_year
from registration.tests.utils.baker_recipes import (
    operator,
)
from decimal import Decimal

# ComplianceChargeRate recipe
compliance_charge_rate = Recipe(
    ComplianceChargeRate,
    reporting_year=foreign_key(reporting_year),
    rate=Decimal('40.00'),
)

# CompliancePeriod recipe
compliance_period = Recipe(
    CompliancePeriod,
    start_date="2024-01-01",
    end_date="2024-12-31",
    compliance_deadline="2025-06-30",
    reporting_year=foreign_key(reporting_year),
)

# ComplianceReport recipe
compliance_report = Recipe(
    ComplianceReport, report=foreign_key(report), compliance_period=foreign_key(compliance_period)
)

# ComplianceSummary recipe
compliance_report_version = Recipe(
    ComplianceReportVersion,
    compliance_report=foreign_key(compliance_report),
    report_compliance_summary=foreign_key(report_compliance_summary),
)

# ComplianceObligation recipe
compliance_obligation = Recipe(
    ComplianceObligation,
    compliance_report_version=foreign_key(compliance_report_version),
    penalty_status=ComplianceObligation.PenaltyStatus.NONE,
    obligation_deadline="2025-11-30",
    obligation_id="21-0001-1-1",  # Default test obligation ID in format YY-OOOO-R-V
)

# ComplianceEarnedCredit recipe
compliance_earned_credit = Recipe(
    ComplianceEarnedCredit,
    compliance_report_version=foreign_key(compliance_report_version),
)

# ElicensingClientOperator recipe
elicensing_client_operator = Recipe(
    ElicensingClientOperator,
    operator=foreign_key(operator),
)

# ElicensingInvoice recipe
elicensing_invoice = Recipe(
    ElicensingInvoice,
    elicensing_client_operator=foreign_key(elicensing_client_operator),
    due_date='2024-11-30',
    outstanding_balance=Decimal('100.01'),
    invoice_fee_balance=Decimal('100.01'),
    invoice_interest_balance=Decimal('0.00'),
    is_void=False,
)

# ElicensingLineItem recipe
elicensing_line_item = Recipe(
    ElicensingLineItem,
    elicensing_invoice=foreign_key(elicensing_invoice),
)

# ElicensingPayment recipe
elicensing_payment = Recipe(
    ElicensingPayment, elicensing_line_item=foreign_key(elicensing_line_item), amount=Decimal('100.00')
)

# ElicensingPayment recipe
elicensing_adjustment = Recipe(
    ElicensingAdjustment, elicensing_line_item=foreign_key(elicensing_line_item), amount=Decimal('100.00')
)

# CompliancePenaltyRate recipe
compliance_penalty_rate = Recipe(
    CompliancePenaltyRate,
    compliance_period=foreign_key(compliance_period),
    rate=Decimal('0.0038'),
    is_current_rate=True,
)

# CompliancePenalty recipe
compliance_penalty = Recipe(
    CompliancePenalty,
    compliance_obligation=foreign_key(compliance_obligation),
    elicensing_invoice=foreign_key(elicensing_invoice),
    accrual_start_date='2025-12-01',
    penalty_amount=1000000.00,
)

# CompliancePenaltyAccrual recipe
compliance_penalty_accrual = Recipe(CompliancePenaltyAccrual, compliance_penalty=foreign_key(compliance_penalty))

# ElicensingInterestRate recipe
elicensing_interest_rate = Recipe(ElicensingInterestRate, interest_rate=Decimal('0.0007'))
