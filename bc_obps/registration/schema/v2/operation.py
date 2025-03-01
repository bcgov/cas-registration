from uuid import UUID
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from typing import List, Optional, Literal
from registration.schema.v1.multiple_operator import MultipleOperatorOut
from registration.models.contact import Contact
from registration.schema.v1.operator import OperatorForOperationOut
from registration.schema.v2.multiple_operator import MultipleOperatorIn
from ninja import Field, ModelSchema, Schema
from registration.models import MultipleOperator, Operation
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from pydantic import field_validator
from django.core.files.base import ContentFile
from registration.utils import data_url_to_file
from registration.utils import file_to_data_url
from registration.models import Operator, User
from ninja.types import DictStrAny

#### Operation schemas


class OperationRegistrationOut(ModelSchema):
    operation: UUID = Field(..., alias="id")
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    secondary_naics_code_id: Optional[int] = Field(None, alias="secondary_naics_code.id")
    tertiary_naics_code_id: Optional[int] = Field(None, alias="tertiary_naics_code.id")
    multiple_operators_array: Optional[List[MultipleOperatorOut]] = []
    operation_has_multiple_operators: Optional[bool] = False
    boundary_map: Optional[str] = None
    process_flow_diagram: Optional[str] = None

    @staticmethod
    def resolve_boundary_map(obj: Operation) -> Optional[str]:
        boundary_map = obj.get_boundary_map()
        if boundary_map:
            return boundary_map.filename
        return None

    @staticmethod
    def resolve_process_flow_diagram(obj: Operation) -> Optional[str]:
        process_flow_diagram = obj.get_process_flow_diagram()
        if process_flow_diagram:
            return process_flow_diagram.filename
        return None

    @staticmethod
    def resolve_multiple_operators_array(obj: Operation) -> Optional[List[MultipleOperator]]:
        if obj.multiple_operators.exists():
            return [
                multiple_operator for multiple_operator in obj.multiple_operators.select_related("attorney_address")
            ]
        return None

    class Meta:
        model = Operation
        fields = ["name", 'type', 'registration_purpose', 'regulated_products', 'activities']


class OperationRepresentativeIn(ModelSchema):
    existing_contact_id: Optional[int] = None
    street_address: str
    municipality: str
    province: str
    postal_code: str

    class Meta:
        model = Contact
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'position_title']


class OperationRepresentativeRemove(ModelSchema):
    id: int

    class Meta:
        model = Contact
        fields = ['id']


class OperationInformationIn(ModelSchema):
    name: str
    registration_purpose: Optional[Operation.Purposes] = None
    regulated_products: Optional[List[int]] = None
    activities: Optional[List[int]] = None
    boundary_map: Optional[str] = None
    process_flow_diagram: Optional[str] = None
    naics_code_id: Optional[int] = None
    opt_in: Optional[bool] = False
    secondary_naics_code_id: Optional[int] = None
    tertiary_naics_code_id: Optional[int] = None
    multiple_operators_array: Optional[List[MultipleOperatorIn]] = None
    date_of_first_shipment: Optional[str] = Field(None, alias="date_of_first_shipment")
    new_entrant_application: Optional[str] = None

    @field_validator("boundary_map")
    @classmethod
    def validate_boundary_map(cls, value: str) -> ContentFile:
      
        return int(value)

    @field_validator("process_flow_diagram")
    @classmethod
    def validate_process_flow_diagram(cls, value: str) -> ContentFile:
        return int(value)

    @field_validator("new_entrant_application")
    @classmethod
    def validate_new_entrant_application(cls, value: Optional[str]) -> Optional[ContentFile]:
        if value:
            return int(value)
        return None

    class Meta:
        model = Operation
        fields = ["name", 'type']


class OperationInformationInUpdate(OperationInformationIn):
    operation_representatives: List[int]


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


