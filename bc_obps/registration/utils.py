from typing import List, Type, Union, Iterable, Dict, Any, Tuple, Optional
from django.core.exceptions import ValidationError
from django.db import IntegrityError, models

from registration.schema.user_operator import UserOperatorOperatorIn, UserOperatorContactIn
from .models import User, Operator, UserOperator, AppRole
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError
from model_bakery import baker
from django.test import Client
from registration.models import (
    NaicsCode,
    Document,
    Contact,
    Operator,
    ReportingActivity,
    User,
    UserOperator,
    RegulatedProduct,
    Operation,
)
from registration.schema import OperationCreateIn, OperationUpdateIn


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
    except IntegrityError as e:
        raise IntegrityError(e)

    # We don't save the instance here; This allows further operations or validation before the actual save.
    return instance


def generate_useful_error(error):
    """
    Generate a useful error message from a ValidationError.
    NOTE: this only returns the first error message until we can figure out a better way to handle multiple errors in the client side.
    """
    for key, value in error.message_dict.items():
        formatted_key = ' '.join(word.capitalize() for word in key.split('_'))
        return f"{formatted_key}: {value[0]}"


def check_access_request_matches_business_guid(
    user_guid: str, operator: Operator
) -> Tuple[int, Optional[Union[dict[str, str], None]]]:
    """
    Check if a the business_guid of a subsequent user who is requesting access matches the business_guid of the admin

    Args:
        user_guid (User): The guid of the user for whom eligibility is being checked.
        operator (Operator): The operator to which access is being requested.

    Returns:
        Union[None, Tuple[int, str]]: Eligibility status. None if eligible, (400, error message) if not.
    """
    admin_user_operator_data = UserOperator.objects.filter(
        operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).first()
    # Operator already has an admin user
    admin_user = get_object_or_404(User, user_guid=admin_user_operator_data.user.user_guid)
    current_user = get_object_or_404(User, user_guid=user_guid)

    if admin_user.business_guid != current_user.business_guid:
        return 403, {"message": "Your business bceid does not match that of the approved admin."}

    return 200, None


def extract_fields_from_dict(data_dict, fields_to_extract):
    new_dict = dict()
    for field in fields_to_extract:
        if field in data_dict:
            new_dict[field] = data_dict[field]
    return new_dict


def raise_401_if_role_not_authorized(request, authorized_roles) -> Tuple[int, Optional[Union[dict[str, str], None]]]:
    if not hasattr(request, 'current_user'):
        raise HttpError(401, "Unauthorized.")
    role_name = getattr(request.current_user.app_role, "role_name")
    if role_name not in authorized_roles:
        raise HttpError(401, "Unauthorized.")


def get_an_operators_approved_users(operator: Operator) -> List[User]:
    # get a list of all the operator's approved user ids
    user_ids = UserOperator.objects.filter(operator_id=operator.id, status=UserOperator.Statuses.APPROVED).values_list(
        'user_id', flat=True
    )

    return User.objects.filter(pk__in=user_ids).values_list('user_guid', flat=True)


class TestUtils:
    # initialize the APIClient app
    client = Client()

    def save_app_role(self, role_name):
        baker.make(AppRole, role_name=role_name)
        self.user.app_role = baker.make(AppRole, role_name=role_name)
        self.user.save()

    def mock_get_with_auth_role(self, role_name, endpoint=None):
        TestUtils.save_app_role(self, role_name)
        return TestUtils.client.get(endpoint or self.endpoint, HTTP_AUTHORIZATION=self.auth_header_dumps)

    def mock_post_with_auth_role(self, role_name, content_type, data, endpoint=None):
        TestUtils.save_app_role(self, role_name)
        return TestUtils.client.post(
            endpoint or self.endpoint, content_type=content_type, data=data, HTTP_AUTHORIZATION=self.auth_header_dumps
        )

    def mock_put_with_auth_role(self, role_name, content_type, data, endpoint=None):
        TestUtils.save_app_role(self, role_name)
        return TestUtils.client.put(
            endpoint or self.endpoint, content_type=content_type, data=data, HTTP_AUTHORIZATION=self.auth_header_dumps
        )

    def authorize_current_user_as_operator_user(self, operator):
        baker.make(UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator=operator)

    def mock_postal_code():
        return "v8v3g1"

    def mock_OperationCreateIn(operator: Operator = None):
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        reporting_activities = baker.make(ReportingActivity, _quantity=2)
        regulated_products = baker.make(RegulatedProduct, _quantity=2)
        application_lead = baker.make(Contact)
        operator = operator or baker.make(Operator)
        return OperationCreateIn(
            name='Springfield Nuclear Power Plant',
            type='Single Facility Operation',
            naics_code_id=naics_code.id,
            reporting_activities=reporting_activities,
            regulated_products=regulated_products,
            documents=[document.id],
            application_lead=application_lead.id,
            operator_id=operator.id,
        )

    def mock_OperationUpdateIn():
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        application_lead = baker.make(Contact)
        operator = baker.make(Operator)
        activity = baker.make(ReportingActivity)
        product = baker.make(RegulatedProduct)
        operation = baker.make(Operation)
        operation.reporting_activities.set([activity.id])
        operation.regulated_products.set([product.id])

        return OperationUpdateIn(
            name="New name",
            type="Single Facility Operation",
            naics_code_id=naics_code.id,
            reporting_activities=[activity.id],
            physical_street_address="19 Evergreen Terrace",
            physical_municipality="Springfield",
            physical_province="BC",
            physical_postal_code="V1V 1V1",
            legal_land_description="It's legal",
            latitude=90,
            longitude=-120,
            regulated_products=[product.id],
            documents=[document.id],
            application_lead=application_lead.id,
            operator_id=operator.id,
        )

    def mock_UserOperatorOperatorIn():
        return UserOperatorOperatorIn(
            legal_name='test',
            cra_business_number=123,
            bc_corporate_registry_number='adh1234321',
            business_structure='test',
            physical_street_address='test',
            physical_municipality='test',
            physical_province='test',
            physical_postal_code='test',
            mailing_address_same_as_physical=True,
            operator_has_parent_company=False,
        )

    def mock_UserOperatorContactIn():
        user_operator = baker.make(UserOperator)
        return UserOperatorContactIn(
            is_senior_officer=True,
            user_operator_id=user_operator.id,
            position_title='test',
            street_address='test',
            municipality='test',
            province='BC',
            postal_code='h0h 0h0',
            email='test@email.com',
        )
