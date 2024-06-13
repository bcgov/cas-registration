from registration.schema.v1.parent_operator import ParentOperatorIn
from registration.schema.v1.user_operator import UserOperatorOperatorIn
import pytest
from model_bakery import baker
from registration.models import Address, BusinessStructure, Operator, ParentOperator, User

pytestmark = pytest.mark.django_db


class TestUserOperatorService:
    @staticmethod
    def test_save_operator():
        from service.user_operator_service import UserOperatorService

        user = baker.make(User)
        operator_instance: Operator = Operator(
            cra_business_number=444444444,
            bc_corporate_registry_number="aaa1111111",
            business_structure=BusinessStructure.objects.first(),
            status=Operator.Statuses.PENDING,
        )
        payload = UserOperatorOperatorIn(
            legal_name="Example Legal Name",
            trade_name="Example Trade Name",
            cra_business_number=123456789,
            bc_corporate_registry_number="aaa1111111",
            business_structure='BC Corporation',
            physical_street_address="Example Physical Street Address",
            physical_municipality="Example Physical Municipality",
            physical_province="AB",
            physical_postal_code="H0H 0H0",
            mailing_street_address="Example Mailing Street Address",
            mailing_municipality="Example Mailing Municipality",
            mailing_province="BC",
            mailing_postal_code="H0H 0H0",
            mailing_address_same_as_physical=False,
            operator_has_parent_operators=True,
            parent_operators_array=[],
        )
        # need to set this outside of UserOperatorOperatorIn because otherwise the two schemas interfere with each other and one expects business_structure to be a str while the other expects BusinessStructure
        payload.parent_operators_array = [
            ParentOperatorIn(
                po_legal_name="Example Parent Legal Name",
                po_trade_name="Example Parent Trade Name",
                po_cra_business_number=987654321,
                po_bc_corporate_registry_number="bbb2222222",
                po_business_structure='BC Corporation',
                po_physical_street_address="Example Parent Physical Street Address",
                po_physical_municipality="Example Parent Physical Municipality",
                po_physical_province="BC",
                po_physical_postal_code="H0H 0H0",
                po_mailing_address_same_as_physical=False,
                mailing_street_address="Example Parent Mailing Street Address",
                po_mailing_municipality="Example Parent Mailing Municipality",
                po_mailing_province="ON",
                po_mailing_postal_code="H0H 0H0",
                operator_index=1,
            )
        ]

        UserOperatorService.save_operator(payload, operator_instance, user.user_guid)
        assert len(Operator.objects.all()) == 1
        assert Operator.objects.first().legal_name == "Example Legal Name"
        assert len(ParentOperator.objects.all()) == 1
        assert ParentOperator.objects.first().legal_name == "Example Parent Legal Name"
        assert len(Address.objects.all()) == 4
