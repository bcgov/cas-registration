from model_bakery import baker
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
import uuid, random, string


def generate_random_bc_corporate_registry_number():
    # Generate a random string of 1 to 3 uppercase or lowercase letters
    letters = random.choices(string.ascii_letters, k=random.randint(1, 3))

    # Generate a random string of 7 digits
    numbers = ''.join(random.choices(string.digits, k=7))

    # Concatenate the letters and numbers
    dummy_data = ''.join(letters) + numbers

    return dummy_data


def user_baker():
    return baker.make(User)


def address_baker():
    return baker.make(Address)


def document_baker():
    return baker.make(Document, file='test.pdf')


def contact_baker():
    return baker.make(Contact)


def operator_baker(custom_properties=None):
    properties = {
        'bc_corporate_registry_number': generate_random_bc_corporate_registry_number(),
        'business_structure': BusinessStructure.objects.first(),
        'physical_address': address_baker(),
        'website': 'https://www.example-operator.com',
    }

    # Update properties with custom_properties if provided
    if custom_properties:
        properties.update(custom_properties)

    return baker.make(Operator, **properties)


def operation_baker(operator_id=None):
    if operator_id:
        return baker.make(
            Operation,
            point_of_contact=contact_baker(),
            naics_code=NaicsCode.objects.first(),
            bcghg_id=uuid.uuid4(),
            operator_id=operator_id,
        )

    return baker.make(
        Operation,
        point_of_contact=contact_baker(),
        naics_code=NaicsCode.objects.first(),
        bcghg_id=uuid.uuid4(),
        operator=operator_baker(),
    )


def user_operator_baker(custom_properties=None):
    properties = {
        'user': user_baker(),
        'operator': operator_baker(),
    }

    # Update properties with custom_properties if provided
    if custom_properties:
        properties.update(custom_properties)

    return baker.make(UserOperator, **properties)


def multiple_operator_baker():
    return baker.make(
        MultipleOperator,
        operation=operation_baker(),
        bc_corporate_registry_number='abc1234567',
        business_structure=BusinessStructure.objects.first(),
        website='https://www.example-mo.com',
    )


def parent_operator_baker():
    return baker.make(
        ParentOperator,
        child_operator=operator_baker(),
        operator_index=1,
        cra_business_number=147852369,
        bc_corporate_registry_number='asd7654321',
        business_structure=BusinessStructure.objects.first(),
        physical_address=Address.objects.first(),
        mailing_address=Address.objects.first(),
        website='https://www.example-po.com',
    )
