from django.db import transaction
from django.db import transaction

from registration.api.utils.handle_parent_operators import handle_parent_operators
from registration.utils import (
    handle_operator_addresses,
    update_model_instance,
)
from registration.schema import (
    UserOperatorOperatorIn,
)

from registration.models import (
    Operator,
    User,
    UserOperator,
)


# Function to save operator data to reuse in POST/PUT methods
def save_operator(payload: UserOperatorOperatorIn, operator_instance: Operator, user: User):
    # rollback the transaction if any of the following fails (mostly to prevent orphaned addresses)
    with transaction.atomic():
        existing_physical_address = getattr(getattr(operator_instance, 'physical_address', None), 'id', None)
        existing_mailing_address = existing_physical_address = getattr(getattr(operator_instance, 'mailing_address', None), 'id', None)
    
        physical_address, mailing_address = handle_operator_addresses(payload.dict(),existing_physical_address ,existing_mailing_address ).values()

        operator_instance.physical_address = physical_address
        operator_instance.mailing_address = mailing_address

        # fields to update on the Operator model
        operator_related_fields = [
            "legal_name",
            "trade_name",
            "physical_address",
            "mailing_address",
            "website",
            "business_structure",
        ]
        created_or_updated_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, payload.dict()
        )
        created_or_updated_operator_instance.save()
        created_or_updated_operator_instance.set_create_or_update(user.pk)
        handle_parent_operators(payload.parent_operators_array, created_or_updated_operator_instance, user)

        # get an existing user_operator instance or create a new one with the default role
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=created_or_updated_operator_instance
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return 200, {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}

