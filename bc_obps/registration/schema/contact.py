from ninja import ModelSchema
from registration.models import Contact


class ContactSchema(ModelSchema):
    """
    Schema for the Contact model
    """

    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return
        return obj.phone_number.as_e164

    class Config:
        model = Contact
        model_fields = "__all__"
