from django.db import transaction
from registration.utils import update_model_instance
from typing import Optional
from registration.models import (
    User,
    Operator,
    User,
    UserOperator,
)
from registration.schema.user_operator import UserOperatorOperatorIn
from registration.models import (
    Operator,
    User,
    UserOperator,
    Address,
)


# ADDRESS HELPERS
class AddressesData:
    physical_street_address: str
    physical_municipality: str
    physical_province: str
    physical_postal_code: str
    mailing_address_same_as_physical: bool
    mailing_street_address: Optional[str]
    mailing_municipality: Optional[str]
    mailing_province: Optional[str]
    mailing_postal_code: Optional[str]


# def handle_operator_addresses(address_data: AddressesData, physical_address_id, mailing_address_id, prefix=""):
#     # create or update physical address record
#     physical_address, _ = Address.objects.update_or_create(
#         id=physical_address_id,
#         defaults={
#             "street_address": address_data.get(f'{prefix}physical_street_address'),
#             "municipality": address_data.get(f'{prefix}physical_municipality'),
#             "province": address_data.get(f'{prefix}physical_province'),
#             "postal_code": address_data.get(f'{prefix}physical_postal_code'),
#         },
#     )
#     if address_data.get(f'{prefix}mailing_address_same_as_physical'):
#         mailing_address = physical_address
#     else:
#         # if mailing_address_same_as_physical == False but the ids match, it means that the user previously set the addresses to the same but now has added a mailing address
#         if physical_address_id == mailing_address_id:
#             mailing_address = Address.objects.create(
#                 street_address=address_data.get(f'{prefix}mailing_street_address'),
#                 municipality=address_data.get(f'{prefix}mailing_municipality'),
#                 province=address_data.get(f'{prefix}mailing_province'),
#                 postal_code=address_data.get(f'{prefix}mailing_postal_code'),
#             )
#         else:
#             mailing_address, _ = Address.objects.update_or_create(
#                 id=mailing_address_id,
#                 defaults={
#                     "street_address": address_data.get(f'{prefix}mailing_street_address'),
#                     "municipality": address_data.get(f'{prefix}mailing_municipality'),
#                     "province": address_data.get(f'{prefix}mailing_province'),
#                     "postal_code": address_data.get(f'{prefix}mailing_postal_code'),
#                 },
#             )
#     return {"physical_address": physical_address, "mailing_address": mailing_address}


# # Function to save operator data to reuse in POST/PUT methods
# def save_operator(payload: UserOperatorOperatorIn, operator_instance: Operator, user: User):
#     # rollback the transaction if any of the following fails (mostly to prevent orphaned addresses)
#     with transaction.atomic():
#         existing_physical_address = getattr(getattr(operator_instance, 'physical_address', None), 'id', None)
#         existing_mailing_address = getattr(getattr(operator_instance, 'mailing_address', None), 'id', None)
#         physical_address, mailing_address = handle_operator_addresses(
#             payload.dict(), existing_physical_address, existing_mailing_address
#         ).values()

#         operator_instance.physical_address = physical_address
#         operator_instance.mailing_address = mailing_address

#         # fields to update on the Operator model
#         operator_related_fields = [
#             "legal_name",
#             "trade_name",
#             "physical_address",
#             "mailing_address",
#             "website",
#             "business_structure",
#             "cra_business_number",
#             "bc_corporate_registry_number",
#         ]
#         created_or_updated_operator_instance: Operator = update_model_instance(
#             operator_instance, operator_related_fields, payload.dict()
#         )
#         created_or_updated_operator_instance.save(update_fields=operator_related_fields + ["status"])
#         created_or_updated_operator_instance.set_create_or_update(user.pk)

#         # Using the import here to avoid circular import
#         from registration.api.utils.parent_operator_utils import handle_parent_operators

#         handle_parent_operators(payload.parent_operators_array, created_or_updated_operator_instance, user)

#         # get an existing user_operator instance or create a new one with the default role
#         user_operator, created = UserOperator.objects.get_or_create(
#             user=user, operator=created_or_updated_operator_instance
#         )
#         if created:
#             user_operator.set_create_or_update(user.pk)
#         return 200, {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}
