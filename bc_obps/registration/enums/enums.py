from enum import Enum


class IdPs(Enum):
    IDIR = "idir"
    BCEIDBUSINESS = "bceidbusiness"


class BoroIdApplicationStates(Enum):
    CHANGES_REQUESTED = "Changes Requested"
    CONFIRMATION = "Confirmation"
    APPROVED = "Approved"
    DECLINED = "Declined"


class BoroIdApplication:
    @staticmethod
    def generate_boro_id_application_template_name(application_state):
        return f"BORO ID Application {application_state}"


class AccessRequestStates(Enum):
    CONFIRMATION = "Confirmation"
    APPROVED = "Approved"
    DECLINED = "Declined"


class AccessRequestTypes(Enum):
    ADMIN = "Admin"
    OPERATOR_WITH_ADMIN = "Operator With Admin"
    NEW_OPERATOR_AND_ADMIN = "New Operator And Admin"


class OperatorAccessRequest:
    @staticmethod
    def generate_access_request_template_name(access_type, access_state):
        return f"{access_type} Access Request {access_state}"
