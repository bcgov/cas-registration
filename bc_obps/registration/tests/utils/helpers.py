import pytest
import json
from registration.models import (
    AppRole,
    Contact,
    Document,
    NaicsCode,
    Operation,
    Operator,
    RegulatedProduct,
    ReportingActivity,
    User,
    UserOperator,
)
from model_bakery import baker
from registration.schema import OperationCreateIn, OperationUpdateIn
from django.test import Client
from registration.schema.user_operator import UserOperatorContactIn, UserOperatorOperatorIn


pytestmark = pytest.mark.django_db


class CommonTestSetup:
    def setup(self):
        self.user = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)


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

    @staticmethod
    def mock_postal_code():
        return "v8v3g1"

    def mock_OperationCreateIn(self, operator: Operator = None):
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

    def mock_OperationUpdateIn(self):
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

    def mock_UserOperatorOperatorIn(self):
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

    def mock_UserOperatorContactIn(self):
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
