import pytest
from model_bakery import baker
from registration.models import Operator, User
from registration.schema.v2.operator import OperatorIn

pytestmark = pytest.mark.django_db


class TestUserOperatorServiceV2:
    @staticmethod
    def test_save_operator():
        from service.user_operator_service_v2 import UserOperatorServiceV2

        user = baker.make(User)
        payload = OperatorIn(
            legal_name="Example Legal Name",
            trade_name="Example Trade Name",
            business_structure='General Partnership',
            cra_business_number=123456789,
            bc_corporate_registry_number="aaa1111111",
            street_address="123 Main St",
            municipality="City",
            province="ON",
            postal_code="A1B 2C3",
            operator_has_parent_operators=False,
        )

        operator_instance: Operator = Operator(
            business_structure=payload.business_structure,
            cra_business_number=payload.cra_business_number,
            bc_corporate_registry_number=payload.bc_corporate_registry_number,
            status=Operator.Statuses.APPROVED,
        )
        UserOperatorServiceV2.save_operator(payload, operator_instance, user.user_guid)
        assert len(Operator.objects.all()) == 1
        assert Operator.objects.first().legal_name == payload.legal_name
        assert Operator.objects.first().trade_name == payload.trade_name
        assert Operator.objects.first().business_structure == payload.business_structure
        assert Operator.objects.first().cra_business_number == payload.cra_business_number
        assert Operator.objects.first().bc_corporate_registry_number == payload.bc_corporate_registry_number
        assert Operator.objects.first().status == Operator.Statuses.APPROVED
