from typing import List
from registration.models import ParentOperator


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

            # handle addresses
            existing_po_physical_address = ParentOperator.objects.filter(
                child_operator_id=operator_instance.id, operator_index=po_operator.operator_index
            ).first()
            existing_po_physical_address_id = (
                existing_po_physical_address.physical_address_id if existing_po_physical_address else None
            )

            existing_po_mailing_address = ParentOperator.objects.filter(
                child_operator_id=operator_instance.id, operator_index=po_operator.operator_index
            ).first()
            existing_po_mailing_address_id = (
                existing_po_mailing_address.mailing_address_id if existing_po_mailing_address else None
            )
            from service.handle_addresses_service import HandleAddressesService

            physical_address, mailing_address = HandleAddressesService.handle_operator_addresses(
                po_operator.dict(), existing_po_physical_address_id, existing_po_mailing_address_id, 'po_'
            ).values()

            # create or update the parent operator
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
                    "physical_address": physical_address,
                    "mailing_address": mailing_address,
                },
            )
            po_operator_instance.set_create_or_update(user.pk)
