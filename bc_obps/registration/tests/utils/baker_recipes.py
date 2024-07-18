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
