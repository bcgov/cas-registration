from typing import Optional
from ninja import Field, ModelSchema
from registration.models import AppRole, User


class UserIn(ModelSchema):
    identity_provider: str

    class Config:
        model = User
        model_fields = [
            "first_name",
            "last_name",
            "position_title",
            "email",
            "phone_number",
            "bceid_business_name",
            "business_guid",
        ]


class UserUpdateIn(ModelSchema):
    class Config:
        model = User
        model_fields = ["first_name", "last_name", "position_title", "phone_number"]


class UserAppRoleOut(ModelSchema):
    class Config:
        model = AppRole
        model_fields = ['role_name']


class UserOut(ModelSchema):
    app_role: UserAppRoleOut = Field(..., alias="app_role")

    @staticmethod
    def resolve_phone_number(obj: User) -> Optional[str]:
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return None
        return str(obj.phone_number)

    class Config:
        model = User
        model_fields = ["first_name", "last_name", "position_title", "email", "phone_number", "bceid_business_name"]


class UserExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for fields from the User model that are needed in ExternalDashboardUsersTileData
    """

    class Config:
        model = User
        model_fields = ["first_name", "last_name", "email", "user_guid"]


class UserContactPageOut(ModelSchema):
    street_address: Optional[str] = Field(None, alias="address.street_address")
    municipality: Optional[str] = Field(None, alias="address.municipality")
    province: Optional[str] = Field(None, alias="address.province")
    postal_code: Optional[str] = Field(None, alias="address.postal_code")

    @staticmethod
    def resolve_phone_number(obj: User) -> str:
        return str(obj.phone_number)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'position_title']
