from django.core.files.base import ContentFile
from ninja import Schema
from pydantic import field_validator
from registration.utils import data_url_to_file


class ReportAttachmentsIn(Schema):
    verification_statement: str
    wci_352_362: str
    additional_reportable_information: str
    confidentiality_request: str

    # Applies the field validator to all fields in the model
    @field_validator("*")
    @classmethod
    def validate_file(cls, value: str) -> ContentFile:
        return data_url_to_file(value)
