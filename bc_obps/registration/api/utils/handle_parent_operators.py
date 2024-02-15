from registration.models import (
    AppRole,
    BusinessRole,
    Operator,
    User,
    UserOperator,
    ParentOperator,
    Address,
)


def handle_parent_operators(payload, created_or_updated_operator_instance, user):
    # create parent operator records
    operator_has_parent_operators: bool = payload.operator_has_parent_operators
    if operator_has_parent_operators:
        for idx, po_operator in enumerate(payload.parent_operators_array):

            existing_parent_operator_indices = list(
                ParentOperator.objects.filter(child_operator=created_or_updated_operator_instance).values_list(
                    'operator_index', flat=True
                )
            )

            # archive any parent operators that have been removed
            if existing_parent_operator_indices:

                def get_indices(po):
                    return po.operator_index

                updated_parent_operator_indices = [
                    get_indices(po) for po in payload.parent_operators_array if get_indices(po) is not None
                ]

                indices_to_delete = list(set(existing_parent_operator_indices) - set(updated_parent_operator_indices))

                if indices_to_delete:
                    for op_index in indices_to_delete:
                        ParentOperator.objects.get(operator_index=op_index).set_archive(user.pk)

            # assign an operator_index to new parent operators
            if not po_operator.operator_index:
                highest_existing_index = (
                    max(existing_parent_operator_indices) if len(existing_parent_operator_indices) > 0 else 0
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
                child_operator=created_or_updated_operator_instance,
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
