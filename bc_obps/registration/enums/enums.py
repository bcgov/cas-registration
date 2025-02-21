from enum import Enum


class IdPs(Enum):
    IDIR = "idir"
    BCEIDBUSINESS = "bceidbusiness"


class BoroIdApplicationStates(Enum):
    CONFIRMATION = "Confirmation"
    APPROVED = "Approved"
    DECLINED = "Declined"
    CHANGES_REQUESTED = "Changes Requested"


class AccessRequestStates(Enum):
    CONFIRMATION = "Confirmation"
    APPROVED = "Approved"
    DECLINED = "Declined"


class AccessRequestTypes(Enum):
    ADMIN = "Admin"
    OPERATOR_WITH_ADMIN = "Operator With Admin"
    NEW_OPERATOR_AND_ADMIN = "New Operator And Admin"


class OperationTypes(Enum):
    LFO = "Linear Facilities Operation"
    SFO = "Single Facility Operation"
    EIO = "Electricity Import Operation"


class RegistrationTableNames(Enum):
    ACTIVITY = "activity"
    ADDRESS = "address"
    APP_ROLE = "app_role"
    BC_GREENHOUSE_GAS_ID = "bc_greenhouse_gas_id"
    BC_OBPS_REGULATED_OPERATION = "bc_obps_regulated_operation"
    BUSINESS_ROLE = "business_role"
    BUSINESS_STRUCTURE = "business_structure"
    CONTACT = "contact"
    DOCUMENT = "document"
    DOCUMENT_TYPE = "document_type"
    FACILITY = "facility"
    FACILITY_DESIGNATED_OPERATION_TIMELINE = "facility_designated_operation_timeline"
    MULTIPLE_OPERATOR = "multiple_operator"
    NAICS_CODE = "naics_code"
    OPERATION = "operation"
    OPERATION_DESIGNATED_OPERATOR_TIMELINE = "operation_designated_operator_timeline"
    OPERATOR = "operator"
    OPTED_IN_OPERATION_DETAIL = "opted_in_operation_detail"
    PARENT_OPERATOR = "parent_operator"
    PARTNER_OPERATOR = "partner_operator"
    REGULATED_PRODUCT = "regulated_product"
    USER = "user"
    USER_OPERATOR = "user_operator"
    WELL_AUTHORIZATION_NUMBER = "well_authorization_number"
    CLOSURE_EVENT = "closure_event"
    RESTART_EVENT = "restart_event"
    TEMPORARY_SHUTDOWN_EVENT = "temporary_shutdown_event"
    TRANSFER_EVENT = "transfer_event"
    # M2M tables
    FACILITY_WELL_AUTHORIZATION_NUMBERS = "facility_well_authorization_numbers"
    OPERATION_CONTACTS = "operation_contacts"
    OPERATION_REGULATED_PRODUCTS = "operation_regulated_products"
    OPERATION_ACTIVITIES = "operation_activities"
    CLOSURE_EVENT_FACILITIES = "closure_event_facilities"
    RESTART_EVENT_FACILITIES = "restart_event_facilities"
    TEMPORARY_SHUTDOWN_EVENT_FACILITIES = "temporary_shutdown_event_facilities"
    TRANSFER_EVENT_FACILITIES = "transfer_event_facilities"
