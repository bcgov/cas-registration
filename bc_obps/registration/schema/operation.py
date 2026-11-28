import json
from uuid import UUID

from ninja import Field, ModelSchema, Schema
from ninja.types import DictStrAny
from registration.models import MultipleOperator, Operation, Operator, User
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from registration.models.contact import Contact
from registration.models.document import Document
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.schema import (
    MultipleOperatorIn,
    MultipleOperatorOut,
    OperatorForOperationOut,
)


def serialize_document(doc: Document | None) -> str | None:
    # Something similar to dataURL to allow passing metadata along with the filename.
    # Required because RJSF expects a string for a file field.
    if doc:
        # Document.file is non-nullable, so name is always set; django-stubs 6.0 types it as str | None.
        name = doc.file.name.split("/")[-1]  # type: ignore[union-attr]
        return json.dumps({"name": name, "id": doc.id, "status": doc.status})
    return None


#### Operation schemas


class OperationRegistrationOut(ModelSchema):
    operation: UUID = Field(..., alias="id")
    naics_code_id: int | None = Field(None, alias="naics_code.id")
    secondary_naics_code_id: int | None = Field(None, alias="secondary_naics_code.id")
    tertiary_naics_code_id: int | None = Field(None, alias="tertiary_naics_code.id")
    multiple_operators_array: list[MultipleOperatorOut] | None = []
    operation_has_multiple_operators: bool | None = False
    boundary_map: str | None = None
    process_flow_diagram: str | None = None

    @staticmethod
    def resolve_boundary_map(obj: Operation) -> str | None:
        return serialize_document(obj.get_boundary_map())

    @staticmethod
    def resolve_process_flow_diagram(obj: Operation) -> str | None:
        return serialize_document(obj.get_process_flow_diagram())

    @staticmethod
    def resolve_operation_has_multiple_operators(obj: Operation) -> bool:
        return obj.multiple_operators.exists()

    @staticmethod
    def resolve_multiple_operators_array(
        obj: Operation,
    ) -> list[MultipleOperator] | None:
        if obj.multiple_operators.exists():
            return [
                multiple_operator
                for multiple_operator in obj.multiple_operators.select_related(
                    "attorney_address"
                )
            ]
        return None

    class Meta:
        model = Operation
        fields = [
            "id",
            "name",
            "type",
            "registration_purpose",
            "regulated_products",
            "activities",
        ]


class OperationRepresentativeIn(ModelSchema):
    existing_contact_id: int | None = None
    street_address: str
    municipality: str
    province: str
    postal_code: str

    class Meta:
        model = Contact
        fields = ["first_name", "last_name", "email", "phone_number", "position_title"]


class OperationRepresentativeRemove(ModelSchema):
    class Meta:
        model = Contact
        fields = ["id"]


class OperationInformationIn(ModelSchema):
    registration_purpose: Operation.Purposes | None = None
    regulated_products: list[int] | None = None
    activities: list[int] | None = None
    naics_code_id: int | None = None
    secondary_naics_code_id: int | None = None
    tertiary_naics_code_id: int | None = None
    multiple_operators_array: list[MultipleOperatorIn] | None = None
    date_of_first_shipment: str | None = None

    class Meta:
        model = Operation
        fields = ["name", "type"]


class OperationInformationInUpdate(OperationInformationIn):
    operation_representatives: list[int]


class OptedInOperationDetailOut(ModelSchema):
    final_reporting_year: int | None = None

    @staticmethod
    def resolve_final_reporting_year(obj: OptedInOperationDetail) -> int | None:
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

    final_reporting_year: int | None = None


class OperationOut(ModelSchema):
    naics_code_id: int | None = Field(None, alias="naics_code.id")
    secondary_naics_code_id: int | None = Field(None, alias="secondary_naics_code.id")
    tertiary_naics_code_id: int | None = Field(None, alias="tertiary_naics_code.id")
    bc_obps_regulated_operation: str | None = Field(
        None, alias="bc_obps_regulated_operation.id"
    )
    operator: OperatorForOperationOut | None = None
    registration_purpose: str | None = None
    multiple_operators_array: list[MultipleOperatorOut] | None = []
    operation_has_multiple_operators: bool | None = False
    opted_in_operation: OptedInOperationDetailOut | None = None
    opted_out_operation: int | None = None
    date_of_first_shipment: str | None = None
    bcghg_id: str | None = Field(None, alias="bcghg_id.id")
    operation_representatives: list[int] | None = []

    @staticmethod
    def resolve_operation_representatives(obj: Operation) -> list[int]:
        return list(
            obj.contacts.filter(business_role="Operation Representative").values_list(
                "id", flat=True
            )
        )

    @staticmethod
    def resolve_multiple_operators_array(obj: Operation) -> list[MultipleOperator]:
        return list(obj.multiple_operators.all())

    @staticmethod
    def resolve_operation_has_multiple_operators(obj: Operation) -> bool:
        return obj.multiple_operators.exists()

    @staticmethod
    def resolve_operator(obj: Operation, context: DictStrAny) -> Operator | None:
        """
        Only return operator details if the user is an IRC user
        """
        request = context.get("request")
        if request:
            user: User = request.current_user
            if user.is_irc_user():
                return obj.operator
        return None

    @staticmethod
    def resolve_opted_out_operation(obj: Operation) -> int | None:
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
            "name",
            "type",
            "regulated_products",
            "status",
            "activities",
            "opted_in_operation",
        ]
        from_attributes = True


class OperationOutWithDocuments(OperationOut):
    boundary_map: str | None = None
    process_flow_diagram: str | None = None
    new_entrant_application: str | None = None

    @staticmethod
    def resolve_boundary_map(obj: Operation) -> str | None:
        return serialize_document(obj.get_boundary_map())

    @staticmethod
    def resolve_process_flow_diagram(obj: Operation) -> str | None:
        return serialize_document(obj.get_process_flow_diagram())

    @staticmethod
    def resolve_new_entrant_application(obj: Operation) -> str | None:
        return serialize_document(obj.get_new_entrant_application())


class OperationUpdateOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]


class OperationCurrentOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]


class OperationRegistrationSubmissionIn(Schema):
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool


class OperationNewEntrantApplicationOut(ModelSchema):
    new_entrant_application: str | None = None

    @staticmethod
    def resolve_new_entrant_application(obj: Operation) -> str | None:
        return serialize_document(obj.get_new_entrant_application())

    class Meta:
        model = Operation
        fields = ["date_of_first_shipment"]


class OperationRepresentativeOut(ModelSchema):
    class Meta:
        model = Contact
        fields = ["id"]


class OperationBoroIdOut(ModelSchema):
    class Meta:
        model = BcObpsRegulatedOperation
        fields = ["id"]


class OperationUpdateStatusOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "status"]


class OperationReportableOut(Schema):
    operation_id: UUID
    operation_name: str
    reporting_year: int
    registration_purposes: list[str]
