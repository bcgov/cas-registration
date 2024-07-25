from registration.models.facility_ownership_timeline import FacilityOwnershipTimeline
from registration.models.operation import Operation
from model_bakery import baker
from registration.models import UserOperator
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import facility_baker, operation_baker, operator_baker, user_operator_baker
from registration.utils import custom_reverse_lazy


class TestFacilityIdEndpoint(CommonTestSetup):
    # Helper
    
    # Define a mock payload for updating the facility
    mock_payload = {
        "name": "Updated Facility Name",
        "type": "Medium Facility",
        "well_authorization_numbers": [1, 2, 3],
        "street_address": "123 Updated St",
        "municipality": "Updated Municipality",
        "province": "ON",
        "postal_code": "A1A1A1",
        "latitude_of_largest_emissions": 43.57,
        "longitude_of_largest_emissions": -123.58
    }

    def create_and_authorize_operator(self):
        """
        Creates and authorizes an operator user for testing purposes.

        This method performs the following steps:
        1. **Create an Operator**: Uses the `operator_baker` to generate a new operator instance. This instance simulates a user who has certain roles and permissions.
        2. **Authorize the Operator User**: Uses `TestUtils.authorize_current_user_as_operator_user` to authorize the current test user as an operator user. This ensures that the user has the appropriate permissions to perform actions related to the operator.
        3. **Create an Owning Operation**: Uses `operation_baker` to create an operation associated with the created operator. This simulates the operational context in which the operator works.

        Returns:
        - Tuple: A tuple containing two elements:
            - `operator`: The created operator instance.
            - `owning_operation`: The created operation instance associated with the operator.
        """
        # Create an operator instance using the operator_baker function
        operator = operator_baker()
        
        # Authorize the current user as the created operator user
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        
        # Create an operation instance associated with the operator
        owning_operation = operation_baker(operator.id)
        
        # Return the created operator and operation instances
        return operator, owning_operation

    def create_facility_and_ownership(self, owning_operation):
        """
        Creates a facility and associates it with a given operation through FacilityOwnershipTimeline.

        This method performs the following steps:
        1. **Create a Facility**: Uses the `facility_baker` to generate a new facility instance. This instance represents the entity that will be updated or tested.
        2. **Associate Facility with Operation**: Uses `baker.make` to create a `FacilityOwnershipTimeline` instance that links the created facility with the provided operation. This sets up the ownership context for the facility, ensuring that it is associated with the specified operation.

        Parameters:
        - `owning_operation`: The operation instance that the facility will be associated with. This is typically created using `create_and_authorize_operator` or similar methods.

        Returns:
        - `facility`: The created facility instance.
        """
        # Create a facility instance using the facility_baker function
        facility = facility_baker()
        
        # Create an ownership timeline linking the facility with the provided operation
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)
        
        # Return the created facility instance
        return facility
    
    # GET
    def test_facilities_endpoint_unauthorized_roles_cannot_get(self):
        facility = facility_baker()
        # cas_pending can't get
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_pending", custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id})
        )
        assert response.status_code == 401

        # unapproved industry users can't get
        user_operator_instance = user_operator_baker(
            {
                'status': UserOperator.Statuses.PENDING,
            }
        )
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save()

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
        )
        assert response.status_code == 401

    def test_get_facility_with_invalid_facility_id(self):
        response = TestUtils.mock_get_with_auth_role(
            self, endpoint=custom_reverse_lazy("get_facility", kwargs={"facility_id": '99999'}), role_name="cas_admin"
        )
        assert response.status_code == 422
        assert (
            response.json().get('detail')[0].get('msg')
            == 'Input should be a valid UUID, invalid length: expected length 32 for simple format, found 5'
        )

    def test_industry_users_cannot_get_other_users_facilities(self):
        facility = facility_baker()
        baker.make(FacilityOwnershipTimeline, operation=operation_baker(), facility=facility)

        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
            role_name="industry_user",
        )
        assert response.status_code == 401
        assert response.json()['detail'] == 'Unauthorized.'


    def test_industry_users_can_get_their_own_facilities(self):
        # Arrange
        # Create an operator and authorize the current user as an operator user
        operator, owning_operation = self.create_and_authorize_operator()
        
        # Create a facility and link it to the owning operation
        facility = self.create_facility_and_ownership(owning_operation)

        # Act
        # Make a GET request to the "get_facility" endpoint as an "industry_user"
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
            role_name="industry_user",
        )

        # Assert
        # Check that the response status code is 200 (OK)
        assert response.status_code == 200
        
        # Check that the facility name is present in the response JSON
        assert response.json().get('name') is not None


    def test_facilities_endpoint_unauthorized_roles_cannot_get(self):
        facility = facility_baker()
        # cas_pending can't get
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_pending", custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id})
        )
        assert response.status_code == 401

        # unapproved industry users can't get
        user_operator_instance = user_operator_baker(
            {
                'status': UserOperator.Statuses.PENDING,
            }
        )
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save()

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
        )
        assert response.status_code == 401

    # PUT
    def test_facility_endpoint_authorized_users_can_update(self):
        # Arrange
        # Create an operator and authorize the current user as an operator user
        operator, owning_operation = self.create_and_authorize_operator()
        
        # Create a facility and link it to the owning operation
        facility = self.create_facility_and_ownership(owning_operation)

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Act
        # Make a PUT request to the "update_facility" endpoint with the mock payload using the utility method
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            self.mock_payload | {"operation_id": str(owning_operation.id)},  # Add operation_id to payload
            url
        )

        # Assert
        # Check that the response status code is 200 (OK)
        assert response.status_code == 200
        
        # Check that the facility name in the response JSON matches the updated name
        
        response_data = response.json()
        
        # Assert each field to ensure they match the updated values
        assert response_data.get('name') == "Updated Facility Name"
        assert response_data.get('type') == "Medium Facility"
        assert set(response_data.get('well_authorization_numbers')) == {1, 2, 3}
        assert response_data.get('street_address') == "123 Updated St"
        assert response_data.get('municipality') == "Updated Municipality"
        assert response_data.get('province') == "ON"
        assert response_data.get('postal_code') == "A1A1A1"
        assert float(response_data.get('latitude_of_largest_emissions')) == 43.57
        assert float(response_data.get('longitude_of_largest_emissions')) == -123.58


    def test_facility_endpoint_unauthorized_roles_cannot_update(self):
        # Arrange
        # Create an operator and authorize the current user as an operator user
        operator, owning_operation = self.create_and_authorize_operator()
        
        # Create a facility and link it to the owning operation
        facility = self.create_facility_and_ownership(owning_operation)

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define the roles that should not be allowed to update
        unauthorized_roles = ["cas_pending", "cas_analyst", "cas_admin"]

        # Act
        for role in unauthorized_roles:
            # Make a PUT request to the "update_facility" endpoint with the mock payload using the current role
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                self.mock_payload | {"operation_id": str(owning_operation.id)},  # Add operation_id to payload
                url
            )

        # Assert
        # Check that the response status code is 401 Unauthorized
        assert response.status_code == 401
        assert response.json().get('detail') == 'Unauthorized.'

    def test_facility_endpoint_unauthorized_users_cannot_update(self):
        # Arrange
        # create a new instance of the Facility model
        facility = facility_baker()

        # create a new instance of the Operation model
        operation=operation_baker()

        # link the  created facility with an operation
        baker.make(FacilityOwnershipTimeline, operation=operation, facility=facility)
        # DO NOT creates and authorizes an operator user...

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Act
        # Make a PUT request to the "update_facility" endpoint with the mock payload using the 'cas_pending' user
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self.mock_payload | {"operation_id": str(operation.id)},  # Add operation_id to payload
            url
        )

        assert response.status_code == 401
        assert response.json().get('detail') == 'Unauthorized.'


       