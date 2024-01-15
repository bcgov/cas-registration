UNAUTHORIZED_MESSAGE = "Unauthorized."

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

BORO_ID_REGEX = r"^\d{2}-\d{4}$"
