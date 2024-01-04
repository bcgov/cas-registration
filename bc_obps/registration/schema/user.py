from ninja import ModelSchema, Schema
from registration.models import AppRole, User


class UserIn(Schema):
    first_name: str
    last_name: str
    email: str
    position_title: str
    phone_number: str


class UserOut(ModelSchema):
    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return
        return obj.phone_number.as_e164

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "position_title",
            "street_address",
            "municipality",
            "province",
            "postal_code",
            "email",
            "phone_number",
            "app_role",
        ]


class UserAppRoleOut(ModelSchema):
    class Meta:
        model = AppRole
        fields = ['role_name']


class UserProfileOut(UserOut):
    app_role: UserAppRoleOut  # Include AppRoleOut model as a field

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "position_title",
            "email",
            "phone_number",
        ]
