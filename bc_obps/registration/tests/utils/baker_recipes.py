from registration.models.app_role import AppRole
from registration.models.user import User
from registration.models.user_operator import UserOperator
from registration.models.naics_code import NaicsCode
from registration.models.operation import Operation
from registration.models.partner_operator import PartnerOperator
from registration.models.parent_operator import ParentOperator
from registration.models.address import Address
from registration.models.business_structure import BusinessStructure
from registration.tests.utils.bakers import (
    generate_random_bc_corporate_registry_number,
    generate_random_cra_business_number,
)
from registration.models.operator import Operator
from model_bakery.recipe import Recipe, foreign_key
import uuid


naics_code = Recipe(NaicsCode)

address = Recipe(Address, street_address='Dreary Lane', municipality='Candyland', province='BC', postal_code='HOHOHO')

operator = Recipe(
    Operator,
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number(),
    business_structure=BusinessStructure.objects.first(),
    mailing_address=foreign_key(address),
    cra_business_number=generate_random_cra_business_number(),
)

canadian_parent_operator = Recipe(
    ParentOperator,
    cra_business_number=generate_random_cra_business_number(),
    mailing_address=foreign_key(address),
)

foreign_parent_operator = Recipe(
    ParentOperator,
)

partner_operator = Recipe(
    PartnerOperator,
    cra_business_number=generate_random_cra_business_number(),
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number(),
    business_structure=BusinessStructure.objects.first(),
)


operator_for_operation = Recipe(
    Operator,
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number(),
    business_structure=BusinessStructure.objects.first(),
    mailing_address=foreign_key(address),
    cra_business_number=generate_random_cra_business_number(),
)


industry_operator_user = Recipe(User, app_role=AppRole.objects.get(role_name="industry_user"))

operation = Recipe(
    Operation,
    naics_code=foreign_key(naics_code),
    bcghg_id=uuid.uuid4(),
    operator=foreign_key(operator_for_operation),
    created_by=foreign_key(industry_operator_user),
)

operator_for_approved_user_operator = Recipe(
    Operator,
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number(),
    business_structure=BusinessStructure.objects.first(),
    mailing_address=foreign_key(address),
    cra_business_number=generate_random_cra_business_number(),
)

approved_user_operator = Recipe(
    UserOperator, status=UserOperator.Statuses.APPROVED, operator=foreign_key(operator_for_approved_user_operator)
)
