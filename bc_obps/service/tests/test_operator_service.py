from registration.models.address import Address
from registration.models.partner_operator import PartnerOperator
from registration.models.parent_operator import ParentOperator
from registration.models.operator import Operator
from registration.schema import OperatorIn, ParentOperatorIn, PartnerOperatorIn
from service.operator_service import OperatorService
import pytest
from registration.models.app_role import AppRole
from registration.models.user import User
from registration.models.user_operator import UserOperator
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestUpdateOperatorV2:
    @staticmethod
    def test_update_operator_no_address_change():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number=123456789,
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            mailing_address=operator.mailing_address.id,
            street_address=operator.mailing_address.street_address,
            municipality=operator.mailing_address.municipality,
            province=operator.mailing_address.province,
            postal_code=operator.mailing_address.postal_code,
        )
        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.first()
        assert updated_operator.legal_name == 'Legal Name Example'
        assert Address.objects.count() == 1
        assert updated_operator.mailing_address.id == operator.mailing_address.id
        assert updated_operator.mailing_address.street_address == operator.mailing_address.street_address

    @staticmethod
    def test_update_operator_address_change():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number=123456789,
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            mailing_address=operator.mailing_address.id,
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
        )
        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.first()
        assert updated_operator.legal_name == 'Legal Name Example'
        assert Address.objects.count() == 1
        assert updated_operator.mailing_address.id == operator.mailing_address.id
        assert updated_operator.mailing_address.street_address == 'balloons'

    @staticmethod
    def test_update_operator_with_partner_operators():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe('registration.tests.utils.partner_operator', bc_obps_operator=operator, _quantity=3)
        assert PartnerOperator.objects.count() == 3
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='General Partnership',
            cra_business_number=123456789,
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
            mailing_address=operator.mailing_address.id,
        )
        payload.partner_operators_array = [
            PartnerOperatorIn(
                id=operator.partner_operators.first().id,
                partner_legal_name='balloons legally',
                partner_trade_name='balloons tradily',
                partner_cra_business_number=999999999,
                partner_bc_corporate_registry_number='abc1234567',
                partner_business_structure='General Partnership',
            ),
            PartnerOperatorIn(
                partner_legal_name='i am new',
                partner_trade_name='new',
                partner_cra_business_number=111111111,
                partner_business_structure='General Partnership',
                partner_bc_corporate_registry_number='ghj1234567',
            ),
        ]
        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.get(legal_name='Legal Name Example')
        assert updated_operator.partner_operators.count() == 2
        assert updated_operator.partner_operators.get(legal_name='balloons legally') is not None
        assert updated_operator.partner_operators.get(legal_name='i am new') is not None

    @staticmethod
    def test_update_operator_archive_all_partner_operators():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe('registration.tests.utils.partner_operator', bc_obps_operator=operator, _quantity=3)
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='General Partnership',
            cra_business_number=123456789,
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
            mailing_address=operator.mailing_address.id,
        )

        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.get(legal_name='Legal Name Example')
        assert updated_operator.partner_operators.count() == 0

    @staticmethod
    def test_update_operator_with_parent_operators():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe('registration.tests.utils.canadian_parent_operator', child_operator=operator, _quantity=2)

        baker.make_recipe('registration.tests.utils.foreign_parent_operator', child_operator=operator, _quantity=2)

        assert ParentOperator.objects.count() == 4
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number=123456789,
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            mailing_address=operator.mailing_address.id,
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
        )
        payload.parent_operators_array = [
            ParentOperatorIn(
                id=operator.parent_operators.first().id,
                po_legal_name='balloons legally',
                po_cra_business_number=999999999,
                po_mailing_address=operator.parent_operators.first().mailing_address.id,
                po_street_address='edited street address',
                po_municipality=operator.parent_operators.first().mailing_address.municipality,
                po_province=operator.parent_operators.first().mailing_address.province,
                po_postal_code=operator.parent_operators.first().mailing_address.postal_code,
            ),
            ParentOperatorIn(
                id=operator.parent_operators.last().id,
                po_legal_name='i used to be a foreign operator',
                po_cra_business_number=111111111,
                po_street_address='new',
                po_municipality='new',
                po_province='AB',
                po_postal_code='H0H0H0',
            ),
        ]
        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.get(legal_name='Legal Name Example')
        assert updated_operator.mailing_address.street_address == 'balloons'

        assert updated_operator.parent_operators.count() == 2
        parent_operator_1 = updated_operator.parent_operators.first()
        assert parent_operator_1.legal_name == 'balloons legally'
        assert parent_operator_1.mailing_address.street_address == 'edited street address'
        parent_operator_2 = updated_operator.parent_operators.last()
        assert parent_operator_2.legal_name == 'i used to be a foreign operator'
        assert parent_operator_2.mailing_address.street_address == 'new'

    @staticmethod
    def test_update_operator_delete_parent_operator_address():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe(
            'registration.tests.utils.canadian_parent_operator',
            child_operator=operator,
        )

        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number=123456789,
            legal_name=operator.legal_name,
            trade_name=operator.trade_name,
            bc_corporate_registry_number=operator.bc_corporate_registry_number,
            mailing_address=operator.mailing_address.id,
            street_address=operator.mailing_address.street_address,
            municipality=operator.mailing_address.municipality,
            province=operator.mailing_address.province,
            postal_code=operator.mailing_address.postal_code,
        )
        payload.parent_operators_array = [
            ParentOperatorIn(
                id=operator.parent_operators.first().id,
                po_mailing_address=operator.parent_operators.first().mailing_address.id,
                po_legal_name='balloons legally',
                foreign_address='foreign address',
                foreign_tax_id_number='5',
            ),
        ]
        OperatorService.update_operator(user.user_guid, payload)
        # the parent operator address record should have been archived, so only the operator address is left
        assert Address.objects.count() == 1

    @staticmethod
    def test_update_operator_archive_all_parent_operators():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe('registration.tests.utils.canadian_parent_operator', child_operator=operator, _quantity=2)

        baker.make_recipe('registration.tests.utils.foreign_parent_operator', child_operator=operator, _quantity=2)

        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number=123456789,
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            mailing_address=operator.mailing_address.id,
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
        )

        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.get(legal_name='Legal Name Example')
        assert updated_operator.parent_operators.count() == 0


class TestOperatorHasRequiredFields:
    @staticmethod
    def test_operator_has_all_required_fields():
        operator = baker.make_recipe('registration.tests.utils.operator')
        assert OperatorService.has_required_fields(operator) is True

    @staticmethod
    def test_operator_does_not_have_all_required_fields():
        # Create an operator with the required fields, but set legal_name to an empty string
        operator = baker.make_recipe(
            'registration.tests.utils.operator', legal_name=' '
        )  # Set legal_name to an empty string
        assert OperatorService.has_required_fields(operator) is False
