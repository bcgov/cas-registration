from ninja import ModelSchema, Schema
from registration.models import AppRole, User
from .address import AddressSchema


class UserIn(Schema):
    first_name: str
    last_name: str
    email: str
    position_title: str
    phone_number: str


class UserAppRoleOut(ModelSchema):
    class Config:
        model = AppRole
        model_fields = ['role_name']


class UserOut(ModelSchema):
    app_role: UserAppRoleOut  # Include AppRoleOut model as a field
    address: AddressSchema

    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return
        return obj.phone_number.as_e164

    class Config:
        model = User
        model_fields = ["first_name", "last_name", "position_title", "email", "phone_number", "app_role", "address"]
