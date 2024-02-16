from typing import List
from registration.models import (
    ParentOperator,
    Address,
)


def handle_parent_operator_addresses(po_operator):

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
    return {"po_physical_address": po_physical_address, "po_mailing_address": po_mailing_address}


def archive_parent_operators(existing_parent_operator_indices, updated_parent_operators, operator_instance, user):

    updated_parent_operator_indices = [po.operator_index for po in updated_parent_operators if po.operator_index]

    indices_to_delete = list(set(existing_parent_operator_indices) - set(updated_parent_operator_indices))

    if indices_to_delete:
        parent_operators_to_delete: List[ParentOperator] = operator_instance.parent_operators.filter(
            operator_index__in=indices_to_delete
        )
        for po in parent_operators_to_delete:
            po.set_archive(user.pk)


def assign_index(existing_parent_operator_indices):
    return (max(existing_parent_operator_indices) if existing_parent_operator_indices else 0) + 1


def handle_parent_operators(updated_parent_operators, operator_instance, user):

    existing_parent_operators = operator_instance.parent_operators.all()

    # if the user has removed all parent operators, archive them all
    if not updated_parent_operators and existing_parent_operators:
        for po in existing_parent_operators:
            po.set_archive(user.pk)
        return

    existing_parent_operator_indices = list(operator_instance.parent_operators.values_list('operator_index', flat=True))
    # if the user has added, edited, or removed some parent operators
    if updated_parent_operators:
        for po_operator in updated_parent_operators:

            # archive any parent operators that have been removed
            if existing_parent_operator_indices:
                archive_parent_operators(
                    existing_parent_operator_indices, updated_parent_operators, operator_instance, user
                )

            # assign an operator_index to new parent operators
            if not po_operator.operator_index:
                po_operator.operator_index = assign_index(existing_parent_operator_indices)
                existing_parent_operator_indices.append(po_operator.operator_index)

            addresses = handle_parent_operator_addresses(po_operator)

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
                    "physical_address": addresses['po_physical_address'],
                    "mailing_address": addresses['po_mailing_address'],
                },
            )

            po_operator_instance.set_create_or_update(user.pk)
