import pytest
import json
from registration.api import OperationIn, OperationSchema
from model_bakery import baker
from django.test import Client
from registration.models import NaicsCode, NaicsCategory, Operation, Operator
from django.test import TestCase
from localflavor.ca.models import CAPostalCodeField
from registration.models import NaicsCode, NaicsCategory, Document, Contact, Operation, Operator

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
        mock_operation = OperationIn(
            name='Springfield Nucular Power Plant',
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
            status='Pending',
            operator_id=operator.id,
        )

        response = client.post(self.endpoint, content_type='application/json', data=mock_operation.json())
        assert response.status_code == 200
        assert response.json() == {"name": "Springfield Nucular Power Plant"}

    def test_post_new_malformed_operation(self, client):
        response = client.post(self.endpoint, content_type='application/json', data={'garbage': 'i am bad data'})
        assert response.status_code == 422


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
            name='Springfield Nucular Power Plant',
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
            status='Pending',
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
            name='Springfield Nucular Power Plant',
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
            status='Pending',
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
            status='Pending',
            operator_id=operator.id,
        )

        response = client.put(self.endpoint, content_type='application/json', data=mock_operation.json())
        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

    def test_put_malformed_operation(self, client):
        response = client.put(self.endpoint, content_type='application/json', data={'garbage': 'i am bad data'})
        assert response.status_code == 422
