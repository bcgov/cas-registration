from enum import Enum


class ComplianceTableNames(Enum):
    COMPLIANCE_PERIOD = "compliance_period"
    COMPLIANCE_REPORT = "compliance_report"
    COMPLIANCE_REPORT_VERSION = "compliance_report_version"
    COMPLIANCE_OBLIGATION = "compliance_obligation"
    COMPLIANCE_CHARGE_RATE = "compliance_charge_rate"
    COMPLIANCE_EARNED_CREDIT = "compliance_earned_credit"
    ELICENSING_CLIENT_OPERATOR = "elicensing_client_operator"
    ELICENSING_INVOICE = "elicensing_invoice"
    ELICENSING_LINE_ITEM = "elicensing_line_item"
    ELICENSING_PAYMENT = "elicensing_payment"
    ELICENSING_ADJUSTMENT = "elicensing_adjustment"
    COMPLIANCE_PENALTY_RATE = "compliance_penalty_rate"
    COMPLIANCE_PENALTY = "compliance_penalty"
    COMPLIANCE_PENALTY_ACCRUAL = "compliance_penalty_accrual"
    ELICENSING_INTEREST_RATE = "elicensing_interest_rate"


class ComplianceInvoiceTypes(Enum):
    OBLIGATION = "obligation"
    AUTOMATIC_OVERDUE_PENALTY = "automatic overdue penalty"


class ComplianceSummaryStatus(Enum):
    OBLIGATION_NOT_MET = "Obligation not met"
    OBLIGATION_FULLY_MET = "Obligation fully met"
    OBLIGATION_PENDING_INVOICE_CREATION = "Obligation pending invoice creation"
    EARNED_CREDITS = "Earned credits"
    NO_OBLIGATION_OR_EARNED_CREDITS = "No obligation or earned credits"


class IssuanceStatus(Enum):
    CREDITS_NOT_ISSUED = "Credits Not Issued in BCCR"
    ISSUANCE_REQUESTED = "Issuance Requested"
    CHANGES_REQUIRED = "Changes Required"
    APPROVED = "Approved"
    DECLINED = "Declined"
