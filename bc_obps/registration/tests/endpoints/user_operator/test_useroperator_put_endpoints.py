from typing import List
from common.enums import AccessRequestStates, AccessRequestTypes
from common.service.email.email_service import EmailService
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    BusinessRole,
    BusinessStructure,
    Contact,
    Operator,
    ParentOperator,
    User,
    UserOperator,
)
from registration.tests.utils.bakers import (
    operator_baker,
    user_operator_baker,
    parent_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestUserOperatorPutEndpoint(CommonTestSetup):
    def test_user_operator_put_cannot_update_status_when_operator_not_approved(self):
        user = baker.make(User)

        operator = operator_baker()
        operator.status = Operator.Statuses.PENDING
        operator.save(update_fields=['status'])
        user_operator = user_operator_baker()
        user_operator.user_id = user.user_guid
        user_operator.operator = operator
        user_operator.save(update_fields=['user_id', 'operator_id'])

        response_1 = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": UserOperator.Statuses.APPROVED, "user_operator_id": user_operator.id},
            custom_reverse_lazy('update_user_operator_status'),
        )
        # make sure user can't change the status of a user_operator when operator is not approved
        assert response_1.status_code == 400
        response_1_json = response_1.json()
        assert response_1_json == {'message': 'Operator must be approved before approving or declining users.'}

    def test_industry_user_can_update_status_of_a_user_operator(self, mocker):
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        subsequent_user_operator = baker.make(UserOperator, operator=operator)
        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, 'send_operator_access_request_email'
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": subsequent_user_operator.id,
            },
            custom_reverse_lazy('update_user_operator_status'),
        )
        # Assert that the email notification was called
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.APPROVED,
            AccessRequestTypes.OPERATOR_WITH_ADMIN,
            operator.legal_name,
            subsequent_user_operator.user.get_full_name(),
            subsequent_user_operator.user.email,
        )
        assert response.status_code == 200

    def test_industry_user_cannot_update_status_of_a_user_operator_from_a_different_operator(self):
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        other_operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        other_user_operator = baker.make(UserOperator, operator=other_operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": other_user_operator.id,
            },
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response.status_code == 403

    def test_cas_admin_can_update_status_of_a_user_operator(self, mocker):
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        user_operator = user_operator_baker({'operator': operator})
        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, 'send_operator_access_request_email'
        )
        response_2 = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {
                "role": UserOperator.Roles.ADMIN,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": user_operator.id,
            },
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response_2.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.APPROVED
        assert user_operator.role == UserOperator.Roles.ADMIN
        assert user_operator.verified_by == self.user
        # Assert that the email notification was called
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.APPROVED,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            user_operator.user.get_full_name(),
            user_operator.user.email,
        )

    def test_user_operator_put_decline_rejects_everything(self, mocker):
        user = baker.make(User)
        operator = operator_baker()
        operator.status = Operator.Statuses.APPROVED
        operator.is_new = False
        operator.save(update_fields=['status', 'is_new'])
        user_operator = user_operator_baker()
        user_operator.user_id = user.user_guid
        user_operator.operator = operator
        user_operator.save(update_fields=['user_id', 'operator_id'])
        # Assigning contacts to the operator of the user_operator
        contacts = baker.make(
            Contact,
            _quantity=2,
            created_by=user_operator.user,
            business_role=BusinessRole.objects.get(role_name='Senior Officer'),
        )
        user_operator.operator.contacts.set(contacts)
        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, 'send_operator_access_request_email'
        )
        # Now decline the user_operator and make sure the contacts are deleted
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": UserOperator.Statuses.DECLINED, "user_operator_id": user_operator.id},
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.DECLINED
        assert user_operator.role == UserOperator.Roles.PENDING
        assert user_operator.verified_by == self.user
        assert user_operator.operator.contacts.count() == 0
        assert Contact.objects.count() == 0
        # Assert that the email notification was sent
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.DECLINED,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            user_operator.user.get_full_name(),
            user_operator.user.email,
        )

    def test_edit_and_archive_parent_operators(self):
        child_operator = operator_baker()
        user_operator = baker.make(
            UserOperator, operator=child_operator, user=self.user, role='admin', status='Approved'
        )

        parent_operator_1 = parent_operator_baker()
        parent_operator_1.child_operator_id = child_operator.id
        parent_operator_1.operator_index = 1
        parent_operator_1.save(update_fields=["child_operator_id", "operator_index"])

        parent_operator_2 = parent_operator_baker()
        parent_operator_2.child_operator_id = child_operator.id
        parent_operator_2.operator_index = 2
        parent_operator_2.save(update_fields=["child_operator_id", "operator_index"])

        unrelated_parent_operator = parent_operator_baker()
        unrelated_parent_operator.legal_name = 'i should not be deleted'
        unrelated_parent_operator.operator_index = 1
        unrelated_parent_operator.save(update_fields=["legal_name", "operator_index"])

        mock_payload = {
            "legal_name": "New Operator",
            "trade_name": "New Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": True,
            "parent_operators_array": [
                {
                    "po_legal_name": "test po legal name-EDITED",
                    "po_cra_business_number": 123456789,
                    "po_bc_corporate_registry_number": "poo7654321",
                    "po_business_structure": BusinessStructure.objects.first().pk,
                    "po_website": "https://testpo.com",
                    "po_physical_street_address": "test po physical street address",
                    "po_physical_municipality": "test po physical municipality",
                    "po_physical_province": "ON",
                    "po_physical_postal_code": "H0H0H0",
                    "po_mailing_address_same_as_physical": True,
                    "operator_index": 2,
                },
            ],
        }
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )
        assert response.status_code == 200

        parent_operators: List[ParentOperator] = child_operator.parent_operators.all()

        assert len(parent_operators) == 1  # archived records are not pulled

        # parent_operator_1 has been archived
        parent_operator_1.refresh_from_db()
        assert parent_operator_1.operator_index == 1
        assert parent_operator_1.archived_by is not None
        assert parent_operator_1.archived_at is not None

        # parent_operator_2 has been edited
        assert parent_operators[0].legal_name == "test po legal name-EDITED"
        assert parent_operators[0].operator_index == 2
        assert parent_operators[0].archived_by is None
        assert parent_operators[0].archived_at is None

        # unrelated_parent_operator has the same id as parent_operator_1 and should be left alone as it doesn't belong to the child operator
        unrelated_parent_operator.refresh_from_db()
        assert unrelated_parent_operator.legal_name == 'i should not be deleted'

    def remove_all_parent_operators(self):
        child_operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=child_operator, user=self.user)

        parent_operator_1 = parent_operator_baker()
        parent_operator_1.child_operator_id = child_operator.id
        parent_operator_1.operator_index = 1
        parent_operator_1.save(update_fields=["child_operator_id", "operator_index"])

        parent_operator_2 = parent_operator_baker()
        parent_operator_2.child_operator_id = child_operator.id
        parent_operator_2.operator_index = 2
        parent_operator_2.save(update_fields=["child_operator_id", "operator_index"])

        unrelated_parent_operator = parent_operator_baker()
        unrelated_parent_operator.legal_name = 'i should not be deleted'
        unrelated_parent_operator.operator_index = 1
        unrelated_parent_operator.save(update_fields=["legal_name", "operator_index"])

        mock_payload = {
            "legal_name": "New Operator",
            "trade_name": "New Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": True,
            "parent_operators_array": [
                {},
            ],
        }
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            f"{self.user_operator_endpoint}/operator/{user_operator.id}",
        )
        assert response.status_code == 200

        parent_operators: List[ParentOperator] = child_operator.parent_operators.all()

        assert len(parent_operators) == 0  # archived records are not pulled

        # parent_operator_1 has been archived
        parent_operator_1.refresh_from_db()
        assert parent_operator_1.operator_index == 1
        assert parent_operator_1.archived_by is not None
        assert parent_operator_1.archived_at is not None

        # parent_operator_2 has been archived
        parent_operator_2.refresh_from_db()
        assert parent_operator_2.operator_index == 2
        assert parent_operator_2.archived_by is not None
        assert parent_operator_2.archived_at is not None

        # unrelated_parent_operator has the same id as parent_operator_1 and should be left alone as it doesn't belong to the child operator
        unrelated_parent_operator.refresh_from_db()
        assert unrelated_parent_operator.archived_by is None
        assert unrelated_parent_operator.archived_at is None

    ## STATUS
    def test_draft_status_changes_to_pending(self):
        operator = operator_baker()
        operator.created_by = self.user
        operator.status = 'Draft'
        operator.save(update_fields=["created_by", "status"])
        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        mock_payload = {
            "legal_name": "Put Operator Legal Name",
            "trade_name": "Put Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "abc1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "V0V0V0",
            "operator_has_parent_operators": True,
            "parent_operators_array": [],
        }
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )

        assert put_response.status_code == 200
        operator.refresh_from_db()
        assert operator.status == 'Pending'

    def test_put_user_operator_operator(self):
        operator = operator_baker()
        operator.created_by = self.user
        operator.save(update_fields=["created_by"])
        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        mock_payload = {
            "legal_name": "Put Operator Legal Name",
            "trade_name": "Put Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "abc1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "V0V0V0",
            "operator_has_parent_operators": False,
            "parent_operators_array": [],
        }
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )

        response_json = put_response.json()
        assert put_response.status_code == 200
        assert "user_operator_id" in response_json
        user_operator_id = response_json["user_operator_id"]
        user_operator = UserOperator.objects.get(id=user_operator_id)
        assert user_operator.user == self.user

        operator: Operator = user_operator.operator
        assert operator is not None
        assert operator.updated_by == self.user
        assert operator.updated_at is not None
        assert mock_payload == {
            "legal_name": operator.legal_name,
            "trade_name": operator.trade_name,
            "cra_business_number": operator.cra_business_number,
            "bc_corporate_registry_number": operator.bc_corporate_registry_number,
            "business_structure": operator.business_structure.pk,
            "physical_street_address": operator.physical_address.street_address,
            "physical_municipality": operator.physical_address.municipality,
            "physical_province": operator.physical_address.province,
            "physical_postal_code": operator.physical_address.postal_code,
            "mailing_address_same_as_physical": operator.mailing_address_id == operator.physical_address_id,
            "mailing_street_address": operator.mailing_address.street_address,
            "mailing_municipality": operator.mailing_address.municipality,
            "mailing_province": operator.mailing_address.province,
            "mailing_postal_code": operator.mailing_address.postal_code,
            "operator_has_parent_operators": operator.parent_operators.exists(),
            "parent_operators_array": list(operator.parent_operators.all()),
        }

    def test_put_user_operator_operator_with_an_existing_cra_business_number(self):
        self.user.role = 'industry_user'
        existing_operator = operator_baker()
        new_operator = operator_baker({'created_by': self.user})
        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=new_operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        mock_payload = {
            "legal_name": "Put Operator Legal Name",
            "trade_name": "Put Operator Trade Name",
            "cra_business_number": existing_operator.cra_business_number,
            "bc_corporate_registry_number": "abc1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "V0V0V0",
            "operator_has_parent_operators": False,
            "parent_operators_array": [],
        }
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )

        response_json = put_response.json()
        assert put_response.status_code == 400
        assert response_json == {"message": "Operator with this CRA Business Number already exists."}

    def test_put_user_operator_operator_unauthorized(self):
        operator = operator_baker()
        operator.created_by = self.user
        operator.save(update_fields=["created_by"])
        mock_payload = {
            "legal_name": "Unauthorized",
            "trade_name": "Unauthorized",
            "cra_business_number": 678123654,
            "bc_corporate_registry_number": "jkl1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "add",
            "physical_municipality": "add",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        user_operator = baker.make(
            UserOperator, user=self.user, operator=operator, role=UserOperator.Roles.REPORTER, created_by=self.user
        )
        # Test REPORTER 401
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )
        user_operator.role = UserOperator.Roles.PENDING
        user_operator.save(update_fields=["role"])
        # Test PENDING 401
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )

        assert put_response.status_code == 401

    def test_put_user_operator_operator_malformed_data(self):
        operator = operator_baker()
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {"junk_data": "junk"},
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': operator.id}),
        )

        assert put_response.status_code == 422

    def test_put_duplicates_not_allowed(self):
        operator_1 = operator_baker()
        operator_2 = operator_baker()

        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=operator_2,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        # duplicate legal name
        payload_with_duplicate_legal_name = {
            "legal_name": operator_1.legal_name,
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        put_response_duplicate_legal_name = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload_with_duplicate_legal_name,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )
        assert put_response_duplicate_legal_name.status_code == 422
        assert put_response_duplicate_legal_name.json() == {
            'message': 'Legal Name: Operator with this Legal name already exists.'
        }
