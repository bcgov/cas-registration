from registration.schema.v1.facility import FacilityIn
import pytest
from registration.models.app_role import AppRole
from registration.tests.utils.bakers import (
    address_baker,
    facility_baker,
    operation_baker,
)
from registration.models.well_authorization_number import WellAuthorizationNumber
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.facility_ownership_timeline import FacilityOwnershipTimeline
from registration.models.facility import Facility
from registration.models.operation import Operation
from registration.models.user import User
from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import operator_baker
from service.facility_service import FacilityService
from model_bakery import baker
from registration.models import Address
from registration.tests.utils.helpers import TestUtils

pytestmark = pytest.mark.django_db

class TestGetIfAuthorized:
    @staticmethod
    def test_get_if_authorized_cas_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_analyst"))

        facility = facility_baker()
        baker.make(FacilityOwnershipTimeline, operation=operation_baker(), facility=facility)

        result = FacilityService.get_if_authorized(user.user_guid, facility.id)
        assert result == facility

    @staticmethod
    def test_get_if_authorized_industry_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = operation_baker(operator.id)
        facility = facility_baker()
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)

        result = FacilityService.get_if_authorized(user.user_guid, facility.id)
        assert result == facility

    @staticmethod
    def test_get_if_authorized_industry_user_fail():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        owning_operator = operator_baker()
        random_operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=random_operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = operation_baker(owning_operator.id)
        facility = baker.make(Facility, latitude_of_largest_emissions=5, longitude_of_largest_emissions=5)
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.get_if_authorized(user.user_guid, facility.id)


class TestCreateFacilityWithOwnership:
    @staticmethod
    def test_create_sfo_facility_with_ownership_without_address():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = operation_baker(operator.id)

        payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )

        FacilityService.create_facility_with_ownership(user.user_guid, payload)
        assert Facility.objects.count() == 1

        assert Address.objects.count() == 1  # operation_baker() creates an address (mandatory for the operator)
        assert len(FacilityOwnershipTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None

    @staticmethod
    def test_create_lfo_facility_with_ownership_with_address():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = operation_baker(operator.id)
        payload = FacilityIn(
            street_address='123 street',
            municipality='city',
            province='AB',
            postal_code='H0H0H0',
            name='zip',
            type='Large Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            well_authorization_numbers=[12345, 654321],
        )

        FacilityService.create_facility_with_ownership(user.user_guid, payload)
        assert len(Facility.objects.all()) == 1
        assert (
            Address.objects.count() == 2
        )  # 2 because operation_baker() created an address (mandatory) for the operator
        assert WellAuthorizationNumber.objects.count() == 2
        assert len(FacilityOwnershipTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None


class TestUpdateFacility:
    @staticmethod
    def test_update_facility_unauthorized():        
        # create a new instance of User model
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))  
        # create a new instance of the Operator model
        operator = operator_baker()
        # DO NOT authorize the Operator User
        
        # create an Owning Operation
        owning_operation = operation_baker(operator.id)
        # create a new instance of the Facility model
        facility = facility_baker()  # Facility without address
        # link the created facility with an operation
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)
       
       
        # create facility payload
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        # user cannot update the facility
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):        
            FacilityService.update_facility(user.user_guid, facility.id, facility_payload)

    @staticmethod
    def test_update_facility_without_address():        
        # create a new instance of User model
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))  
        # create a new instance of the Operator model
        operator = operator_baker()
        # authorize the Operator User
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        # create an Owning Operation
        owning_operation = operation_baker(operator.id)
        # create a new instance of the Facility model
        facility = facility_baker() # Facility without address
        # link the created facility with an operation
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)
       
        # create facility payload
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        # update the facility
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert facility.address is None

    @staticmethod
    def test_update_facility_with_address():        
        # create a new instance of User model
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))  
        # create a new instance of the Operator model
        operator = operator_baker()
        # authorize the Operator User
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        # create an Owning Operation
        owning_operation = operation_baker(operator.id)
        # create a new instance of the Facility model
        facility = facility_baker(address=address_baker()) # Facility with address
        # link the created facility with an operation
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)
       
        # create facility payload
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',           
            street_address="1234 Test St",
            municipality="Test City",
            province="ON",
            postal_code="T3S T1N",
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        # update the facility
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert facility.address.street_address == facility_payload.street_address
        assert facility.address.municipality == facility_payload.municipality
        assert facility.address.province == facility_payload.province
        assert facility.address.postal_code == facility_payload.postal_code
        assert facility.address is not None

    @staticmethod
    def test_update_facility_remove_address():        
        # create a new instance of User model
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))  
        # create a new instance of the Operator model
        operator = operator_baker()
        # authorize the Operator User
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        # create an Owning Operation
        owning_operation = operation_baker(operator.id)
        # create a new instance of the Facility model
        facility = facility_baker(address=address_baker()) # Facility with address
        # link the created facility with an operation
        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)
       
        # create facility payload
        facility_payload = FacilityIn(
            name='zip',
            type='Single Facility',      
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        # update the facility
        FacilityService.update_facility(user.user_guid, facility.id, facility_payload)
        facility.refresh_from_db()
        assert facility.name == facility_payload.name
        assert facility.type == facility_payload.type
        assert facility.latitude_of_largest_emissions == facility_payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == facility_payload.longitude_of_largest_emissions
        assert facility.address is None

