import pytest
from django.core.management import call_command
from model_bakery import baker
from registration.models import (
    MultipleOperator,
    NaicsCode,
    Document,
    Contact,
    Operation,
    Operator,
    ReportingActivity,
    User,
    UserOperator,
    RegulatedProduct,
)
import uuid


@pytest.fixture
def app_role_baker():
    # Load the fixture data into the test database
    call_command('loaddata', 'real/appRole.json')


@pytest.fixture
def user_baker():
    return baker.make(User)


@pytest.fixture
def activity_baker():
    return baker.make(ReportingActivity)


@pytest.fixture
def product_baker():
    return baker.make(RegulatedProduct)


@pytest.fixture
def naics_code_baker():
    return baker.make(NaicsCode)


@pytest.fixture
def document_baker(user_baker):
    return baker.make(Document)


@pytest.fixture
def contact_baker(user_baker):
    return baker.make(Contact)


@pytest.fixture
def operator_baker(user_baker):
    return baker.make(Operator)


@pytest.fixture
def operation_baker(user_baker, naics_code_baker, contact_baker, operator_baker):
    return baker.make(
        Operation,
        operator=operator_baker,
        application_lead=contact_baker,
        naics_code=naics_code_baker,
        bcghg_id=uuid.uuid4(),
    )


@pytest.fixture
def user_operator_baker(user_baker, operator_baker):
    return baker.make(UserOperator, user=user_baker, operator=operator_baker)


@pytest.fixture
def multiple_operator_baker(operation_baker, user_baker):
    return baker.make(MultipleOperator, operation=operation_baker)
