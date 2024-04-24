from enum import Enum


class IdPs(Enum):
    IDIR = "idir"
    BCEIDBUSINESS = "bceidbusiness"


class BoroIdApplicationStates(Enum):
    CONFIRMATION = "Confirmation"
    APPROVED = "Approved"
    DECLINED = "Declined"
    CHANGES_REQUESTED = "Changes Requested"


class BoroIdApplication:
    @staticmethod
    def generate_boro_id_application_template_name(application_state):
        return f"BORO ID Application {application_state}"
