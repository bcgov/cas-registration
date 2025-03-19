MOCK_UUID = "e1300fd7-2dee-47d1-b655-2ad3fd10f052"
MOCK_VERSION = "1"
MOCK_INT = 1
ENDPOINTS = {
    "authorized_roles": [
        {"method": "get", "endpoint_name": "list_dashboard_data"},
        {"method": "get", "endpoint_name": "list_business_structures"},
        {"method": "get", "endpoint_name": "list_naics_codes"},
        {
            "method": "get",
            "endpoint_name": "get_operators_by_cra_number_or_legal_name",
        },
        {
            "method": "get",
            "endpoint_name": "get_operator_confirm",
            "kwargs": {"operator_id": MOCK_UUID},
        },
        {"method": "get", "endpoint_name": "list_regulated_products"},
        {"method": "get", "endpoint_name": "list_reporting_activities"},
        {
            "method": "get",
            "endpoint_name": "get_user_operator_has_admin",
            "kwargs": {"operator_id": MOCK_UUID},
        },
    ],
    "approved_industry_user": [
        {
            "method": "get",
            "endpoint_name": "get_current_operator_and_user_operator",
        },
        {"method": "get", "endpoint_name": "is_current_user_approved_admin"},
        {"method": "get", "endpoint_name": "get_operator_users"},
        {
            "method": "get",
            "endpoint_name": "operation_registration_get_opted_in_operation_detail",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {"method": "get", "endpoint_name": "list_current_users_operations"},
        {
            "method": "get",
            "endpoint_name": "get_initial_activity_data",
            "kwargs": {"version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_person_responsible_by_version_id",
            "kwargs": {"version_id": MOCK_INT},
        },
        {"method": "get", "endpoint_name": "get_compliance_summaries_list"},
        {
            "method": "get",
            "endpoint_name": "get_compliance_summary",
            "kwargs": {"summary_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_additional_data_by_version_id",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_registration_purpose_by_version_id",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_facility_list_by_version_id",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_verification_by_version_id",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_regulated_products_by_version_id",
            "kwargs": {"version_id": MOCK_INT},
        },
        {"method": "get", "endpoint_name": "get_gas_type"},
        {"method": "get", "endpoint_name": "get_emission_category"},
        {
            "method": "get",
            "endpoint_name": "load_production_data",
            "kwargs": {"report_version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_non_attributable_by_version_id",
            "kwargs": {"version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "load_report_activity_data",
            "kwargs": {
                "report_version_id": MOCK_INT,
                "facility_id": MOCK_UUID,
                "activity_id": MOCK_INT,
            },
        },
        {
            "method": "get",
            "endpoint_name": "get_new_entrant_data",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_facility_report_list",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "register_get_operation_information",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_selected_facilities",
            "kwargs": {'report_version_id': MOCK_VERSION},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_type_by_version",
            "kwargs": {"version_id": MOCK_VERSION},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_attachments",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_emission_allocations",
            "kwargs": {"report_version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_needs_verification",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {"method": "post", "endpoint_name": "create_facilities"},
        {"method": "post", "endpoint_name": "create_contact"},
        {
            "method": "post",
            "endpoint_name": "create_operation_representative",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "post",
            "endpoint_name": "save_new_entrant_data",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "post",
            "endpoint_name": "register_create_operation_information",
        },
        {"method": "post", "endpoint_name": "start_report"},
        {
            "method": "post",
            "endpoint_name": "save_report",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "post",
            "endpoint_name": "save_facility_report",
            "kwargs": {"version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "post",
            "endpoint_name": "save_selected_facilities",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "post",
            "endpoint_name": "save_report_additional_data",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "post",
            "endpoint_name": "save_report_verification",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "post",
            "endpoint_name": "save_report_contact",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "post",
            "endpoint_name": "save_report_activity_data",
            "kwargs": {
                "report_version_id": MOCK_INT,
                "facility_id": MOCK_UUID,
                "activity_id": MOCK_INT,
            },
        },
        {
            "method": "post",
            "endpoint_name": "save_production_data",
            "kwargs": {"report_version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "post",
            "endpoint_name": "save_emission_allocation_data",
            "kwargs": {"report_version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "post",
            "endpoint_name": "save_report_attachments",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "put",
            "endpoint_name": "register_edit_operation_information",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "post",
            "endpoint_name": "submit_report_version",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "patch",
            "endpoint_name": "save_facility_report_list",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "post",
            "endpoint_name": "create_report_supplementary_version",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "post",
            "endpoint_name": "change_report_version_type",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "put",
            "endpoint_name": "update_operation",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "put",
            "endpoint_name": "update_operator_and_user_operator",
        },
        {
            "method": "put",
            "endpoint_name": "update_facility",
            "kwargs": {"facility_id": MOCK_UUID},
        },
        {
            "method": "put",
            "endpoint_name": "update_contact",
            "kwargs": {"contact_id": MOCK_UUID},
        },
        {
            "method": "put",
            "endpoint_name": "operation_registration_update_opted_in_operation_detail",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "put",
            "endpoint_name": "create_or_replace_new_entrant_application",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "patch",
            "endpoint_name": "operation_registration_submission",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "put",
            "endpoint_name": "remove_operation_representative",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_compliance_summary_data",
            "kwargs": {"report_version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_basic_gas_types",
        },
    ],
    "all_roles": [
        {"method": "get", "endpoint_name": "get_reporting_year"},
        {"method": "put", "endpoint_name": "update_user_profile"},
    ],
    "industry_user": [
        {
            "method": "get",
            "endpoint_name": "get_current_operator_from_user_operator",
        },
        {
            "method": "get",
            "endpoint_name": "get_user_operator_access_declined",
            "kwargs": {"operator_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_current_user_operator_has_registered_operation",
        },
        {
            "method": "get",
            "endpoint_name": "get_current_user_operator_has_required_fields",
        },
        {
            "method": "post",
            "endpoint_name": "request_access",
            "kwargs": {"operator_id": MOCK_UUID},
        },
        {
            "method": "post",
            "endpoint_name": "request_admin_access",
            "kwargs": {"operator_id": MOCK_UUID},
        },
        {"method": "post", "endpoint_name": "create_operator_and_user_operator"},
        {"method": "delete", "endpoint_name": "delete_user_operator", "kwargs": {"user_operator_id": MOCK_UUID}},
    ],
    "approved_industry_admin_user": [
        {
            "method": "get",
            "endpoint_name": "get_current_user_operator_access_requests",
        },
    ],
    "authorized_irc_user": [
        {"method": "get", "endpoint_name": "list_operators"},
        {"method": "get", "endpoint_name": "list_user_operators"},
        {"method": "get", "endpoint_name": "list_transfer_events"},
        {"method": "get", "endpoint_name": "get_transfer_event", "kwargs": {"transfer_id": MOCK_UUID}},
    ],
    "approved_authorized_roles": [
        {
            "method": "get",
            "endpoint_name": "get_operator",
            "kwargs": {"operator_id": MOCK_UUID},
        },
        {"method": "get", "endpoint_name": "list_operations"},
        {"method": "get", "endpoint_name": "list_contacts"},
        {
            "method": "get",
            "endpoint_name": "list_facilities_by_operation_id",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "list_operation_representatives",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_user_operator_by_id",
            "kwargs": {"user_operator_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_facility",
            "kwargs": {"facility_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_contact",
            "kwargs": {"contact_id": MOCK_UUID},
        },
        {"method": "get", "endpoint_name": "get_registration_purposes"},
        {
            "method": "get",
            "endpoint_name": "get_operation_new_entrant_application",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_operation",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_operation_with_documents",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_report_operation_by_version_id",
            "kwargs": {"version_id": MOCK_INT},
        },
        {"method": "get", "endpoint_name": "build_form_schema"},
        {"method": "get", "endpoint_name": "get_dashboard_operations_list"},
        {
            "method": "get",
            "endpoint_name": "get_facility_report_form_data",
            "kwargs": {"version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_ordered_facility_report_activities",
            "kwargs": {"version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_facility_report_by_version_id",
            "kwargs": {"version_id": MOCK_INT},
        },
        {
            "method": "get",
            "endpoint_name": "get_emission_summary_totals",
            "kwargs": {"version_id": MOCK_INT, "facility_id": MOCK_UUID},
        },
        {
            "method": "get",
            "endpoint_name": "get_operation_emission_summary_totals",
            "kwargs": {"version_id": MOCK_INT},
        },
    ],
    "authorized_irc_user_and_industry_admin_user": [],
    "cas_director": [
        {
            "method": "patch",
            "endpoint_name": "facility_bcghg_id",
            "kwargs": {"facility_id": MOCK_UUID},
        },
        {
            "method": "patch",
            "endpoint_name": "operation_boro_id",
            "kwargs": {"operation_id": MOCK_UUID},
        },
        {
            "method": "patch",
            "endpoint_name": "operation_bcghg_id",
            "kwargs": {"operation_id": MOCK_UUID},
        },
    ],
    "cas_director_analyst_and_industry_admin_user": [
        {
            "method": "patch",
            "endpoint_name": "update_user_operator_status",
            "kwargs": {"user_operator_id": MOCK_UUID},
        },
    ],
    "cas_analyst": [
        {"method": "post", "endpoint_name": "create_transfer_event"},
        {"method": "patch", "endpoint_name": "update_transfer_event", "kwargs": {"transfer_id": MOCK_UUID}},
        {"method": "delete", "endpoint_name": "delete_transfer_event", "kwargs": {"transfer_id": MOCK_UUID}},
    ],
}
