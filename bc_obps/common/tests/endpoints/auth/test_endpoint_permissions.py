import logging
import pytest
from unittest.mock import patch, MagicMock, ANY
from django.urls import get_resolver
from django.test import Client, override_settings, TestCase
from registration.utils import custom_reverse_lazy


@pytest.fixture(autouse=True)
def suppress_django_request_logs(caplog):
    caplog.set_level(logging.ERROR, logger="django.request")


@override_settings(MIDDLEWARE=[])  # Remove middleware to prevent checking the user in the database
class TestEndpointPermissions(TestCase):
    client = Client()
    mock_uuid = "e1300fd7-2dee-47d1-b655-2ad3fd10f052"
    mock_version = "1"
    mock_int = 1
    endpoints_to_test = {
        "authorized_roles": [
            {"method": "get", "endpoint_name": "v1_list_business_structures"},
            {"method": "get", "endpoint_name": "v1_list_naics_codes"},
            {"method": "get", "endpoint_name": "v1_list_regulated_products"},
            {"method": "get", "endpoint_name": "v1_list_reporting_activities"},
            {
                "method": "get",
                "endpoint_name": "v1_get_operators_by_cra_number_or_legal_name",
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_operator",
                "kwargs": {"operator_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_user_operator_has_admin",
                "kwargs": {"operator_id": mock_uuid},
            },
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
                "kwargs": {"operator_id": mock_uuid},
            },
            {"method": "get", "endpoint_name": "list_regulated_products"},
            {"method": "get", "endpoint_name": "list_reporting_activities"},
            {
                "method": "get",
                "endpoint_name": "get_user_operator_has_admin",
                "kwargs": {"operator_id": mock_uuid},
            },
        ],
        "approved_industry_user": [
            {"method": "post", "endpoint_name": "v1_create_operation"},
            {"method": "post", "endpoint_name": "v1_create_contact"},
            {
                "method": "put",
                "endpoint_name": "v1_update_operation",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "v1_update_operator_and_user_operator",
                "kwargs": {"user_operator_id": mock_uuid},
            },
            {"method": "get", "endpoint_name": "v1_is_current_user_approved_admin"},
            {"method": "get", "endpoint_name": "v1_get_operator_users"},
            {
                "method": "put",
                "endpoint_name": "v1_update_contact",
                "kwargs": {"contact_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_user",
                "kwargs": {"user_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_current_operator_and_user_operator",
            },
            {"method": "get", "endpoint_name": "is_current_user_approved_admin"},
            {"method": "get", "endpoint_name": "get_operator_users"},
            {
                "method": "get",
                "endpoint_name": "get_user",
                "kwargs": {"user_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "operation_registration_get_opted_in_operation_detail",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_current_operator_from_user_operator",
            },
            {"method": "get", "endpoint_name": "list_current_users_operations"},
            {
                "method": "get",
                "endpoint_name": "get_initial_activity_data",
                "kwargs": {"version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_report_person_responsible_by_version_id",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "get_report_additional_data_by_version_id",
                "kwargs": {"report_version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "get_registration_purpose_by_version_id",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "get_report_facility_list_by_version_id",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "get_report_verification_by_version_id",
                "kwargs": {"report_version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "get_regulated_products_by_version_id",
                "kwargs": {"version_id": mock_int},
            },
            {"method": "get", "endpoint_name": "get_gas_type"},
            {"method": "get", "endpoint_name": "get_emission_category"},
            {
                "method": "get",
                "endpoint_name": "load_production_data",
                "kwargs": {"report_version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_report_non_attributable_by_version_id",
                "kwargs": {"version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "load_report_activity_data",
                "kwargs": {
                    "report_version_id": mock_int,
                    "facility_id": mock_uuid,
                    "activity_id": mock_int,
                },
            },
            {
                "method": "get",
                "endpoint_name": "get_new_entrant_data",
                "kwargs": {"report_version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "get_facility_report_list",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "register_get_operation_information",
                "kwargs": {"operation_id": mock_uuid},
            },
            {"method": "get", "endpoint_name": "get_report_type_by_version", "kwargs": {'version_id': mock_version}},
            {
                "method": "get",
                "endpoint_name": "get_selected_facilities",
                "kwargs": {'report_version_id': mock_version},
            },
            {"method": "get", "endpoint_name": "get_current_operator_from_user_operator"},
            {"method": "get", "endpoint_name": "get_report_attachments", "kwargs": {"report_version_id": mock_int}},
            {
                "method": "get",
                "endpoint_name": "get_report_type_by_version",
                "kwargs": {"version_id": mock_version},
            },
            {
                "method": "get",
                "endpoint_name": "get_current_operator_from_user_operator",
            },
            {
                "method": "get",
                "endpoint_name": "get_report_attachments",
                "kwargs": {"report_version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "get_emission_allocations",
                "kwargs": {"report_version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_report_needs_verification",
                "kwargs": {"report_version_id": mock_int},
            },
            {"method": "post", "endpoint_name": "create_facilities"},
            {"method": "post", "endpoint_name": "create_contact"},
            {
                "method": "post",
                "endpoint_name": "create_operation_representative",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "post",
                "endpoint_name": "save_new_entrant_data",
                "kwargs": {"report_version_id": mock_int},
            },
            {
                "method": "post",
                "endpoint_name": "register_create_operation_information",
            },
            {"method": "post", "endpoint_name": "start_report"},
            {
                "method": "post",
                "endpoint_name": "save_report",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "post",
                "endpoint_name": "save_facility_report",
                "kwargs": {"version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "post",
                "endpoint_name": "save_selected_facilities",
                "kwargs": {"report_version_id": mock_int},
            },
            {
                "method": "post",
                "endpoint_name": "save_report_additional_data",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "post",
                "endpoint_name": "save_report_verification",
                "kwargs": {"report_version_id": mock_int},
            },
            {
                "method": "post",
                "endpoint_name": "save_report_contact",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "post",
                "endpoint_name": "save_report_activity_data",
                "kwargs": {
                    "report_version_id": mock_int,
                    "facility_id": mock_uuid,
                    "activity_id": mock_int,
                },
            },
            {
                "method": "post",
                "endpoint_name": "save_production_data",
                "kwargs": {"report_version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "post",
                "endpoint_name": "save_emission_allocation_data",
                "kwargs": {"report_version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "post",
                "endpoint_name": "save_report_attachments",
                "kwargs": {"report_version_id": mock_int},
            },
            {
                "method": "put",
                "endpoint_name": "register_edit_operation_information",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "post",
                "endpoint_name": "submit_report_version",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "patch",
                "endpoint_name": "save_facility_report_list",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "post",
                "endpoint_name": "change_report_version_type",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "put",
                "endpoint_name": "update_operation",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "update_operator_and_user_operator",
                "kwargs": {"user_operator_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "update_facility",
                "kwargs": {"facility_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "update_contact",
                "kwargs": {"contact_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "operation_registration_update_opted_in_operation_detail",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "create_or_replace_new_entrant_application",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "update_operation",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "patch",
                "endpoint_name": "operation_registration_submission",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "remove_operation_representative",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_compliance_summary_data",
                "kwargs": {"report_version_id": mock_int},
            },
        ],
        "all_roles": [
            {"method": "put", "endpoint_name": "v1_update_user_profile"},
            {"method": "get", "endpoint_name": "get_reporting_year"},
            {"method": "put", "endpoint_name": "update_user_profile"},
        ],
        "industry_user": [
            {"method": "post", "endpoint_name": "v1_create_operator_and_user_operator"},
            {
                "method": "post",
                "endpoint_name": "v1_request_access",
                "kwargs": {"operator_id": mock_uuid},
            },
            {
                "method": "post",
                "endpoint_name": "v1_request_admin_access",
                "kwargs": {"operator_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_user_operator_access_declined",
                "kwargs": {"operator_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_pending_operator_and_user_operator",
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_current_user_operator_has_registered_operation",
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_current_user_operator_has_required_fields",
            },
            {
                "method": "get",
                "endpoint_name": "get_user_operator_access_declined",
                "kwargs": {"operator_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_pending_operator_and_user_operator",
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
                "kwargs": {"operator_id": mock_uuid},
            },
            {
                "method": "post",
                "endpoint_name": "request_admin_access",
                "kwargs": {"operator_id": mock_uuid},
            },
            {"method": "post", "endpoint_name": "create_operator_and_user_operator"},
        ],
        "approved_industry_admin_user": [
            {
                "method": "get",
                "endpoint_name": "v1_get_current_user_operator_access_requests",
            },
            {
                "method": "get",
                "endpoint_name": "get_current_user_operator_access_requests",
            },
        ],
        "authorized_irc_user": [
            {"method": "get", "endpoint_name": "v1_list_user_operators"},
            {"method": "get", "endpoint_name": "list_user_operators"},
            {"method": "get", "endpoint_name": "list_user_operators"},
            {"method": "get", "endpoint_name": "list_transfer_events"},
            {"method": "get", "endpoint_name": "get_transfer_event", "kwargs": {"transfer_id": mock_uuid}},
        ],
        "approved_authorized_roles": [
            {
                "method": "get",
                "endpoint_name": "get_operator",
                "kwargs": {"operator_id": mock_uuid},
            },
            {"method": "get", "endpoint_name": "v1_list_operations"},
            {
                "method": "get",
                "endpoint_name": "v1_get_operation",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_user_operator_by_id",
                "kwargs": {"user_operator_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "v1_get_contact",
                "kwargs": {"contact_id": mock_uuid},
            },
            {"method": "get", "endpoint_name": "v1_list_contacts"},
            {"method": "get", "endpoint_name": "list_operations"},
            {"method": "get", "endpoint_name": "list_contacts"},
            {
                "method": "get",
                "endpoint_name": "get_operation",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "list_facilities_by_operation_id",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "list_operation_representatives",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_user_operator_by_id",
                "kwargs": {"user_operator_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_facility",
                "kwargs": {"facility_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_contact",
                "kwargs": {"contact_id": mock_uuid},
            },
            {"method": "get", "endpoint_name": "get_registration_purposes"},
            {
                "method": "get",
                "endpoint_name": "get_operation_new_entrant_application",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_operation",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_operation_with_documents",
                "kwargs": {"operation_id": mock_uuid},
            },
            {"method": "get", "endpoint_name": "list_operations"},
            {"method": "get", "endpoint_name": "list_operators"},
            {
                "method": "get",
                "endpoint_name": "get_report_operation_by_version_id",
                "kwargs": {"version_id": mock_int},
            },
            {"method": "get", "endpoint_name": "build_form_schema"},
            {"method": "get", "endpoint_name": "get_dashboard_operations_list"},
            {
                "method": "get",
                "endpoint_name": "get_facility_report_form_data",
                "kwargs": {"version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_ordered_facility_report_activities",
                "kwargs": {"version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_facility_report_by_version_id",
                "kwargs": {"version_id": mock_int},
            },
            {
                "method": "get",
                "endpoint_name": "get_emission_summary_totals",
                "kwargs": {"version_id": mock_int, "facility_id": mock_uuid},
            },
            {
                "method": "get",
                "endpoint_name": "get_operation_emission_summary_totals",
                "kwargs": {"version_id": mock_int},
            },
        ],
        "authorized_irc_user_and_industry_admin_user": [],
        "cas_director": [
            {
                "method": "patch",
                "endpoint_name": "facility_bcghg_id",
                "kwargs": {"facility_id": mock_uuid},
            },
            {
                "method": "patch",
                "endpoint_name": "operation_boro_id",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "patch",
                "endpoint_name": "operation_bcghg_id",
                "kwargs": {"operation_id": mock_uuid},
            },
        ],
        "cas_director_analyst_and_industry_admin_user": [
            {
                "method": "put",
                "endpoint_name": "update_user_operator_status",
                "kwargs": {"user_operator_id": mock_uuid},
            },
        ],
        "v1_authorized_irc_user_write": [
            {
                "method": "put",
                "endpoint_name": "v1_update_operation_status",
                "kwargs": {"operation_id": mock_uuid},
            },
            {
                "method": "put",
                "endpoint_name": "v1_update_operator_status",
                "kwargs": {"operator_id": mock_uuid},
            },
        ],
        "v1_authorized_irc_user_and_industry_admin_user_write": [
            {
                "method": "put",
                "endpoint_name": "v1_update_user_operator_status",
                "kwargs": {"user_operator_id": mock_uuid},
            },
        ],
        "cas_analyst": [
            {"method": "post", "endpoint_name": "create_transfer_event"},
            {"method": "patch", "endpoint_name": "update_transfer_event", "kwargs": {"transfer_id": mock_uuid}},
            {"method": "delete", "endpoint_name": "delete_transfer_event", "kwargs": {"transfer_id": mock_uuid}},
        ],
    }

    @classmethod
    def _call_endpoint(cls, method, endpoint):
        client_method = getattr(cls.client, method)

        if method.lower() == "get":
            return client_method(endpoint)

        # For methods that require content_type and data
        return client_method(
            endpoint,
            content_type="application/json",
            data={},
        )

    @classmethod
    @patch("common.permissions.check_permission_for_role")
    def test_endpoint_permissions_by_role(
        cls,
        mock_check_permission_for_role: MagicMock,
    ):
        for role, configs in cls.endpoints_to_test.items():
            for config in configs:
                endpoint = custom_reverse_lazy(config["endpoint_name"], kwargs=config.get("kwargs", {}))
                method = config.get("method")
                cls._call_endpoint(method, endpoint)
                # Assert that the correct role check is called
                mock_check_permission_for_role.assert_called_once_with(ANY, role)
                # Reset mock after each subtest to isolate calls
                mock_check_permission_for_role.reset_mock()

    @classmethod
    def test_all_api_endpoints_are_permission_tested(cls):
        # these are the endpoints that we don't want to test
        exclusion_list = [
            "api-root",
            "openapi-json",
            "openapi-view",
            "setup",
            "v1_setup",
            # Below are endpoints that are accessible to all users so new users can be created
            "create_user_profile",
            "v1_create_user_profile",
            "get_user_profile",
            "v1_get_user_profile",
            "get_user_role",
            "v1_get_user_role",
            # TODO: Pending on the answer from Reporting Team
            "get_activities",
            "get_fuel_data",
        ]
        all_url_patterns = get_resolver().url_patterns[1].url_patterns  # index 1 is the API route
        valid_urls = [pattern.name for pattern in all_url_patterns if pattern.name not in exclusion_list]
        # Flatten endpoints_to_test to extract all endpoint names that are permission-tested
        tested_endpoints = {
            item["endpoint_name"] for role, configs in cls.endpoints_to_test.items() for item in configs
        }
        untested_endpoints = [url for url in valid_urls if url not in tested_endpoints]
        # Assert that all endpoints are tested; if not, raise an error with each endpoint on a new line
        assert not untested_endpoints, (
            f"The following endpoints (COUNT:{len(untested_endpoints)}) are not covered by permission tests:\n"
            + "\n".join(f"- {endpoint}" for endpoint in untested_endpoints)
        )
