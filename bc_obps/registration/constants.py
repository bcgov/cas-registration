UNAUTHORIZED_MESSAGE = "Unauthorized."
BASE_ENDPOINT = "/api/registration/"
DEFAULT_API_NAMESPACE = "api-1.0.0"

BC_CORPORATE_REGISTRY_REGEX = r"^[A-Za-z]{1,3}[0-9]{7}$"
BC_CORPORATE_REGISTRY_REGEX_MESSAGE = "BC Corporate Registry Number should be 1-3 letters followed by 7 digits."

CRA_BUSINESS_NUMBER_MESSAGE = "CRA Business Number should be 9 digits."

BORO_ID_REGEX = r"^\d{2}-\d{4}$"
BCGHG_ID_REGEX = r"^[1-2]\d{10}$"

USER_CACHE_PREFIX = "user_cache_"

PAGE_SIZE = 20


# API Tags
BUSINESS_STRUCTURE_TAGS = ["Business Structure"]
NAICS_CODE_TAGS = ["NAICS Code"]
OPERATION_TAGS = ["Operation"]
FACILITY_TAGS = ["Facility"]
OPERATOR_TAGS = ["Operator"]
REGULATED_PRODUCT_TAGS = ["Regulated Product"]
ACTIVITY_TAGS = ["Activity"]
USER_TAGS = ["User"]
USER_OPERATOR_TAGS = ["User Operator"]
MISC_TAGS = ["Misc"]
CONTACT_TAGS = ["Contact"]
TRANSFER_EVENT_TAGS = ["Transfer Event"]
