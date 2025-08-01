from itertools import cycle
from unittest.mock import patch

import pytest
from model_bakery import baker
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models import Operator, UserOperator, Contact, BusinessRole
from registration.schema import OperatorIn, UserOperatorFilterSchema, UserOperatorStatusUpdate
from service.user_operator_service import UserOperatorService
from registration.enums.enums import AccessRequestStates, AccessRequestTypes

pytestmark = pytest.mark.django_db


class TestUserOperatorService:
    @staticmethod
    def test_save_operator():
        payload = OperatorIn(
            legal_name="Example Legal Name",
            trade_name="Example Trade Name",
            business_structure="General Partnership",
            cra_business_number="123456789",
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
        UserOperatorService.save_operator(payload, operator_instance)
        assert len(Operator.objects.all()) == 1
        assert Operator.objects.first().legal_name == payload.legal_name
        assert Operator.objects.first().trade_name == payload.trade_name
        assert Operator.objects.first().business_structure == payload.business_structure
        assert Operator.objects.first().cra_business_number == payload.cra_business_number
        assert Operator.objects.first().bc_corporate_registry_number == payload.bc_corporate_registry_number
        assert Operator.objects.first().status == Operator.Statuses.APPROVED

    @staticmethod
    def test_list_user_operators_industry_users_are_not_authorized():
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
        industry_user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            UserOperatorService.list_user_operators(
                user_guid=industry_user.user_guid, filters=filters_1, sort_field="created_at", sort_order="asc"
            )

    @staticmethod
    def test_list_user_operators():
        # add some user operators
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.REPORTER,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.DECLINED,
            _quantity=5,
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.PENDING,
            status=UserOperator.Statuses.PENDING,
            _quantity=5,
        )

        assert UserOperator.objects.count() == 20

        # Check filter role (we only care about role)
        filters_2 = UserOperatorFilterSchema(
            user_friendly_id="",
            role="admin",
            user__first_name="",
            user__last_name="",
            user__email="",
            user__bceid_business_name="",
            operator__legal_name="",
        )
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        user_operators_with_admin_access_role = UserOperatorService.list_user_operators(
            user_guid=cas_admin.user_guid, filters=filters_2, sort_field="role", sort_order="asc"
        )
        assert user_operators_with_admin_access_role.count() == 5
        assert user_operators_with_admin_access_role.filter(role=UserOperator.Roles.ADMIN).count() == 5

        # Check sorting
        filters_3 = filters_2.model_copy(
            update={"role": ""}
        )  # making a copy of filters_2 and updating role to empty string
        user_operators_sorted_by_user_friendly_id = UserOperatorService.list_user_operators(
            user_guid=cas_admin.user_guid, filters=filters_3, sort_field="user_friendly_id", sort_order="asc"
        )
        assert (
            user_operators_sorted_by_user_friendly_id.first().user_friendly_id
            < user_operators_sorted_by_user_friendly_id.last().user_friendly_id
        )
        user_operators_sorted_by_role = UserOperatorService.list_user_operators(
            user_guid=cas_admin.user_guid, filters=filters_3, sort_field="role", sort_order="asc"
        )
        assert user_operators_sorted_by_role.first().role == UserOperator.Roles.ADMIN
        assert user_operators_sorted_by_role.last().role == UserOperator.Roles.REPORTER

    @staticmethod
    @patch("service.user_operator_service.UserOperatorService.save_operator")
    @patch(
        "service.data_access_service.user_operator_service.UserOperatorDataAccessService.get_or_create_user_operator",
    )
    @patch("service.operator_service.OperatorService.update_operator")
    @patch("service.user_operator_service.send_operator_access_request_email")
    def test_create_operator_and_user_operator_with_new_contact(
        mock_email_service,
        mock_update_operator,
        mock_get_or_create_user_operator,
        mock_save_operator,
    ):
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        payload = OperatorIn(
            legal_name="Test",
            business_structure="BC Corporation",
            bc_corporate_registry_number="aaa1111111",
            cra_business_number="999999999",
            street_address="Test",
            municipality="Test",
            province="AB",
            postal_code="H0H0H0",
        )
        operator_instance = baker.make_recipe('registration.tests.utils.operator', status=Operator.Statuses.APPROVED)
        mock_save_operator.return_value = operator_instance

        user_operator_instance = baker.make_recipe(
            'registration.tests.utils.user_operator',
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            user=user,
            operator=operator_instance,
        )
        mock_get_or_create_user_operator.return_value = user_operator_instance, True

        mock_update_operator.return_value = None  # We don't care about the return value of this function
        UserOperatorService.create_operator_and_user_operator(user_guid=user.user_guid, payload=payload)

        mock_save_operator.assert_called_once()
        mock_get_or_create_user_operator.assert_called_once_with(user.user_guid, operator_instance.id)
        mock_update_operator.assert_called_once_with(user.user_guid, payload)

        assert Operator.objects.count() == 1
        assert Operator.objects.first().status == "Approved"
        assert Contact.objects.count() == 1
        assert Contact.objects.filter(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone_number=user.phone_number,
            position_title=user.position_title,
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
            operator_id=operator_instance.id,
        ).exists()

        # although the user_operator instance is being approved, we don't want to send an email
        # because the user just created the operator so it's obvious they would have access
        mock_email_service.assert_not_called()

    @staticmethod
    @patch("service.user_operator_service.UserOperatorService.save_operator")
    @patch(
        "service.data_access_service.user_operator_service.UserOperatorDataAccessService.get_or_create_user_operator"
    )
    @patch("service.operator_service.OperatorService.update_operator")
    def test_create_operator_and_user_operator_with_existing_contact(
        mock_update_operator, mock_get_or_create_user_operator, mock_save_operator
    ):
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        payload = OperatorIn(
            legal_name="Test",
            business_structure="BC Corporation",
            bc_corporate_registry_number="aaa1111111",
            cra_business_number="999999999",
            street_address="Test",
            municipality="Test",
            province="AB",
            postal_code="H0H0H0",
        )
        operator_instance = baker.make_recipe('registration.tests.utils.operator', status=Operator.Statuses.APPROVED)
        mock_save_operator.return_value = operator_instance

        user_operator_instance = baker.make_recipe(
            'registration.tests.utils.user_operator',
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            user=user,
            operator=operator_instance,
        )
        mock_get_or_create_user_operator.return_value = user_operator_instance, True

        mock_update_operator.return_value = None  # We don't care about the return value of this function

        baker.make_recipe(
            'registration.tests.utils.contact',
            email=user.email,
            first_name='changed name',
            last_name='changed also',
            operator=operator_instance,
        )

        UserOperatorService.create_operator_and_user_operator(user_guid=user.user_guid, payload=payload)

        mock_save_operator.assert_called_once()
        mock_get_or_create_user_operator.assert_called_once_with(user.user_guid, operator_instance.id)
        mock_update_operator.assert_called_once_with(user.user_guid, payload)

        assert Operator.objects.count() == 1
        assert Operator.objects.first().status == "Approved"
        assert Contact.objects.count() == 1
        contact = Contact.objects.first()
        assert contact.first_name == 'changed name'
        assert contact.last_name == 'changed also'
        assert Contact.objects.filter(
            first_name='changed name',
            last_name='changed also',
            email=user.email,
            operator_id=operator_instance.id,
        ).exists()

    @staticmethod
    @patch("service.user_operator_service.UserOperatorService.check_if_user_eligible_to_access_user_operator")
    def test_delete_user_operator(mock_check_if_user_eligible_to_access_user_operator):
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        user_operator = baker.make_recipe('registration.tests.utils.user_operator', user=user)

        # generate a random user_operator to make sure it is not deleted
        baker.make_recipe('registration.tests.utils.user_operator')

        UserOperatorService.delete_user_operator(user_guid=user.user_guid, user_operator_id=user_operator.id)

        mock_check_if_user_eligible_to_access_user_operator.assert_called_once_with(user.user_guid, user_operator.id)
        assert UserOperator.objects.count() == 1
        assert UserOperator.objects.filter(id=user_operator.id).exists() is False


