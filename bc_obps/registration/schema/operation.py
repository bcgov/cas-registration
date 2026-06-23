import json
from uuid import UUID
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from typing import List, Optional
from registration.models.contact import Contact
from registration.models.document import Document
from registration.schema import OperatorForOperationOut, MultipleOperatorIn, MultipleOperatorOut
from ninja import Field, ModelSchema, Schema
from registration.models import MultipleOperator, Operation
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from pydantic import ConfigDict
from registration.models import Operator, User
from ninja.types import DictStrAny


def serialize_document(doc: Document | None) -> Optional[str]:
    # Something similar to dataURL to allow passing metadata along with the filename.
    # Required because RJSF expects a string for a file field.
    if doc:
        name = doc.file.name.split('/')[-1]
        return json.dumps({"name": name, "id": doc.id, "status": doc.status})
    return None


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
        return serialize_document(obj.get_boundary_map())

    @staticmethod
    def resolve_process_flow_diagram(obj: Operation) -> Optional[str]:
        return serialize_document(obj.get_process_flow_diagram())

    @staticmethod
    def resolve_operation_has_multiple_operators(obj: Operation) -> bool:
        return obj.multiple_operators.exists()

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


class OperationInformationIn(Schema):
    name: str
    type: str
    registration_purpose: Optional[Operation.Purposes] = None
    regulated_products: Optional[List[int]] = None
    activities: Optional[List[int]] = None
    naics_code_id: Optional[int] = None
    secondary_naics_code_id: Optional[int] = None
    tertiary_naics_code_id: Optional[int] = None
    multiple_operators_array: Optional[List[MultipleOperatorIn]] = None
    date_of_first_shipment: Optional[str] = None


class OperationInformationInUpdate(OperationInformationIn):
    operation_representatives: List[int]


class OptedInOperationDetailOut(ModelSchema):
    final_reporting_year: Optional[int] = None

    @staticmethod
    def resolve_final_reporting_year(obj: OptedInOperationDetail) -> Optional[int]:
        """
        Extract the year integer from the final_reporting_year ForeignKey.
        """
        return obj.final_reporting_year_id

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


class OptedOutOperationDetailIn(Schema):
    """Schema for updating final_reporting_year only.
    Accepts final_reporting_year as an integer from the frontend."""

    final_reporting_year: Optional[int] = None


class OperationOut(ModelSchema):
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    secondary_naics_code_id: Optional[int] = Field(None, alias="secondary_naics_code.id")
    tertiary_naics_code_id: Optional[int] = Field(None, alias="tertiary_naics_code.id")
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")
    operator: Optional[OperatorForOperationOut] = None
    registration_purpose: Optional[str] = None
    multiple_operators_array: Optional[List[MultipleOperatorOut]] = []
    operation_has_multiple_operators: Optional[bool] = False
    opted_in_operation: Optional[OptedInOperationDetailOut] = None
    opted_out_operation: Optional[int] = None
    date_of_first_shipment: Optional[str] = None
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

    @staticmethod
    def resolve_opted_out_operation(obj: Operation) -> Optional[int]:
        """
        Extract final_reporting_year from opted_in_operation to use as opted_out_operation
        """
        if obj.opted_in_operation:
            return obj.opted_in_operation.final_reporting_year_id
        return None

    class Meta:
        model = Operation
        fields = [
            "id",
            'name',
            'type',
            'regulated_products',
            'status',
            'activities',
            'opted_in_operation',
        ]
        from_attributes = True


class OperationOutWithDocuments(OperationOut):
    boundary_map: Optional[str] = None
    process_flow_diagram: Optional[str] = None
    new_entrant_application: Optional[str] = None

    @staticmethod
    def resolve_boundary_map(obj: Operation) -> Optional[str]:
        return serialize_document(obj.get_boundary_map())

    @staticmethod
    def resolve_process_flow_diagram(obj: Operation) -> Optional[str]:
        return serialize_document(obj.get_process_flow_diagram())

    @staticmethod
    def resolve_new_entrant_application(obj: Operation) -> Optional[str]:
        return serialize_document(obj.get_new_entrant_application())


class OperationCreateOut(ModelSchema):
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")

    model_config = ConfigDict(populate_by_name=True)

    class Meta:
        model = Operation
        fields = ['id', 'name', 'type', 'naics_code', 'regulated_products']


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


class OperationNewEntrantApplicationOut(ModelSchema):
    new_entrant_application: Optional[str] = None

    @staticmethod
    def resolve_new_entrant_application(obj: Operation) -> Optional[str]:
        return serialize_document(obj.get_new_entrant_application())

    class Meta:
        model = Operation
        fields = ['date_of_first_shipment']


class OperationRepresentativeOut(ModelSchema):
    class Meta:
        model = Contact
        fields = ['id']


class OperationBoroIdOut(ModelSchema):
    class Meta:
        model = BcObpsRegulatedOperation
        fields = ['id']


class OperationUpdateStatusOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "status"]


class OperationReportableOut(Schema):
    operation_id: UUID
    operation_name: str
    reporting_year: int
    registration_purposes: list[str]
