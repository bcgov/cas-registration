from uuid import UUID
from typing import List, Optional, Union
from ninja import Field, FilterSchema, ModelSchema, Schema
<<<<<<< HEAD
from registration.models import Operation
from service.data_access_service.facility_service import FacilityDataAccessService
from registration.enums.enums import OperationTypes
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.registration_purpose import RegistrationPurpose
=======
from registration.models import Operation, Operator, User
>>>>>>> c9f5644f4 (refactor: create new get api for statutory declarations)
from pydantic import field_validator
from django.core.files.base import ContentFile
from registration.utils import data_url_to_file
from ninja.types import DictStrAny
from registration.schema.v1.operator import OperatorForOperationOut
from registration.utils import file_to_data_url


#### Operation schemas


class RegistrationPurposeIn(ModelSchema):
    registration_purpose: RegistrationPurpose.Purposes
    regulated_products: Optional[list] = None

    class Meta:
        model = RegistrationPurpose
        fields = ["registration_purpose"]


class OperationUpdateOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ['id', 'name']


class OperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = None
    name: Optional[str] = None
    operator: Optional[str] = None
    type: Optional[str] = None
    page: Union[int, float, str] = 1
    sort_field: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"


class OperationListOut(ModelSchema):
    operator: str = Field(..., alias="operator.legal_name")
    sfo_facility_id: Optional[UUID] = None

    class Config:
        model = Operation
        model_fields = [
            'id',
            'name',
            'bcghg_id',
            'type',
        ]
        from_attributes = True

    @staticmethod
    def resolve_sfo_facility_id(obj: Operation) -> Optional[UUID]:
        # Resolve a single facility id for SFO operations
        facilities = FacilityDataAccessService.get_current_facilities_by_operation(obj)
        if obj.type == OperationTypes.SFO.value and facilities:
            first_facility = facilities.first()
            if first_facility:
                return first_facility.pk
        return None


class OperationPaginatedOut(Schema):
    data: List[OperationListOut]
    row_count: int


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
    
class OperationOut(ModelSchema):
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    first_name: Optional[str] = Field(None, alias="point_of_contact.first_name")
    last_name: Optional[str] = Field(None, alias="point_of_contact.last_name")
    email: Optional[str] = Field(None, alias="point_of_contact.email")
    phone_number: Optional[str] = None  # can't use resolvers with aliases, so handling everything in the resolver
    position_title: Optional[str] = Field(None, alias="point_of_contact.position_title")
    street_address: Optional[str] = Field(None, alias="point_of_contact.address.street_address")
    municipality: Optional[str] = Field(None, alias="point_of_contact.address.municipality")
    province: Optional[str] = Field(None, alias="point_of_contact.address.province")
    postal_code: Optional[str] = Field(None, alias="point_of_contact.address.postal_code")
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")
    bcghg_id: Optional[str] = None
    operator: Optional[OperatorForOperationOut] = None

    @staticmethod
    def resolve_bcghg_id(obj: Operation) -> str:
        return obj.bcghg_id or ""

    @staticmethod
    def resolve_phone_number(obj: Operation) -> Optional[str]:
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.point_of_contact:
            return None
        return str(obj.point_of_contact.phone_number)

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

    class Config:
        model = Operation
        model_fields = [
            "id",
            'name',
            'type',
            'opt_in',
            'regulated_products',
            'status',
        ]
        from_attributes = True


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
