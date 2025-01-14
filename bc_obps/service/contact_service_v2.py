from typing import Optional, cast
from django.db.models import QuerySet
from uuid import UUID


from registration.models.contact import Contact
from registration.schema.v2.contact import ContactFilterSchemaV2
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query


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
