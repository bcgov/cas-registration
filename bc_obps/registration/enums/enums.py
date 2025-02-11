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
    LFO = "Linear Facility Operation"
    SFO = "Single Facility Operation"
    EIO = "Electricity Import Operation"


class RegistrationTableNames(Enum):
    ADDRESS = "address"
    APP_ROLE = "app_role"
    BUSINESS_ROLE = "business_role"
    BUSINESS_STRUCTURE = "business_structure"
    CONTACT = "contact"
    CONTACT_DOCUMENTS = "contact_documents"
    DOCUMENT = "document"
    DOCUMENT_TYPE = "document_type"
    OPERATION = "operation"
    OPERATOR = "operator"
    OPERATION_CONTACTS = "operation_contacts"
    OPERATOR_CONTACTS = "operator_contacts"
    # Add more table names as needed
