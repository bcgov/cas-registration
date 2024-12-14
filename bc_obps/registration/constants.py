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
BUSINESS_STRUCTURE_TAGS = ["Business Structure V1"]
NAICS_CODE_TAGS = ["NAICS Code V1"]
OPERATION_TAGS = ["Operation V1"]
FACILITY_TAGS = ["Facility V1"]
OPERATOR_TAGS = ["Operator V1"]
REGULATED_PRODUCT_TAGS = ["Regulated Product V1"]
ACTIVITY_TAGS = ["Activity V1"]
USER_TAGS = ["User V1"]
SELECT_OPERATOR_TAGS = ["Select Operator V1"]
USER_OPERATOR_TAGS = ["User Operator V1"]
USER_OPERATOR_TAGS_V2 = ["User Operator V2"]
MISC_TAGS = ["Misc V1"]
CONTACT_TAGS = ["Contact V1"]
TRANSFER_EVENT_TAGS = ["Transfer Event V1"]
V2 = ["V2"]
OPERATOR_TAGS_V2 = ["Operator V2"]
