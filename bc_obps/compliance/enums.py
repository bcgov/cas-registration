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
