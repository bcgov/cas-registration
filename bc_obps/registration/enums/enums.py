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
