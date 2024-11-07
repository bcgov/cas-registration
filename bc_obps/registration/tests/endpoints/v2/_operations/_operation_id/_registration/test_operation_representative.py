from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationRepresentativePostEndpoint(CommonTestSetup):
    def test_users_cannot_update_other_users_operations(self):
        # authorize current user
        baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'utils.operation',
        )

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'existing_contact_id': 1,
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'test@email.com',
                'phone_number': '+16044011234',
                'position_title': 'Manager',
                'street_address': '123 Main St',
                'municipality': 'Vancouver',
                'province': 'BC',
                'postal_code': 'H0H 0H0',
            },
            custom_reverse_lazy("create_operation_representative", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401
        assert response.json().get('message') == 'Unauthorized.'

    def test_operation_representative_endpoint_existing_contact_changing_prohibited_fields(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        users_operator = approved_user_operator.operator
        operation = baker.make_recipe('utils.operation', operator=users_operator)
        contact = baker.make_recipe('utils.contact', address=None)
        users_operator.contacts.add(contact)
        data = {
            'existing_contact_id': contact.id,
            'phone_number': contact.phone_number,
            'position_title': contact.position_title,
            'street_address': "this is a new street address",
            'municipality': "this is a new municipality",
            'province': "BC",
            'postal_code': "H0H 0H0",
            # Below fields should not be updated
            'first_name': "trying to change first name",
            'last_name': "trying to change last name",
            'email': "trying.to.change@email.com",
        }
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            data,
            custom_reverse_lazy("create_operation_representative", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 400
        assert response.json().get('message') == "Cannot update first name, last name, or email of existing contact."

    def test_operation_representative_endpoint_existing_contact_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        users_operator = approved_user_operator.operator
        operation = baker.make_recipe('utils.operation', operator=users_operator)
        contact = baker.make_recipe('utils.contact', address=None)
        users_operator.contacts.add(contact)
        data = {
            'existing_contact_id': contact.id,
            'first_name': contact.first_name,
            'last_name': contact.last_name,
            'email': contact.email,
            'phone_number': contact.phone_number,
            'position_title': contact.position_title,
            'street_address': "this is a new street address",
            'municipality': "this is a new municipality",
            'province': "BC",
            'postal_code': "H0H 0H0",
        }
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            data,
            custom_reverse_lazy("create_operation_representative", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 200
        assert response.json().get('id') == contact.id
        operation_contact = operation.contacts.get(id=contact.id)
        assert operation_contact.first_name == contact.first_name
        assert operation_contact.last_name == contact.last_name
        assert operation_contact.email == contact.email
        assert operation_contact.phone_number == contact.phone_number
        assert operation_contact.position_title == contact.position_title

        operation_contact_address = operation_contact.address
        assert operation_contact_address.street_address == "this is a new street address"
        assert operation_contact_address.municipality == "this is a new municipality"
        assert operation_contact_address.province == "BC"
        assert operation_contact_address.postal_code == "H0H 0H0"

    def test_operation_representative_endpoint_new_contact_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@email.com',
            'phone_number': '+16044011234',
            'position_title': 'Manager',
            'street_address': '123 Main St',
            'municipality': 'Vancouver',
            'province': 'BC',
            'postal_code': 'H0H 0H0',
        }
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            data,
            custom_reverse_lazy("create_operation_representative", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 200
        response_json = response.json()
        new_contact_id = response_json.get('id')
        assert new_contact_id is not None
        operation_contact = operation.contacts.get(id=new_contact_id)
        assert operation_contact.first_name == 'John'
        assert operation_contact.last_name == 'Doe'
        assert operation_contact.email == 'test@email.com'
        assert operation_contact.phone_number == '+16044011234'
        assert operation_contact.position_title == 'Manager'
        new_contact_address = operation_contact.address
        assert new_contact_address.street_address == '123 Main St'
        assert new_contact_address.municipality == 'Vancouver'
        assert new_contact_address.province == 'BC'
        assert new_contact_address.postal_code == 'H0H 0H0'
        assert approved_user_operator.operator.contacts.filter(id=new_contact_id).exists()

    def test_register_operation_operation_representative_endpoint_bad_data(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {'bad_data': 'I am bad data'},
            custom_reverse_lazy("create_operation_representative", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 422


class TestOperationRepresentativePutEndpoint(CommonTestSetup):
    def test_users_cannot_update_other_users_operations(self):
        # authorize current user
        baker.make_recipe('utils.approved_user_operator', user=self.user)
        # create operation not belonging to current user
        operation = baker.make_recipe(
            'utils.operation',
        )

        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {'id': 1},
            custom_reverse_lazy("remove_operation_representative", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401
        assert response.json().get('message') == 'Unauthorized.'

    def test_remove_operation_representative_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        users_operator = approved_user_operator.operator
        operation = baker.make_recipe('utils.operation', operator=users_operator)
        contact = baker.make_recipe('utils.contact')
        users_operator.contacts.add(contact)
        data = {
            'id': contact.id,
        }
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            data,
            custom_reverse_lazy("remove_operation_representative", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 200
        assert response.json() == contact.id
        assert operation.contacts.count() == 0

    def test_remove_operation_representative_endpoint_bad_data(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {'bad_data': 'I am bad data'},
            custom_reverse_lazy("remove_operation_representative", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 422
