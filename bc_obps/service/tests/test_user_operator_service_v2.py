from itertools import cycle

import pytest
from model_bakery import baker

from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models import Operator, User, UserOperator
from registration.schema.v2.operator import OperatorIn
from registration.schema.v2.user_operator import UserOperatorFilterSchema
from service.user_operator_service_v2 import UserOperatorServiceV2

pytestmark = pytest.mark.django_db


class TestUserOperatorServiceV2:
    @staticmethod
    def test_save_operator():

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

    @staticmethod
    def test_list_user_operators_v2_industry_users_are_not_authorized():
        filters_1 = UserOperatorFilterSchema(
            user_friendly_id="1",
            status="pending",
            user__first_name="john",
            user__last_name="doe",
            user__email="john.doe@test.com",
            user__bceid_business_name="test business name",
            operator__legal_name="test legal name",
        )

        # make sure only irc user can access this
        industry_user = baker.make_recipe('utils.industry_operator_user')
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            UserOperatorServiceV2.list_user_operators_v2(
                user_guid=industry_user.user_guid, filters=filters_1, sort_field="created_at", sort_order="asc"
            )

    @staticmethod
    def test_list_user_operators_v2():

        # add some user operators
        baker.make_recipe(
            'utils.user_operator',
            user=cycle(baker.make_recipe('utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )
        baker.make_recipe(
            'utils.user_operator',
            user=cycle(baker.make_recipe('utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.DECLINED,
            _quantity=5,
        )
        baker.make_recipe(
            'utils.user_operator',
            user=cycle(baker.make_recipe('utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
            _quantity=5,
        )

        assert UserOperator.objects.count() == 15

        # Check filter status (we only care about status)
        filters_2 = UserOperatorFilterSchema(
            user_friendly_id="",
            status="admin",
            user__first_name="",
            user__last_name="",
            user__email="",
            user__bceid_business_name="",
            operator__legal_name="",
        )
        irc_user = baker.make_recipe('utils.irc_user')
        user_operators_with_admin_access_status = UserOperatorServiceV2.list_user_operators_v2(
            user_guid=irc_user.user_guid, filters=filters_2, sort_field="created_at", sort_order="asc"
        )
        assert user_operators_with_admin_access_status.count() == 5
        assert user_operators_with_admin_access_status.filter(status=UserOperator.Statuses.APPROVED).count() == 5

        # Check sorting
        filters_3 = filters_2.model_copy(
            update={"status": ""}
        )  # making a copy of filters_2 and updating status to empty string
        user_operators_sorted_by_created_at = UserOperatorServiceV2.list_user_operators_v2(
            user_guid=irc_user.user_guid, filters=filters_3, sort_field="created_at", sort_order="asc"
        )
        assert (
            user_operators_sorted_by_created_at.first().created_at
            < user_operators_sorted_by_created_at.last().created_at
        )
        user_operators_sorted_by_created_at_desc = UserOperatorServiceV2.list_user_operators_v2(
            user_guid=irc_user.user_guid, filters=filters_3, sort_field="created_at", sort_order="desc"
        )
        assert (
            user_operators_sorted_by_created_at_desc.first().created_at
            > user_operators_sorted_by_created_at_desc.last().created_at
        )
        user_operators_sorted_by_user_friendly_id = UserOperatorServiceV2.list_user_operators_v2(
            user_guid=irc_user.user_guid, filters=filters_3, sort_field="user_friendly_id", sort_order="asc"
        )
        assert (
            user_operators_sorted_by_user_friendly_id.first().user_friendly_id
            < user_operators_sorted_by_user_friendly_id.last().user_friendly_id
        )
        user_operators_sorted_by_status = UserOperatorServiceV2.list_user_operators_v2(
            user_guid=irc_user.user_guid, filters=filters_3, sort_field="status", sort_order="asc"
        )
        assert user_operators_sorted_by_status.first().status == UserOperator.Statuses.APPROVED
        assert user_operators_sorted_by_status.last().status == UserOperator.Statuses.PENDING
