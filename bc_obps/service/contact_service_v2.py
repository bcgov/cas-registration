from typing import Optional, cast
from django.db.models import QuerySet
from uuid import UUID


from registration.models.contact import Contact
from registration.schema.v2.contact import ContactFilterSchemaV2
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query
from uuid import UUID


from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.contact import Contact
from registration.schema.v1.contact import ContactOut
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from ninja import Schema


class PlacesAssigned(Schema):
    role_name: str
    operation_name: str
    operation_id: UUID


class ContactWithPlacesAssigned(ContactOut):
    places_assigned: Optional[list[PlacesAssigned]]


class ContactServiceV2:
    @classmethod
    def list_contacts_v2(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: ContactFilterSchemaV2 = Query(...),
    ) -> QuerySet[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = ContactDataAccessService.get_all_contacts_for_user(user)
        # we have filter before .values or else we'll get duplicate rows from the m2m relationship between operations_contacts and operators
        queryset = (
            filters.filter(base_qs)
            .order_by(sort_by)
            .values('id', 'first_name', 'last_name', 'email', 'operators__legal_name')
            .distinct()
        )
        return cast(QuerySet[Contact], queryset)

    def get_if_authorized_v2(cls, user_guid: UUID, contact_id: int) -> Optional[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_contacts = ContactDataAccessService.get_all_contacts_for_user(user)
        contact = user_contacts.filter(id=contact_id).first()
        if user.is_industry_user() and not contact:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return contact

    @classmethod
    def get_with_places_assigned_v2(cls, user_guid: UUID, contact_id: int) -> Optional[ContactWithPlacesAssigned]:
        contact = cls.get_if_authorized_v2(user_guid, contact_id)
        places_assigned = []
        if contact:
            role_name = contact.business_role.role_name
            for operation in contact.operations_contacts.all():
                place = PlacesAssigned(
                    role_name=role_name,
                    operation_name=operation.name,
                    operation_id=operation.id,
                )
                places_assigned.append(place)
            result = cast(ContactWithPlacesAssigned, contact)
            if places_assigned:
                result.places_assigned = places_assigned
            return result
        return None
