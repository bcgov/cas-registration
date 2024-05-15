UNAUTHORIZED_MESSAGE = "Unauthorized."
BASE_ENDPOINT = "/api/registration/"
DEFAULT_API_NAMESPACE = "api-1.0.0"

# Used to exclude audit fields from the schema
AUDIT_FIELDS = [
    "created_at",
    "created_by",
    "updated_at",
    "updated_by",
    "archived_at",
    "archived_by",
]

BC_CORPORATE_REGISTRY_REGEX = r"^[A-Za-z]{1,3}[0-9]{7}$"
BC_CORPORATE_REGISTRY_REGEX_MESSAGE = "BC Corporate Registry Number should be 1-3 letters followed by 7 digits."

CRA_BUSINESS_NUMBER_MESSAGE = "CRA Business Number should be 9 digits."

BORO_ID_REGEX = r"^\d{2}-\d{4}$"

USER_CACHE_PREFIX = "user_cache_"

PAGE_SIZE = 20


# API Tags
BUSINESS_STRUCTURE_TAGS = ["Business Structure V1"]
NAICS_CODE_TAGS = ["NAICS Code V1"]
OPERATION_TAGS = ["Operation V1"]
OPERATOR_TAGS = ["Operator V1"]
REGULATED_PRODUCT_TAGS = ["Regulated Product V1"]
REPORTING_ACTIVITY_TAGS = ["Reporting Activity V1"]
USER_TAGS = ["User V1"]
SELECT_OPERATOR_TAGS = ["Select Operator V1"]
USER_OPERATOR_TAGS = ["User Operator V1"]
MISC_TAGS = ["Misc V1"]
