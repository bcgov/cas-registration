import pytest
import json
from datetime import datetime, timezone, timedelta
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import NaicsCode, NaicsCategory, Document, Contact, Operation, Operator
from registration.schema import OperationIn

pytestmark = pytest.mark.django_db

# initialize the APIClient app
client = Client()

base_endpoint = '/api/registration/'


def mock_postal_code():
    return 'v8v3g1'


baker.generators.add(CAPostalCodeField, mock_postal_code)


class TestNaicsCodeEndpoint:
    endpoint = base_endpoint + 'naics_codes'

    def test_get_method_for_200_status(self, client):
        response = client.get(self.endpoint)
        assert response.status_code == 200

    def test_get_method_with_mock_data(self, client):
        baker.make(NaicsCode, _quantity=2)

        response = client.get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 2


class TestNaicsCategoriesEndpoint:
    endpoint = base_endpoint + 'naics_categories'

    def test_get_method_for_200_status(self, client):
        response = client.get(self.endpoint)
        assert response.status_code == 200

    def test_get_method_with_mock_data(self, client):
        baker.make(NaicsCategory, _quantity=3)

        response = client.get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 3


class TestOperationsEndpoint:
    endpoint = base_endpoint + 'operations'

    def test_get_method_for_200_status(self, client):
        response = client.get(self.endpoint)
        assert response.status_code == 200

    def test_get_method_with_mock_data(self, client):
        baker.make(Operation, _quantity=1)
        response = client.get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 1

    def test_post_new_operation(self, client):
        naics_code = baker.make(NaicsCode)
        naics_category = baker.make(NaicsCategory)
        document = baker.make(Document)
        contact = baker.make(Contact, postal_code='V1V 1V1')
        operator = baker.make(Operator)
        print('NAICS')
        print(naics_code.id)
        print(naics_category.id)
        mock_operation = OperationIn(
            name='Springfield Nuclear Power Plant',
            type='Type 1',
            naics_code_id=naics_code.id,
            naics_category_id=naics_category.id,
            reporting_activities='donuts eaten',
            physical_street_address='19 Evergreen Terrace',
            physical_municipality='Springfield',
            physical_province='BC',
            physical_postal_code='V1V 1V1',
            legal_land_description='It\'s legal',
            latitude=90,
            longitude=-120,
            petrinex_ids=['123', '124'],
            regulated_products=[1, 2],
            documents=[document.id],
            contacts=[contact.id],
            operator_id=operator.id,
        )

        post_response = client.post(self.endpoint, content_type='application/json', data=mock_operation.json())
        assert post_response.status_code == 200
        assert post_response.json() == {"name": "Springfield Nuclear Power Plant"}
        # check that the default status of pending was applied
        get_response = client.get(self.endpoint).json()[0]
        assert 'status' in get_response and get_response['status'] == 'pending'

    def test_post_new_malformed_operation(self, client):
        response = client.post(self.endpoint, content_type='application/json', data={'garbage': 'i am bad data'})
        assert response.status_code == 422

    def test_put_operation_update_status_approved(self, client):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.PENDING

        url = self.endpoint + '/' + str(operation.id) + '/update-status'

        now = datetime.now(timezone.utc)
        put_response = client.put(url, content_type='application/json', data={"status": "approved"})
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode('utf-8'))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get('pk') == operation.id
        assert parsed_object.get('fields').get('status') == 'approved'

        get_response = client.get(self.endpoint + '/' + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get('status') == 'approved'
        now_as_string = now.strftime("%Y-%m-%d")
        assert get_response_dict.get('verified_at') == now_as_string

    def test_put_operation_update_status_rejected(self, client):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.PENDING

        url = self.endpoint + '/' + str(operation.id) + '/update-status'

        now = datetime.now(timezone.utc)
        put_response = client.put(url, content_type='application/json', data={"status": "rejected"})
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode('utf-8'))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get('pk') == operation.id
        assert parsed_object.get('fields').get('status') == 'rejected'

        get_response = client.get(self.endpoint + '/' + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get('status') == 'rejected'
        now_as_string = now.strftime("%Y-%m-%d")
        assert get_response_dict.get('verified_at') == now_as_string

    def test_put_operation_not_verified_when_not_registered(self, client):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.PENDING

        url = self.endpoint + '/' + str(operation.id) + '/update-status'

        put_response = client.put(url, content_type='application/json', data={"status": "not_registered"})
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode('utf-8'))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get('pk') == operation.id
        assert parsed_object.get('fields').get('status') == 'not_registered'

        get_response = client.get(self.endpoint + '/' + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get('status') == 'not_registered'
        assert get_response_dict.get('verified_at') is None

    def test_put_operation_update_status_invalid_data(self, client):
        def send_put_invalid_data():
            operation = baker.make(Operation)
            assert operation.status == Operation.Statuses.PENDING

            url = self.endpoint + '/' + str(operation.id) + '/update-status'

            client.put(url, content_type='application/json', data={"status": "nonsense"})

        with pytest.raises(AttributeError):
            send_put_invalid_data()


class TestOperationEndpoint:
    endpoint = base_endpoint + 'operations/1'

    def test_put_nonexistant_operation(self, client):
        response = client.get(self.endpoint)
        assert response.status_code == 404

    def test_get_method_for_200_status(self, client):
        naics_code = baker.make(NaicsCode)
        naics_category = baker.make(NaicsCategory)
        operator = baker.make(Operator)
        Operation.objects.create(
            id=1,
            name='Springfield Nuclear Power Plant',
            type='Type 1',
            naics_code_id=naics_code.id,
            naics_category_id=naics_category.id,
            reporting_activities='donuts eaten',
            physical_street_address='19 Evergreen Terrace',
            physical_municipality='Springfield',
            physical_province='BC',
            physical_postal_code='V1V 1V1',
            legal_land_description='It\'s legal',
            latitude=90,
            longitude=-120,
            operator_id=operator.id,
        )
        response = client.get(self.endpoint)
        assert response.status_code == 200

    def test_put_operation(self, client):
        naics_code = baker.make(NaicsCode)
        naics_category = baker.make(NaicsCategory)
        document = baker.make(Document)
        contact = baker.make(Contact, postal_code='V1V 1V1')
        operator = baker.make(Operator)
        Operation.objects.create(
            id=1,
            name='Springfield Nuclear Power Plant',
            type='Type 1',
            naics_code_id=naics_code.id,
            naics_category_id=naics_category.id,
            reporting_activities='donuts eaten',
            physical_street_address='19 Evergreen Terrace',
            physical_municipality='Springfield',
            physical_province='BC',
            physical_postal_code='V1V 1V1',
            legal_land_description='It\'s legal',
            latitude=90,
            longitude=-120,
            operator_id=operator.id,
        )

        mock_operation = OperationIn(
            name='New name',
            type='Type 1',
            naics_code_id=naics_code.id,
            naics_category_id=naics_category.id,
            reporting_activities='donuts eaten',
            physical_street_address='19 Evergreen Terrace',
            physical_municipality='Springfield',
            physical_province='BC',
            physical_postal_code='V1V 1V1',
            legal_land_description='It\'s legal',
            latitude=90,
            longitude=-120,
            petrinex_ids=['123', '124'],
            regulated_products=[1, 2],
            documents=[document.id],
            contacts=[contact.id],
            operator_id=operator.id,
        )

        response = client.put(self.endpoint, content_type='application/json', data=mock_operation.json())
        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

    def test_put_malformed_operation(self, client):
        response = client.put(self.endpoint, content_type='application/json', data={'garbage': 'i am bad data'})
        assert response.status_code == 422
