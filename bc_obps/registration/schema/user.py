from typing import Optional
from ninja import ModelSchema
from registration.models import AppRole, User
from .address import AddressSchema


class UserIn(ModelSchema):
    class Config:
        model = User
        model_fields = ["first_name", "last_name", "position_title", "email", "phone_number"]


class UserAppRoleOut(ModelSchema):
    class Config:
        model = AppRole
        model_fields = ['role_name']


class UserOut(ModelSchema):
    app_role: UserAppRoleOut  # Include AppRoleOut model as a field
    address: Optional[AddressSchema] = None

    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return
        return str(obj.phone_number)

    class Config:
        model = User
        model_fields = ["first_name", "last_name", "position_title", "email", "phone_number"]


class UserExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for fields from the User model that are needed in ExternalDashboardUsersTileData
    """

    class Config:
        model = User
        model_fields = ["first_name", "last_name", "email", "user_guid"]