class TestUpdateStatusAndCreateContact:
    @patch('service.user_operator_service.send_operator_access_request_email')
    def test_industry_user_cannot_approve_access_request_from_a_different_operator(self, mock_email_service):
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe('registration.tests.utils.user_operator')

        with pytest.raises(Exception, match='Your user is not associated with this operator.'):
            UserOperatorService.update_status_and_create_contact(
                pending_user_operator.id,
                UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
                approved_admin_user_operator.user.user_guid,
            )

        mock_email_service.assert_not_called()

    @staticmethod
    @patch('service.user_operator_service.send_operator_access_request_email')
    def test_operator_admin_declines_access_request(mock_email_service):
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator', operator=approved_admin_user_operator.operator
        )

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid

        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Declined', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )

        pending_user_operator.refresh_from_db()  # refresh the pending_user_operator object to get the updated status
        assert pending_user_operator.status == UserOperator.Statuses.DECLINED
        assert pending_user_operator.role == UserOperator.Roles.PENDING
        assert pending_user_operator.verified_by == approved_admin_user_operator.user

        mock_email_service.assert_called_once_with(
            AccessRequestStates.DECLINED,
            AccessRequestTypes.OPERATOR_WITH_ADMIN,
            approved_admin_user_operator.operator.legal_name,
            pending_user_operator.user.get_full_name(),
            pending_user_operator.user.email,
        )

    @staticmethod
    def test_cas_admin_undoes_approved_access_request():
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        previously_approved_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            operator=approved_admin_user_operator.operator,
            role=UserOperator.Roles.REPORTER,
        )

        previously_approved_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid
        UserOperatorService.update_status_and_create_contact(
            previously_approved_user_operator.id,
            UserOperatorStatusUpdate(status='Pending', role=UserOperator.Roles.PENDING),
            approved_admin_user_operator.user.user_guid,
        )

        previously_approved_user_operator.refresh_from_db()  # refresh the previously_approved_user_operator object to get the updated status
        assert previously_approved_user_operator.status == UserOperator.Statuses.PENDING
        assert previously_approved_user_operator.role == UserOperator.Roles.PENDING
        assert previously_approved_user_operator.verified_by is None

    @staticmethod
    def test_update_status_and_create_new_contact_success():
        industry_operator_user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
            first_name="Wednesday",
            last_name="Addams",
            email="wednesday.addams@email.com",
            phone_number='+16044011234',
            position_title="child",
        )
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            operator=approved_admin_user_operator.operator,
            user=industry_operator_user,
        )

        # Set some existing contacts to make sure the service doesn't override them
        pending_user_operator.operator.contacts.set(baker.make_recipe('registration.tests.utils.contact', _quantity=3))

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid

        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )
        pending_user_operator.refresh_from_db()  # refresh the pending_user_operator object to get the updated status
        assert pending_user_operator.status == UserOperator.Statuses.APPROVED
        assert pending_user_operator.role == UserOperator.Roles.ADMIN
        assert pending_user_operator.verified_by == approved_admin_user_operator.user

        assert Contact.objects.count() == 4
        assert pending_user_operator.operator.contacts.count() == 4
        assert Contact.objects.filter(first_name="Wednesday").exists()

    @staticmethod
    def test_update_status_and_update_existing_contact_success():
        industry_operator_user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
            first_name="Wednesday",
            last_name="Addams",
            email="wednesday.addams@email.com",
            phone_number='+16044011234',
            position_title="child",
        )
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            operator=approved_admin_user_operator.operator,
            user=industry_operator_user,
        )

        # Create an existing contact with the same email as the pending one (e.g., a user was approved, unapproved, and re-approved, and they changed their info somwhere in this process)
        baker.make_recipe(
            'registration.tests.utils.contact',
            first_name="Thursday",
            last_name="Addams",
            email="wednesday.addams@email.com",
            phone_number='+16044011234',
            position_title="child",
        )

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid

        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )
        pending_user_operator.refresh_from_db()  # refresh the pending_user_operator object to get the updated status
        assert pending_user_operator.status == UserOperator.Statuses.APPROVED
        assert pending_user_operator.role == UserOperator.Roles.ADMIN
        assert pending_user_operator.verified_by == approved_admin_user_operator.user

        assert pending_user_operator.operator.contacts.count() == 1
        assert Contact.objects.filter(first_name="Thursday").exists()

    @staticmethod
    def test_update_status_and_create_contact_does_not_create_duplicate_contacts():
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            operator=approved_admin_user_operator.operator,
        )

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid
        pending_user_operator.user.save()

        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )
        assert Contact.objects.count() == 1
        assert pending_user_operator.operator.contacts.count() == 1

        # Second call to the same function should not create duplicate contacts
        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )
        assert Contact.objects.count() == 1
        assert pending_user_operator.operator.contacts.count() == 1
