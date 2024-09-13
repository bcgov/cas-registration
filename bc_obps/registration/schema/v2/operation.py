from uuid import UUID
from typing import List, Optional
from registration.schema.validators import validate_document
from registration.schema.v1.operator import OperatorForOperationOut
from registration.schema.v1.contact import ContactIn
from registration.schema.v2.multiple_operator import MultipleOperatorIn
from ninja import Field, FilterSchema, ModelSchema, Schema
from registration.models import Operation
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.registration_purpose import RegistrationPurpose
from pydantic import field_validator
from django.core.files.base import ContentFile
from registration.utils import data_url_to_file
from registration.utils import file_to_data_url
from registration.models import Operator, User
from ninja.types import DictStrAny

#### Operation schemas


class RegistrationPurposeIn(ModelSchema):
    registration_purpose: RegistrationPurpose.Purposes
    regulated_products: Optional[list] = None

    class Meta:
        model = RegistrationPurpose
        fields = ["registration_purpose"]


class OperationRepresentativeIn(Schema):
    operation_representatives: Optional[List[int]] = []
    new_operation_representatives: Optional[List[ContactIn]] = []


class OperationInformationIn(RegistrationPurposeIn, ModelSchema):
    activities: list[int]
    boundary_map: str
    process_flow_diagram: str
    equipment_list: str
    naics_code_id: int
    secondary_naics_code_id: Optional[int] = None
    tertiary_naics_code_id: Optional[int] = None
    multiple_operators_array: Optional[List[MultipleOperatorIn]] = None

    @field_validator("boundary_map")
    @classmethod
    def validate_boundary_map(cls, value: str) -> ContentFile:
        return data_url_to_file(value)

    @field_validator("process_flow_diagram")
    @classmethod
    def validate_process_flow_diagram(cls, value: str) -> ContentFile:
        return data_url_to_file(value)

    @field_validator("equipment_list")
    @classmethod
    def validate_equipment_list(cls, value: str) -> ContentFile:
        return data_url_to_file(value)

    class Meta:
        model = Operation
        fields = ["name", 'type']


class OperationOutV2(ModelSchema):
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    secondary_naics_code_id: Optional[int] = Field(None, alias="secondary_naics_code.id")
    tertiary_naics_code_id: Optional[int] = Field(None, alias="tertiary_naics_code.id")
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")
    operator: Optional[OperatorForOperationOut] = None
    boundary_map: Optional[str] = None
    process_flow_diagram: Optional[str] = None
    equipment_list: Optional[str] = None
    multiple_operators_array: Optional[List[MultipleOperatorIn]] = None
    registration_purposes: Optional[list] = []

    @staticmethod
    def resolve_registration_purposes(obj: Operation) -> List[str]:
        return list(obj.registration_purposes.all().values_list('registration_purpose', flat=True))

    @staticmethod
    def resolve_operator(obj: Operation, context: DictStrAny) -> Optional[Operator]:
        """
        Only return operator details if the user is an IRC user
        """
        request = context.get('request')
        if request:
            user: User = request.current_user
            if user.is_irc_user():
                return obj.operator
        return None

    @field_validator("boundary_map")
    @classmethod
    def validate_boundary_map(cls, value: str) -> Optional[ContentFile]:
        return validate_document(value)

    @field_validator("process_flow_diagram")
    @classmethod
    def validate_process_flow_diagram(cls, value: str) -> Optional[ContentFile]:
        return validate_document(value)

    @field_validator("equipment_list")
    @classmethod
    def validate_equipment_list(cls, value: str) -> Optional[ContentFile]:
        return validate_document(value)

    class Meta:
        model = Operation
        fields = ["id", 'name', 'type', 'opt_in', 'regulated_products', 'status', 'activities']
        from_attributes = True


class OperationCreateOut(ModelSchema):
    class Config:
        model = Operation
        model_fields = ['id', 'name', 'type', 'naics_code', 'opt_in', 'regulated_products', 'bcghg_id']
        populate_by_name = True


class OperationUpdateOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ['id', 'name']


class OperationFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by related fields but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'bcghg_id__icontains'})
    name: Optional[str] = Field(None, json_schema_extra={'q': 'name__icontains'})
    type: Optional[str] = Field(None, json_schema_extra={'q': 'type__icontains'})
    status: Optional[str] = Field(None, json_schema_extra={'q': 'status__icontains'})
    bc_obps_regulated_operation: Optional[str] = Field(
        None, json_schema_extra={'q': 'bc_obps_regulated_operation__id__icontains'}
    )


class OperationListOut(ModelSchema):
    operator: str = Field(..., alias="operator.legal_name")
    sfo_facility_id: Optional[UUID] = Field(None, alias="sfo_facility_id")  # this is an annotated field in the query

    class Meta:
        model = Operation
        fields = [
            'id',
            'name',
            'bcghg_id',
            'type',
            'status',
            'bc_obps_regulated_operation',
        ]


class OperationCurrentOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]


class OperationRegistrationSubmissionIn(Schema):
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool


class OptedInOperationDetailOut(ModelSchema):
    class Meta:
        model = OptedInOperationDetail
        fields = [
            "meets_section_3_emissions_requirements",
            "meets_electricity_import_operation_criteria",
            "meets_entire_operation_requirements",
            "meets_section_6_emissions_requirements",
            "meets_naics_code_11_22_562_classification_requirements",
            "meets_producing_gger_schedule_a1_regulated_product",
            "meets_reporting_and_regulated_obligations",
            "meets_notification_to_director_on_criteria_change",
        ]


class OptedInOperationDetailIn(OptedInOperationDetailOut):
    meets_section_3_emissions_requirements: bool = Field(...)
    meets_electricity_import_operation_criteria: bool = Field(...)
    meets_entire_operation_requirements: bool = Field(...)
    meets_section_6_emissions_requirements: bool = Field(...)
    meets_naics_code_11_22_562_classification_requirements: bool = Field(...)
    meets_producing_gger_schedule_a1_regulated_product: bool = Field(...)
    meets_reporting_and_regulated_obligations: bool = Field(...)
    meets_notification_to_director_on_criteria_change: bool = Field(...)


class OperationStatutoryDeclarationIn(Schema):
    statutory_declaration: str

    @field_validator("statutory_declaration")
    @classmethod
    def validate_statutory_declaration(cls, value: str) -> ContentFile:
        return data_url_to_file(value)


class OperationStatutoryDeclarationOut(ModelSchema):
    statutory_declaration: Optional[str] = None

    @staticmethod
    def resolve_statutory_declaration(obj: Operation) -> Optional[str]:
        statutory_declaration = obj.get_statutory_declaration()
        if statutory_declaration:
            return file_to_data_url(statutory_declaration)
        return None

    class Meta:
        model = Operation
        fields = ['id', 'name']
