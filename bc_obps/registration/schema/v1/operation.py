from typing import Optional, Union
from registration.schema.v1.operator import OperatorForOperationOut
from registration.utils import file_to_data_url
from ninja import Field, FilterSchema, ModelSchema
from registration.models import Operation, Operator, User
from ninja.types import DictStrAny


class OperationOut(ModelSchema):
    statutory_declaration: Optional[str] = None
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
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")
    operator: Optional[OperatorForOperationOut] = None

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

    @staticmethod
    def resolve_statutory_declaration(obj: Operation) -> Optional[str]:
        statutory_declaration = obj.get_statutory_declaration()
        if statutory_declaration:
            return file_to_data_url(statutory_declaration)
        return None

    class Meta:
        model = Operation
        fields = ["id", 'name', 'type', 'opt_in', 'regulated_products', 'status']
        from_attributes = True


class OperationUpdateStatusOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "status"]

class OperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = None
    bc_obps_regulated_operation: Optional[str] = None
    name: Optional[str] = None
    operator: Optional[str] = None
    status: Optional[str] = None
    page: Union[int, float, str] = 1
    sort_field: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"
