from typing import Type, Union, Iterable, Dict, Any
from django.core.exceptions import ValidationError
from django.db import models
from .models import User, Operator, UserOperator


def check_users_admin_request_eligibility(user: User, operator: Operator) -> Union[None, tuple[int, dict]]:
    """
    Check if a user is eligible to request admin access to an operator.

    Args:
        user (User): The user for whom eligibility is being checked.
        operator (Operator): The operator to which admin access is being requested.

    Returns:
        Union[None, Tuple[int, str]]: Eligibility status. None if eligible, (400, error message) if not.
    """
    # User already has an admin user for this operator
    if UserOperator.objects.filter(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists():
        return 400, {"message": "You are already an admin for this Operator!"}

    # Operator already has an admin user
    if UserOperator.objects.filter(
        operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists():
        return 400, {"message": "This Operator already has an admin user!"}

    # User already has a pending request for this operator
    # NOTE: This is a bit of a weird case, but it's possible for a user to have a pending request for an operator
    #       and if we show the UserOperator request form, they could submit another request and end up with two Contact
    if UserOperator.objects.filter(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING
    ).exists():
        return 400, {"message": "You already have a pending request for this Operator!"}

    return 200, None


def update_model_instance(
    instance: Type[models.Model],
    fields_to_update: Union[Iterable[str], Dict[str, str]],
    data_dict: Dict[str, Any],
) -> Type[models.Model]:
    """
    Update the provided data model instance with values from data_dict based on the field mappings.

    Args:
        instance (Type[models.Model]): An instance of a data model.
        fields_to_update (dict or Iterable): A dictionary mapping fields in data_dict to instance fields
            or an iterable of fields to update.
        data_dict (dict): A dictionary containing the data to update the instance with.

    Returns:
        instance (models.Model): The updated instance.
    """
    if isinstance(fields_to_update, dict):
        for data_key, instance_key in fields_to_update.items():
            if data_key in data_dict and hasattr(instance, instance_key):
                setattr(instance, instance_key, data_dict[data_key])
    else:
        for field in fields_to_update:
            if field in data_dict and hasattr(instance, field):
                setattr(instance, field, data_dict[field])
    try:
        # Perform full validation of the instance based on the model's field constraints.
        instance.full_clean()
    except ValidationError as e:
        raise ValidationError(e)

    # We don't save the instance here; This allows further operations or validation before the actual save.
    return instance