class OperationOutV2(ModelSchema):
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    secondary_naics_code_id: Optional[int] = Field(None, alias="secondary_naics_code.id")
    tertiary_naics_code_id: Optional[int] = Field(None, alias="tertiary_naics_code.id")
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")
    operator: Optional[OperatorForOperationOut] = None
    boundary_map: Optional[str] = None
    process_flow_diagram: Optional[str] = None
    registration_purpose: Optional[str] = None
    multiple_operators_array: Optional[List[MultipleOperatorOut]] = []
    operation_has_multiple_operators: Optional[bool] = False
    opted_in_operation: Optional[OptedInOperationDetailOut] = None
    date_of_first_shipment: Optional[str] = None
    new_entrant_application: Optional[str] = None
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")
    operation_representatives: Optional[List[int]] = []

    @staticmethod
    def resolve_operation_representatives(obj: Operation) -> List[int]:
        return list(obj.contacts.filter(business_role='Operation Representative').values_list('id', flat=True))

    @staticmethod
    def resolve_multiple_operators_array(obj: Operation) -> List[MultipleOperator]:
        return list(obj.multiple_operators.all())

    @staticmethod
    def resolve_operation_has_multiple_operators(obj: Operation) -> bool:
        return obj.multiple_operators.exists()

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

    class Meta:
        model = Operation
        fields = [
            "id",
            'name',
            'type',
            'opt_in',
            'regulated_products',
            'status',
            'activities',
            'opted_in_operation',
        ]
        from_attributes = True


class OperationOutWithDocuments(OperationOutV2):
    @staticmethod
    def resolve_boundary_map(obj: Operation) -> Optional[str]:
        boundary_map = obj.get_boundary_map()
        breakpoint()
        if boundary_map:
            return file_to_data_url(boundary_map)
        return None

    @staticmethod
    def resolve_process_flow_diagram(obj: Operation) -> Optional[str]:
        process_flow_diagram = obj.get_process_flow_diagram()
        if process_flow_diagram:
            return file_to_data_url(process_flow_diagram)
        return None

    @staticmethod
    def resolve_new_entrant_application(obj: Operation) -> Optional[str]:
        new_entrant_application = obj.get_new_entrant_application()
        if new_entrant_application:
            return file_to_data_url(new_entrant_application)
        return None


class OperationCreateOut(ModelSchema):
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")

    class Config:
        model = Operation
        model_fields = ['id', 'name', 'type', 'naics_code', 'opt_in', 'regulated_products']
        populate_by_name = True


class OperationUpdateOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ['id', 'name']


class OperationCurrentOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]


class OperationRegistrationSubmissionIn(Schema):
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool


class OperationNewEntrantApplicationIn(Schema):
    new_entrant_application: str
    # not using model schema because I wanted to enforce the date_of_first_shipment to be not null and to be a specific value
    date_of_first_shipment: Literal[
        Operation.DateOfFirstShipmentChoices.ON_OR_AFTER_APRIL_1_2024,
        Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
    ] = Field(...)

    @field_validator("new_entrant_application")
    @classmethod
    def validate_new_entrant_application(cls, value: str) -> ContentFile:
        return data_url_to_file(value)


class OperationNewEntrantApplicationOut(ModelSchema):
    new_entrant_application: Optional[str] = None

    @staticmethod
    def resolve_new_entrant_application(obj: Operation) -> Optional[str]:
        new_entrant_application = obj.get_new_entrant_application()
        if new_entrant_application:
            return file_to_data_url(new_entrant_application)
        return None

    class Meta:
        model = Operation
        fields = ['date_of_first_shipment']


class OperationNewEntrantApplicationRemove(ModelSchema):
    id: int

    class Meta:
        model = Operation
        fields = ['id']


class OperationRepresentativeOut(ModelSchema):
    class Meta:
        model = Contact
        fields = ['id']


class OperationBoroIdOut(ModelSchema):
    class Meta:
        model = BcObpsRegulatedOperation
        fields = ['id']


class OperationBcghgIdOut(ModelSchema):
    class Meta:
        model = BcGreenhouseGasId
        fields = ['id']
