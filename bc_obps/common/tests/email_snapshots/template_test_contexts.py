# Registry of all email templates and their test context values.
# Used by snapshot tests to render templates with known values.
#
# - If a template exists in the DB but not here, test_all_templates_are_covered fails.
# - If an entry here doesn't exist in the DB, test_no_stale_template_entries fails.
# - If a template's rendered body or subject changes, test_template_body/subject_snapshot fails.
#
# When adding a new email template via migration, add a corresponding entry here
# with representative context values for all variables used in the template.

TEMPLATE_CONTEXTS = {
    # --- Admin access request templates ---
    "Admin Access Request Confirmation": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    "Admin Access Request Approved": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    "Admin Access Request Declined": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    # --- Operator with admin access request templates ---
    "Operator With Admin Access Request Confirmation": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    "Operator With Admin Access Request Approved": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    "Operator With Admin Access Request Declined": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    # --- New operator and admin access request templates ---
    "New Operator And Admin Access Request Confirmation": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    "New Operator And Admin Access Request Approved": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    "New Operator And Admin Access Request Declined": {
        "external_user_full_name": "Jane Smith",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    # --- BORO ID application templates ---
    "BORO ID Application Confirmation": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    "BORO ID Application Approved": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    "BORO ID Application Declined": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    "BORO ID Application Changes Requested": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    # --- Opt-in and BORO ID application templates ---
    "Opt-in And BORO ID Application Confirmation": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    "Opt-in And BORO ID Application Approved": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    "Opt-in And BORO ID Application Declined": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    "Opt-in And BORO ID Application Changes Requested": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    # --- Registration templates ---
    "BORO ID Issuance": {
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_full_name": "Jane Smith",
        "external_user_email_address": "jane@example.com",
    },
    "Registration Submission Acknowledgement": {
        "external_user_full_name": "Jane Smith",
        "operation_name": "Test Smelter",
        "operator_legal_name": "Acme Corp Ltd.",
        "external_user_email_address": "jane@example.com",
    },
    # --- Compliance templates ---
    "Notice of Earned Credits Generated": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "compliance_year": "2025",
        "earned_credit_amount": "500",
    },
    "No Obligation No Earned Credits Generated": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "compliance_year": "2025",
    },
    "Notice of Obligation Generated": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "compliance_year": "2025",
        "invoice_generation_date": "November 1, 2026",
        "compliance_deadline": "November 30, 2026",
    },
    "Notice of Credits Requested": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
    },
    "Notice of Compliance Obligation Due": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "compliance_period": "2025",
        "tonnes_of_co2": "1000",
        "outstanding_balance": "50000",
        "year_due": "2026",
    },
    "Reminder of Compliance Obligation Due": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "year_due": "2026",
        "tonnes_of_co2": "1000",
        "outstanding_balance": "50000",
    },
    "Notice of Obligation Met": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "compliance_period": "2025",
    },
    "Notice of Obligation Met Penalty Due": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "compliance_year": "2025",
        "compliance_deadline": "November 30, 2026",
        "penalty_amount": "350.25",
    },
    "Compliance Obligation Due Date Passed - Penalty now Accruing": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "tonnes_of_co2": "1000",
        "outstanding_balance": "50000",
    },
    "Supplementary Report Submitted after Deadline": {
        "operator_legal_name": "Acme Corp Ltd.",
        "operation_name": "Test Smelter",
        "tonnes_of_co2": "1000",
        "outstanding_balance": "50000",
        "year_due": "2026",
    },
}
