from uuid import UUID
from registration.models import BusinessRole, Contact


class ContactDataAccessService:
    @classmethod
    def update_or_create(cls, point_of_contact_id, updated_data, user_guid: UUID):
        contact, _ = Contact.objects.update_or_create(
            id=point_of_contact_id,
            defaults={
                "first_name": updated_data["first_name"],
                "last_name": updated_data["last_name"],
                "position_title": updated_data["position_title"],
                "email": updated_data["email"],
                "phone_number": updated_data["phone_number"],
                "business_role": BusinessRole.objects.get(role_name="Operation Registration Lead"),
            },
        )
        contact.set_create_or_update(user_guid)
        return contact
