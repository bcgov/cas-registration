from enum import Enum


class ComplianceTableNames(Enum):
    COMPLIANCE_PERIOD = "compliance_period"
    COMPLIANCE_SUMMARY = "compliance_summary"
    COMPLIANCE_OBLIGATION = "compliance_obligation"
    COMPLIANCE_PRODUCT = "compliance_product"
    ELICENSING_LINK = "elicensing_link"


class DjangoTableNames(Enum):
    DJANGO_CONTENT_TYPE = "django_content_type"
    PUBLIC_SCHEMA = "public"
