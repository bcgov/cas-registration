# Registry of all email templates and their test context values.
# Used by snapshot tests to render templates with known values.
#
# - If a template exists in the DB but not here, test_all_templates_are_covered fails.
# - If an entry here doesn't exist in the DB, test_no_stale_template_entries fails.
# - If a template's rendered body or subject changes, test_template_body/subject_snapshot fails.
#
# When adding a new email template via migration, add a corresponding entry here
# with representative context values for all variables used in the template.

MOCK_CONTACT = {
    "external_user_full_name": "Jane Smith",
    "operator_legal_name": "Acme Corp Ltd.",
    "external_user_email_address": "jane@example.com",
}

MOCK_BORO_CONTACT = {
    "operation_name": "Test Smelter",
    **MOCK_CONTACT,
}

MOCK_OPERATOR_CONTACT = {
    "operator_legal_name": "Acme Corp Ltd.",
    "operation_name": "Test Smelter",
}

MOCK_COMPLIANCE_YEAR = "2025"
MOCK_COMPLIANCE_PERIOD = MOCK_COMPLIANCE_YEAR
MOCK_YEAR_DUE = "2026"

TEMPLATE_CONTEXTS = {
    # --- Admin access request templates ---
    "Admin Access Request Confirmation": MOCK_CONTACT,
    "Admin Access Request Approved": MOCK_CONTACT,
    "Admin Access Request Declined": MOCK_CONTACT,
    # --- Operator with admin access request templates ---
    "Operator With Admin Access Request Confirmation": MOCK_CONTACT,
    "Operator With Admin Access Request Approved": MOCK_CONTACT,
    "Operator With Admin Access Request Declined": MOCK_CONTACT,
    # --- New operator and admin access request templates ---
    "New Operator And Admin Access Request Confirmation": MOCK_CONTACT,
    "New Operator And Admin Access Request Approved": MOCK_CONTACT,
    "New Operator And Admin Access Request Declined": MOCK_CONTACT,
    # --- BORO ID application templates ---
    "BORO ID Application Confirmation": MOCK_BORO_CONTACT,
    "BORO ID Application Approved": MOCK_BORO_CONTACT,
    "BORO ID Application Declined": MOCK_BORO_CONTACT,
    "BORO ID Application Changes Requested": MOCK_BORO_CONTACT,
    # --- Opt-in and BORO ID application templates ---
    "Opt-in And BORO ID Application Confirmation": MOCK_BORO_CONTACT,
    "Opt-in And BORO ID Application Approved": MOCK_BORO_CONTACT,
    "Opt-in And BORO ID Application Declined": MOCK_BORO_CONTACT,
    "Opt-in And BORO ID Application Changes Requested": MOCK_BORO_CONTACT,
    # --- Registration templates ---
    "BORO ID Issuance": MOCK_BORO_CONTACT,
    "Registration Submission Acknowledgement": MOCK_BORO_CONTACT,
    # --- Compliance templates ---
    "Notice of Earned Credits Generated": {
        **MOCK_OPERATOR_CONTACT,
        "compliance_year": MOCK_COMPLIANCE_YEAR,
        "earned_credit_amount": "500",
    },
    "No Obligation No Earned Credits Generated": {
        **MOCK_OPERATOR_CONTACT,
        "compliance_year": MOCK_COMPLIANCE_YEAR,
    },
    "Notice of Obligation Generated": {
        **MOCK_OPERATOR_CONTACT,
        "compliance_year": MOCK_COMPLIANCE_YEAR,
        "invoice_generation_date": "November 1, 2026",
        "compliance_deadline": "November 30, 2026",
    },
    "Notice of Credits Requested": {
        **MOCK_OPERATOR_CONTACT,
    },
    "Notice of Compliance Obligation Due": {
        **MOCK_OPERATOR_CONTACT,
        "compliance_period": MOCK_COMPLIANCE_PERIOD,
        "tonnes_of_co2": "1000",
        "outstanding_balance": "50000",
        "year_due": MOCK_YEAR_DUE,
    },
    "Reminder of Compliance Obligation Due": {
        **MOCK_OPERATOR_CONTACT,
        "year_due": MOCK_YEAR_DUE,
        "tonnes_of_co2": "1000",
        "outstanding_balance": "50000",
    },
    "Notice of Obligation Met": {
        **MOCK_OPERATOR_CONTACT,
        "compliance_period": MOCK_COMPLIANCE_PERIOD,
    },
    "Notice of Obligation Met Penalty Due": {
        **MOCK_OPERATOR_CONTACT,
        "compliance_year": MOCK_COMPLIANCE_YEAR,
        "compliance_deadline": "November 30, 2026",
        "penalty_amount": "$350.25",
    },
    "Notice of Penalty Paid": {
        **MOCK_OPERATOR_CONTACT,
    },
    "Compliance Obligation Due Date Passed - Penalty now Accruing": {
        **MOCK_OPERATOR_CONTACT,
        "tonnes_of_co2": "1000",
        "outstanding_balance": "50000",
    },
    "Supplementary Report Submitted after Deadline": {
        **MOCK_OPERATOR_CONTACT,
        "tonnes_of_co2": "1000",
        "outstanding_balance": "50000",
        "year_due": MOCK_YEAR_DUE,
    },
}
