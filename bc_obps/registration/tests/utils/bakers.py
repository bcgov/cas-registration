import pytest
from model_bakery import baker
from registration.models import (
    MultipleOperator,
    NaicsCode,
    Document,
    Contact,
    Operation,
    Operator,
    User,
    UserOperator,
)
import uuid


# We can import any of the below fixtures into our tests and they will be available by using the fixture name like:
# @pytest.mark.usefixtures('user_baker')
@pytest.fixture
def user_baker():
    return baker.make(User)


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
def operation_baker(user_baker, contact_baker, operator_baker):
    return baker.make(
        Operation,
        operator=operator_baker,
        application_lead=contact_baker,
        naics_code=NaicsCode.objects.first(),
        bcghg_id=uuid.uuid4(),
    )


@pytest.fixture
def user_operator_baker(user_baker, operator_baker):
    return baker.make(UserOperator, user=user_baker, operator=operator_baker)


@pytest.fixture
def multiple_operator_baker(operation_baker, user_baker):
    return baker.make(MultipleOperator, operation=operation_baker)
