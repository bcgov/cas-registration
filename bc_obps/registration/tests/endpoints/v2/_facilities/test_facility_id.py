import math
from datetime import datetime
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from model_bakery import baker
from registration.models import Facility, Operation, WellAuthorizationNumber
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operation_baker, operator_baker
from registration.utils import custom_reverse_lazy


class TestFacilityIdEndpoint(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        # mock payloads
        self.mock_payload_with_mandatory_data = {
            "name": "Facility Name",
            "type": "Medium Facility",
            "latitude_of_largest_emissions": 43.57,
            "longitude_of_largest_emissions": -123.58,
        }

        self.mock_payload_with_all_data = {
            "name": "Updated Facility Name",
            "type": "Large Facility",
            "well_authorization_numbers": [1, 2, 3],
            "is_current_year": True,
            "starting_date": "2024-07-07T09:00:00.000Z",
            "street_address": "123 Updated St",
            "municipality": "Updated Municipality",
            "province": "ON",
            "postal_code": "A1A1A1",
            "latitude_of_largest_emissions": 3.57,
            "longitude_of_largest_emissions": 123.58,
        }

    @staticmethod
    def _assert_updated_mandatory_fields(response_data, payload):
        """
        Asserts that the fields in the response data match the expected values from the payload.

        Args:
            response_data (dict): The data returned from the response, typically a JSON object.
            payload (dict): The expected data values to compare against.

        Asserts:
            - The 'name' field in response_data matches the 'name' field in payload.
            - The 'type' field in response_data matches the 'type' field in payload.
            - The 'latitude_of_largest_emissions' field in response_data is close to the corresponding value in payload.
            - The 'longitude_of_largest_emissions' field in response_data is close to the corresponding value in payload.

        Raises:
            AssertionError: If any of the assertions fail.
        """
        assert response_data.get('name') == payload.get('name'), "Name does not match"
        assert response_data.get('type') == payload.get('type'), "Type does not match"
        assert math.isclose(
            float(response_data.get('latitude_of_largest_emissions')),
            float(payload.get('latitude_of_largest_emissions')),
            rel_tol=1e-5,
        ), "Latitude of largest emissions does not match"
        assert math.isclose(
            float(response_data.get('longitude_of_largest_emissions')),
            float(payload.get('longitude_of_largest_emissions')),
            rel_tol=1e-5,
        ), "Longitude of largest emissions does not match"

    # GET
    def test_industry_users_can_get_their_own_facilities(self):

        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        owning_operation: Operation = operation_baker(operator.id)
        facility = baker.make_recipe('utils.facility')

        baker.make(FacilityDesignatedOperationTimeline, operation=owning_operation, facility=facility)
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
            role_name="industry_user",
        )
        assert response.status_code == 200
        assert response.json().get('name') is not None

    def test_industry_users_cannot_get_other_users_facilities(self):
        facility = baker.make_recipe('utils.facility')
        baker.make(FacilityDesignatedOperationTimeline, operation=operation_baker(), facility=facility)

        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
            role_name="industry_user",
        )
        assert response.status_code == 401
        assert response.json()['detail'] == 'Unauthorized'

    # PUT
    def test_unauthorized_users_cannot_update(self):
        # Arrange
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(self)

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self.mock_payload_with_mandatory_data | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 401
        assert response.json().get('detail') == 'Unauthorized'

    def test_authorized_users_can_update_mandatory_data(self):
        # Arrange
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define a payload
        payload = self.mock_payload_with_mandatory_data

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Assert Updated mandatory Fields
        self._assert_updated_mandatory_fields(response_data, payload)

        # Assert Non-Updated Optional Fields
        assert response_data.get('is_current_year') is None
        assert response_data.get('starting_date') is None
        assert response_data.get('well_authorization_numbers') == []
        assert response_data.get('street_address') is None
        assert response_data.get('municipality') is None
        assert response_data.get('province') is None
        assert response_data.get('postal_code') is None

        # Assert Updated State
        TestUtils.assert_facility_db_state(Facility.objects.first())

    def test_authorized_users_can_update_all_data(self):
        # Arrange
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define a payload
        payload = self.mock_payload_with_all_data

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Assert Updated mandatory Fields
        self._assert_updated_mandatory_fields(response_data, payload)

        # Assert Updated Optional Fields
        assert response_data.get('is_current_year') == payload.get('is_current_year')
        assert datetime.strptime(
            response_data.get('starting_date'),
            "%Y-%m-%dT%H:%M:%S.%fZ" if "." in response_data.get('starting_date') else "%Y-%m-%dT%H:%M:%SZ",
        ) == datetime.strptime(
            payload.get('starting_date'),
            "%Y-%m-%dT%H:%M:%S.%fZ" if "." in payload.get('starting_date') else "%Y-%m-%dT%H:%M:%SZ",
        )

        assert len(response_data.get('well_authorization_numbers')) == len(payload.get('well_authorization_numbers'))
        assert sorted(response_data['well_authorization_numbers']) == sorted(payload['well_authorization_numbers'])
        assert response_data.get('street_address') == payload.get('street_address')
        assert response_data.get('municipality') == payload.get('municipality')
        assert response_data.get('province') == payload.get('province')
        assert response_data.get('postal_code') == payload.get('postal_code')

        # Assert Updated State
        TestUtils.assert_facility_db_state(
            Facility.objects.first(),
            expect_address=Facility.objects.first().address,
            expect_well_authorization_numbers=len(response_data.get('well_authorization_numbers')),
        )

    def test_authorized_users_can_update_address(self):
        # Arrange
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(
            self, authorize_user=True, with_address=True
        )

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_address=facility.address)

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define a payload
        payload = self.mock_payload_with_mandatory_data.copy()
        payload["street_address"] = "My Street"  # Add one address property to payload

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Assert Updated mandatory Fields
        self._assert_updated_mandatory_fields(response_data, payload)

        # Assert Updated Optional Fields
        assert response_data.get('street_address') == payload.get('street_address')
        assert response_data.get('municipality') is None
        assert response_data.get('province') is None
        assert response_data.get('postal_code') is None

        # Assert Updated State
        TestUtils.assert_facility_db_state(Facility.objects.first(), expect_address=Facility.objects.first().address)

    def test_authorized_users_can_remove_address(self):
        # Arrange
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(
            self, authorize_user=True, with_address=True
        )

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_address=facility.address)

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define a payload
        payload = self.mock_payload_with_mandatory_data  # no address keys

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Assert Updated mandatory Fields
        self._assert_updated_mandatory_fields(response_data, payload)

        # Assert Updated Optional Fields
        assert response_data.get('street_address') is None
        assert response_data.get('municipality') is None
        assert response_data.get('province') is None
        assert response_data.get('postal_code') is None

        # Assert Updated State
        TestUtils.assert_facility_db_state(Facility.objects.first())

    def test_authorized_users_can_update_well_authorization_numbers(self):
        # Arrange
        well_auth_numbers = [123456789, 987654321]
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(
            self, authorize_user=True, facility_well_authorization_numbers=well_auth_numbers
        )

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_well_authorization_numbers=len(well_auth_numbers))

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define a payload
        payload = self.mock_payload_with_mandatory_data.copy()
        payload["well_authorization_numbers"] = [1, 2, 3]  # updates to well_authorization_numbers

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Assert Updated mandatory Fields
        self._assert_updated_mandatory_fields(response_data, payload)

        # Assert Updated Optional Fields
        assert len(response_data.get('well_authorization_numbers')) == len(payload.get('well_authorization_numbers'))
        assert sorted(response_data['well_authorization_numbers']) == sorted(payload['well_authorization_numbers'])

        # Assert Updated State
        TestUtils.assert_facility_db_state(
            Facility.objects.first(),
            expect_well_authorization_numbers=len(response_data.get('well_authorization_numbers')),
        )

    def test_authorized_users_can_remove_well_authorization_numbers(self):
        # Arrange
        well_auth_numbers = [123456789, 987654321]
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(
            self, authorize_user=True, facility_well_authorization_numbers=well_auth_numbers
        )

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_well_authorization_numbers=len(well_auth_numbers))

        # Construct the URL for the update_facility endpoint with the facility ID
        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define a payload
        payload = self.mock_payload_with_mandatory_data  # no well_authorization_numbers

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Assert Updated mandatory Fields
        self._assert_updated_mandatory_fields(response_data, payload)

        # Assert Updated Optional Fields
        assert len(response_data.get('well_authorization_numbers')) == 0

        # Assert Updated State
        TestUtils.assert_facility_db_state(Facility.objects.first(), expect_well_authorization_numbers=0)

    def test_authorized_users_cannot_update_with_duplicate_well_authorization_numbers(self):
        # Arrange
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define a payload
        payload = self.mock_payload_with_mandatory_data.copy()
        payload["well_authorization_numbers"] = [1, 1, 2, 3]  # Duplicate value 1

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 400
        assert response.json().get('message') == 'Well Authorization Number: Duplicates are not allowed.'

    def test_authorized_users_cannot_update_with_existing_well_authorization_numbers(self):
        # Arrange
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        # Create well authorization numbers
        well_auth_numbers = [123456789, 987654321]
        # Create WellAuthorizationNumber objects
        WellAuthorizationNumber.objects.bulk_create(
            WellAuthorizationNumber(well_authorization_number=num) for num in well_auth_numbers
        )
        assert WellAuthorizationNumber.objects.count() == len(well_auth_numbers)

        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Define a payload
        payload = self.mock_payload_with_mandatory_data.copy()
        payload["well_authorization_numbers"] = [123456789]  # existing value

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 422
        assert (
            response.json().get('message')
            == 'Well Authorization Number: Well authorization number with this Well authorization number already exists.'
        )

    def test_authorized_users_cannot_update_with_malformed_data(self):
        # Arrange
        _, owning_operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        # Define a payload
        payload = self.mock_payload_with_mandatory_data.copy()
        payload['latitude_of_largest_emissions'] = "I am a string"  # malformed integer

        url = custom_reverse_lazy("update_facility", kwargs={"facility_id": facility.id})

        # Act

        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            payload | {"operation_id": str(owning_operation.id)},
            url,
        )

        # Assert
        assert response.status_code == 422
        assert response.json().get('detail')[0].get('msg') == 'Input should be a valid decimal'
