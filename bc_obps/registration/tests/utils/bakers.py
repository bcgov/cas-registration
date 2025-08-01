from itertools import cycle
from typing import List, Union
from model_bakery import baker
from model_bakery.recipe import seq
from registration.models import (
    Address,
    BusinessStructure,
    MultipleOperator,
    NaicsCode,
    Document,
    Contact,
    Operation,
    Operator,
    ParentOperator,
    User,
    UserOperator,
)
import uuid
import random
import string

from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation


def generate_random_bc_corporate_registry_number():
    # Generate a random string of 1 to 3 uppercase or lowercase letters
    letters = random.choices(string.ascii_letters, k=random.randint(1, 3))

    # Generate a random string of 7 digits
    numbers = ''.join(random.choices(string.digits, k=7))

    # Concatenate the letters and numbers
    dummy_data = ''.join(letters) + numbers

    return dummy_data


def select_random_registration_purpose():
    return random.choice([choice.value for choice in Operation.Purposes])


def user_baker(custom_properties=None) -> User:
    properties = {}
    if custom_properties:
        properties.update(custom_properties)

    return baker.make(User, **properties)


def generate_random_cra_business_number():
    return str(random.randint(100000000, 999999999))


def address_baker() -> Address:
    return baker.make(
        Address, street_address='123 Fake St', municipality='Victoria', province='BC', postal_code='H0H0H0'
    )


def document_baker() -> Document:
    return baker.make(Document, file='test.pdf')


def contact_baker(*args, **kwargs) -> Union[Contact, List[Contact]]:
    return baker.make(Contact, *args, **kwargs, operator=operator_baker())


def bc_obps_regulated_operation_baker() -> BcObpsRegulatedOperation:
    return baker.make(BcObpsRegulatedOperation, id=seq("99-", start=1001))


def operator_baker(custom_properties=None) -> Operator:
    properties = {
        'bc_corporate_registry_number': generate_random_bc_corporate_registry_number(),
        'business_structure': BusinessStructure.objects.first(),
        'physical_address': address_baker(),
        'website': 'https://www.example-operator.com',
        'cra_business_number': generate_random_cra_business_number(),
    }

    # Update properties with custom_properties if provided
    if custom_properties:
        properties.update(custom_properties)
    return baker.make(Operator, **properties)


def operation_baker(operator_id: uuid.UUID = None, **properties) -> Union[Operation, List[Operation]]:
    if "type" not in properties:
        properties["type"] = cycle([choice for choice in Operation.Types])

    if "registration_purpose" not in properties:
        properties["registration_purpose"] = cycle([choice for choice in Operation.Purposes])

    if operator_id:
        return baker.make(
            Operation,
            naics_code=NaicsCode.objects.first(),
            operator_id=operator_id,
            **properties,
        )

    return baker.make(
        Operation,
        naics_code=NaicsCode.objects.first(),
        operator=operator_baker(),
        **properties,
    )


def user_operator_baker(custom_properties=None) -> UserOperator:
    properties = {
        'user': user_baker(),
        'operator': operator_baker(),
    }

    # Update properties with custom_properties if provided
    if custom_properties:
        properties.update(custom_properties)

    return baker.make(UserOperator, **properties)


def multiple_operator_baker() -> MultipleOperator:
    return baker.make(
        MultipleOperator,
        operation=operation_baker(),
        bc_corporate_registry_number='abc1234567',
        business_structure=BusinessStructure.objects.first(),
        cra_business_number=generate_random_cra_business_number(),
    )


def parent_operator_baker() -> ParentOperator:
    return baker.make(
        ParentOperator,
        child_operator=operator_baker(),
        operator_index=1,
        cra_business_number=generate_random_cra_business_number(),
        bc_corporate_registry_number='asd7654321',
        business_structure=BusinessStructure.objects.first(),
        physical_address=Address.objects.first(),
        mailing_address=Address.objects.first(),
        website='https://www.example-po.com',
    )
