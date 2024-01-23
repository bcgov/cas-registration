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
import uuid


def user_baker():
    return baker.make(User)


def address_baker():
    return baker.make(Address)


def document_baker():
    return baker.make(Document, file='test.pdf')


def contact_baker():
    return baker.make(Contact)


def operator_baker():
    return baker.make(
        Operator,
        bc_corporate_registry_number='abc1234567',
        business_structure=BusinessStructure.objects.first(),
        physical_address=address_baker(),
        website='https://www.example-operator.com',
    )


def operation_baker():
    return baker.make(
        Operation,
        operator=operator_baker(),
        point_of_contact=contact_baker(),
        naics_code=NaicsCode.objects.first(),
        bcghg_id=uuid.uuid4(),
    )


def user_operator_baker():
    return baker.make(UserOperator, user=user_baker(), operator=operator_baker())


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
