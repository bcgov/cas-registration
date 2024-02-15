from typing import List
from registration.models import (
    AppRole,
    BusinessRole,
    Operator,
    User,
    UserOperator,
    ParentOperator,
    Address,
)


def handle_parent_operators(updated_parent_operators, operator_instance, user):

    existing_parent_operators = operator_instance.parent_operators

    # if the user has removed all parent operators, archive them all
    if not updated_parent_operators and existing_parent_operators:
        for po in existing_parent_operators.all():
            po.set_archive(user.pk)
        return

    # if the user has added, edited, or removed some parent operators

    if updated_parent_operators:
        for po_operator in updated_parent_operators:
            # this needs to be in the loop because if the loop adds a new operator, we need to catch that new index
            existing_parent_operator_indices = list(
                operator_instance.parent_operators.values_list('operator_index', flat=True)
            )

            # archive any parent operators that have been removed
            if existing_parent_operator_indices:

                updated_parent_operator_indices = [
                    po.operator_index for po in updated_parent_operators if po.operator_index
                ]

                indices_to_delete = list(set(existing_parent_operator_indices) - set(updated_parent_operator_indices))

                if indices_to_delete:
                    parent_operators_to_delete: List[ParentOperator] = operator_instance.parent_operators.filter(
                        operator_index__in=indices_to_delete
                    )
                    for po in parent_operators_to_delete:
                        po.set_archive(user.pk)

            # assign an operator_index to new parent operators
            if not po_operator.operator_index:
                highest_existing_index = (
                    max(existing_parent_operator_indices) if existing_parent_operator_indices else 0
                )

                po_operator.operator_index = highest_existing_index + 1

            # handle addresses--if there's no mailing address given, it's the same as the physical address
            po_physical_address = Address.objects.create(
                street_address=po_operator.po_physical_street_address,
                municipality=po_operator.po_physical_municipality,
                province=po_operator.po_physical_province,
                postal_code=po_operator.po_physical_postal_code,
            )

            if po_operator.po_mailing_address_same_as_physical:
                po_mailing_address = po_physical_address
            else:
                po_mailing_address = Address.objects.create(
                    street_address=po_operator.po_mailing_street_address,
                    municipality=po_operator.po_mailing_municipality,
                    province=po_operator.po_mailing_province,
                    postal_code=po_operator.po_mailing_postal_code,
                )

            po_operator_instance, _ = ParentOperator.objects.update_or_create(
                child_operator=operator_instance,
                operator_index=po_operator.operator_index,
                defaults={
                    "legal_name": po_operator.po_legal_name,
                    "trade_name": po_operator.po_trade_name,
                    "cra_business_number": po_operator.po_cra_business_number,
                    "bc_corporate_registry_number": po_operator.po_bc_corporate_registry_number,
                    "business_structure": po_operator.po_business_structure,
                    "website": po_operator.po_website,
                    "physical_address": po_physical_address,
                    "mailing_address": po_mailing_address,
                },
            )

            po_operator_instance.set_create_or_update(user.pk)
