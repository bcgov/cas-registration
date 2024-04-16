from enum import Enum


class AdminAccessRequestStates(Enum):
    CONFIRMATION = "Confirmation"
    APPROVED = "Approved"
    DECLINED = "Declined"
