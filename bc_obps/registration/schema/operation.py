from uuid import UUID
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from typing import List, Optional, Literal
from registration.models.contact import Contact
from registration.schema import OperatorForOperationOut, MultipleOperatorIn, MultipleOperatorOut
from ninja import Field, ModelSchema, Schema
from typing import Any
from ninja import UploadedFile, File
from registration.models import MultipleOperator, Operation
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models import Operator, User
from ninja.types import DictStrAny
import json

from registration.schema.document import resolve_document


#### Operation schemas

# Registration schemas
class OperationRegistrationIn(ModelSchema):
    registration_purpose: Optional[Operation.Purposes] = None
    regulated_products: Optional[List[int]] = None
    activities: Optional[List[int]] = None
    naics_code_id: Optional[int] = None
    opt_in: Optional[bool] = False
    secondary_naics_code_id: Optional[int] = None
    tertiary_naics_code_id: Optional[int] = None
    multiple_operators_array: Optional[List[MultipleOperatorIn]] = None
    date_of_first_shipment: Optional[str] = None

    @staticmethod
    def resolve_multiple_operators_array(obj: Operation) -> Any | None:
        value = obj.get("multiple_operators_array", None)  # type: ignore[attr-defined]
        if not value or value == '[]':
            return None
        # If the multiple_operators_array comes directly from the frontend, it comes in as a string/json. If it comes from elsewhere (e.g., a backend service), it arrives as list
        if isinstance(value[0], str):
            return json.loads(value[0])
        else:
            return value

    class Meta:
        model = Operation
        fields = ["name", 'type']


class OperationRegistrationInWithDocuments(OperationRegistrationIn):
    boundary_map: Optional[UploadedFile] = File(None)
    process_flow_diagram: Optional[UploadedFile] = File(None)
    new_entrant_application: Optional[UploadedFile] = File(None)


class EioOperationRegistrationIn(ModelSchema):
    registration_purpose: Optional[Operation.Purposes] = None

    class Meta:
        model = Operation
        fields = ["name", 'type']


class OperationRegistrationOut(ModelSchema):
    operation: UUID = Field(..., alias="id")
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    secondary_naics_code_id: Optional[int] = Field(None, alias="secondary_naics_code.id")
    tertiary_naics_code_id: Optional[int] = Field(None, alias="tertiary_naics_code.id")
    multiple_operators_array: Optional[List[MultipleOperatorOut]] = None
    operation_has_multiple_operators: Optional[bool] = False
    boundary_map: Optional[str] = None
    process_flow_diagram: Optional[str] = None

    @staticmethod
    def resolve_boundary_map(obj: Operation) -> Optional[str]:
        return resolve_document(obj.get_boundary_map())

    @staticmethod
    def resolve_process_flow_diagram(obj: Operation) -> Optional[str]:
        return resolve_document(obj.get_process_flow_diagram())

    @staticmethod
    def resolve_operation_has_multiple_operators(obj: Operation) -> bool:
        if obj.multiple_operators.exists():
            return True
        return False

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


class OperationRepresentativeOut(ModelSchema):
    class Meta:
        model = Contact
        fields = ['id']


class OperationRepresentativeRemove(ModelSchema):
    id: int

    class Meta:
        model = Contact
        fields = ['id']


class OperationRepresentativeIn(ModelSchema):
    existing_contact_id: Optional[int] = None
    street_address: str
    municipality: str
    province: str
    postal_code: str

    class Meta:
        model = Contact
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'position_title']


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


class OperationRegistrationSubmissionIn(Schema):
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool


class OperationNewEntrantApplicationIn(Schema):
    # not using model schema because I wanted to enforce the date_of_first_shipment to be not null and to be a specific value
    date_of_first_shipment: Literal[
        Operation.DateOfFirstShipmentChoices.ON_OR_AFTER_APRIL_1_2024,
        Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
    ] = Field(...)


class OperationNewEntrantApplicationInWithDocuments(OperationNewEntrantApplicationIn):
    new_entrant_application: UploadedFile = File(None)


class OperationNewEntrantApplicationOut(ModelSchema):
    new_entrant_application: Optional[str] = None

    @staticmethod
    def resolve_new_entrant_application(obj: Operation) -> Optional[str]:
        return resolve_document(obj.get_new_entrant_application())

    class Meta:
        model = Operation
        fields = ['date_of_first_shipment']


class OperationNewEntrantApplicationRemove(ModelSchema):
    id: int

    class Meta:
        model = Operation
        fields = ['id']


# Administration schemas


class OperationAdministrationIn(OperationRegistrationIn):
    operation_representatives: List[int]


class OperationAdministrationInWithDocuments(OperationRegistrationInWithDocuments):
    operation_representatives: List[int]


class OperationAdministrationOut(ModelSchema):
    registration_purpose: Optional[str] = None
    operation: Optional[UUID] = Field(None, alias="id")
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    secondary_naics_code_id: Optional[int] = Field(None, alias="secondary_naics_code.id")
    tertiary_naics_code_id: Optional[int] = Field(None, alias="tertiary_naics_code.id")
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")
    operator: Optional[OperatorForOperationOut] = None
    multiple_operators_array: Optional[List[MultipleOperatorOut]] = None
    operation_has_multiple_operators: Optional[bool] = False
    opted_in_operation: Optional[OptedInOperationDetailOut] = None
    date_of_first_shipment: Optional[str] = None
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")
    operation_representatives: Optional[List[int]] = []
    boundary_map: Optional[str] = None
    process_flow_diagram: Optional[str] = None
    new_entrant_application: Optional[str] = None

    @staticmethod
    def resolve_boundary_map(obj: Operation) -> Optional[str]:
        return resolve_document(obj.get_boundary_map())

    @staticmethod
    def resolve_process_flow_diagram(obj: Operation) -> Optional[str]:
        return resolve_document(obj.get_process_flow_diagram())

    @staticmethod
    def resolve_new_entrant_application(obj: Operation) -> Optional[str]:
        return resolve_document(obj.get_new_entrant_application())

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


# Other


class OperationCurrentOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]


class OperationBoroIdOut(ModelSchema):
    class Meta:
        model = BcObpsRegulatedOperation
        fields = ['id']


class OperationBcghgIdOut(ModelSchema):
    class Meta:
        model = BcGreenhouseGasId
        fields = ['id']


class OperationListOut(ModelSchema):
    operator: str = Field(..., alias="operator.legal_name")
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")

    class Meta:
        model = Operation
        fields = ['id', 'name', 'submission_date', 'status']
        from_attributes = True


class OperationUpdateStatusOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "status"]
