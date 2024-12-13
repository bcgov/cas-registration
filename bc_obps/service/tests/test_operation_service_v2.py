from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from uuid import uuid4
from zoneinfo import ZoneInfo

from registration.models.contact import Contact
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.document_type import DocumentType
from registration.models.activity import Activity
from registration.models.business_role import BusinessRole
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.address import Address
from registration.schema.v2.operation import (
    OperationRepresentativeIn,
    OperationNewEntrantApplicationIn,
    OperationRepresentativeRemove,
)
from service.data_access_service.operation_service_v2 import OperationDataAccessServiceV2
from service.operation_service_v2 import OperationServiceV2
import pytest
from registration.models.multiple_operator import MultipleOperator
from registration.schema.v2.multiple_operator import MultipleOperatorIn
from registration.models.operation import Operation
from registration.schema.v2.operation import (
    OperationInformationIn,
)
from registration.tests.constants import MOCK_DATA_URL
from model_bakery import baker

pytestmark = pytest.mark.django_db


def set_up_valid_mock_operation(purpose: Operation.Purposes):
    # create operation and purpose
    operation = baker.make_recipe('utils.operation', status=Operation.Statuses.DRAFT, registration_purpose=purpose)

    # create mock valid operation rep
    address = baker.make_recipe('utils.address')
    operation_representative = baker.make_recipe(
        'utils.contact', business_role=BusinessRole.objects.get(role_name='Operation Representative'), address=address
    )
    operation.contacts.set([operation_representative])

    # create facility for operation
    baker.make_recipe('utils.facility_designated_operation_timeline', operation=operation)

    # activity
    operation.activities.set([baker.make(Activity)])

    # docs
    boundary_map = baker.make_recipe('utils.document', type=DocumentType.objects.get(name='boundary_map'))
    process_flow_diagram = baker.make_recipe(
        'utils.document', type=DocumentType.objects.get(name='process_flow_diagram')
    )

    operation.documents.set([boundary_map, process_flow_diagram])

    if purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
        # statutory dec if new entrant
        new_entrant_application = baker.make_recipe(
            'utils.document', type=DocumentType.objects.get(name='new_entrant_application')
        )
        operation.documents.add(new_entrant_application)

    if purpose == Operation.Purposes.OPTED_IN_OPERATION:
        # opt in record
        opted_in_operation_detail = baker.make_recipe('utils.opted_in_operation_detail')
        operation.opted_in_operation = opted_in_operation_detail
        operation.save()
    return operation


class TestOperationServiceV2:
    @staticmethod
    def test_raises_error_if_operation_does_not_belong_to_user():
        user = baker.make_recipe(
            'utils.industry_operator_user',
        )
        baker.make_recipe('utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'utils.operator', cra_business_number=123456789, bc_corporate_registry_number='abc1234567'
        )
        operation = baker.make_recipe(
            'utils.operation', operator=random_operator, registration_purpose='Potential Reporting Operation'
        )

        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            name="string",
            type="SFO",
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        with pytest.raises(Exception):
            OperationServiceV2.create_or_update_operation_v2(user.user_guid, operation.id, payload)

    @staticmethod
    def test_assigns_single_selected_purpose():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='Potential Reporting Operation',
        )
        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            name="string",
            type="SFO",
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        OperationServiceV2.create_or_update_operation_v2(approved_user_operator.user.user_guid, payload, operation.id)

        operation.refresh_from_db()  # refresh the operation object to get the updated audit columns
        assert operation.updated_at is not None
        assert operation.updated_by == approved_user_operator.user
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_assigning_opted_in_operation_will_create_and_opted_in_operation_detail():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
        )
        payload = OperationInformationIn(
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            name="string",
            type="SFO",
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        OperationServiceV2.create_or_update_operation_v2(approved_user_operator.user.user_guid, payload, operation.id)

        operation.refresh_from_db()
        assert operation.opted_in_operation is not None
        assert OptedInOperationDetail.objects.count() == 1

    @staticmethod
    def test_list_current_users_unregistered_operations():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_unregistered_operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, status=Operation.Statuses.PENDING
        )
        # operation with a registered status
        baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, status=Operation.Statuses.REGISTERED
        )
        # operation for a different user_operator
        baker.make_recipe('utils.operation', status=Operation.Statuses.PENDING)

        result = OperationServiceV2.list_current_users_unregistered_operations(approved_user_operator.user.user_guid)
        assert Operation.objects.count() == 3
        assert len(result) == 1
        assert result[0] == users_unregistered_operation

    @staticmethod
    def test_update_operation_status_success():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        users_operation.operator = approved_user_operator.operator
        users_operation.save()

        updated_operation = OperationServiceV2.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()
        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.updated_by == approved_user_operator.user
        assert updated_operation.updated_at is not None
        # make sure the submission_date is set - using 2 seconds as a buffer for the test
        assert datetime.now(ZoneInfo("UTC")).replace(microsecond=0) - updated_operation.submission_date.replace(
            microsecond=0
        ) < timedelta(seconds=2)
        assert updated_operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION

    @staticmethod
    def test_update_operation_status_fail():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, created_by=approved_user_operator.user
        )
        users_operation.contacts.set([])

        with pytest.raises(Exception, match="Operation must have an operation representative with an address."):
            OperationServiceV2.update_status(
                approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
            )

    @staticmethod
    def test_raises_error_if_operation_does_not_belong_to_user_when_updating_status():
        user = baker.make_recipe(
            'utils.industry_operator_user',
        )
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'utils.operator', cra_business_number=123456789, bc_corporate_registry_number='abc1234567'
        )
        operation = baker.make_recipe('utils.operation', operator=random_operator)
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationServiceV2.update_status(
                approved_user_operator.user.user_guid, operation.id, Operation.Statuses.REGISTERED
            )

    @staticmethod
    def test_assign_new_contacts_to_operation_and_operator():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        payload = OperationRepresentativeIn(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone_number="+16044011234",
            position_title="Mr.Tester",
            street_address='13 Street',
            municipality='municipality',
            province='AB',
            postal_code='H0H0H0',
        )

        OperationServiceV2.create_operation_representative(approved_user_operator.user.user_guid, operation.id, payload)
        operation.refresh_from_db()

        assert approved_user_operator.operator.contacts.count() == 1
        assert operation.contacts.count() == 1
        assert Address.objects.count() == 2  # 1 is the contact's, 1 is from the operation baker recipe
        operation_contact = operation.contacts.first()
        assert operation_contact.first_name == 'John'
        assert operation_contact.address.street_address == '13 Street'
        assert operation_contact.created_at is not None
        assert operation_contact.created_by == approved_user_operator.user
        assert operation.updated_at is not None
        assert operation.updated_by == approved_user_operator.user

    @staticmethod
    def test_assign_existing_contacts_to_operation():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operator = approved_user_operator.operator
        contacts = baker.make_recipe('utils.contact', _quantity=5)
        contact_to_update = contacts[0]
        users_operator.contacts.set(list(map(lambda c: c.id, contacts)))
        operation = baker.make_recipe('utils.operation', operator=users_operator)

        # bad payload, should not update first_name, last_name and email when existing_contact_id is provided
        bad_payload = OperationRepresentativeIn(
            existing_contact_id=contact_to_update.id,
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone_number="+16044011234",
            position_title="Mr.Tester",
            street_address='13 Street',
            municipality='municipality',
            province='AB',
            postal_code='H0H0H0',
        )

        with pytest.raises(Exception):
            OperationServiceV2.create_operation_representative(
                approved_user_operator.user.user_guid, operation.id, bad_payload
            )
        # good payload, using the same first_name, last_name and email when existing_contact_id is provided
        good_payload = OperationRepresentativeIn(
            existing_contact_id=contact_to_update.id,
            first_name=contact_to_update.first_name,
            last_name=contact_to_update.last_name,
            email=contact_to_update.email,
            phone_number="+16044011234",
            position_title="Mr.Tester",
            street_address='13 Street',
            municipality='municipality',
            province='AB',
            postal_code='H0H0H0',
        )

        OperationServiceV2.create_operation_representative(
            approved_user_operator.user.user_guid, operation.id, good_payload
        )
        operation.refresh_from_db()
        assert users_operator.contacts.count() == 5
        assert operation.contacts.count() == 1
        assert operation.updated_at is not None
        assert operation.updated_by == approved_user_operator.user

    @staticmethod
    def test_raises_error_if_operation_does_not_belong_to_user_when_updating_opted_in_operation_detail():
        user = baker.make_recipe(
            'utils.industry_operator_user',
        )
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'utils.operator', cra_business_number=123456789, bc_corporate_registry_number='abc1234567'
        )
        operation = baker.make_recipe('utils.operation', operator=random_operator)
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationServiceV2.update_opted_in_operation_detail(approved_user_operator.user.user_guid, operation.id, {})

    @staticmethod
    def test_create_or_replace_new_entrant_application():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, created_by=approved_user_operator.user
        )
        payload = OperationNewEntrantApplicationIn(
            new_entrant_application=MOCK_DATA_URL,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
        )
        operation = OperationServiceV2.create_or_replace_new_entrant_application(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        assert operation.id == users_operation.id
        assert operation.updated_by == approved_user_operator.user
        assert operation.updated_at is not None
        assert operation.date_of_first_shipment == Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024
        assert operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).count() == 1

    @staticmethod
    def test_register_operation_information_new_operation():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')

        payload = OperationInformationIn(
            registration_purpose='Electricity Import Operation',
            name="string",
            type="SFO",
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        operation = OperationServiceV2.register_operation_information(
            approved_user_operator.user.user_guid, None, payload
        )
        operation.refresh_from_db()
        # check operation creation
        assert Operation.objects.count() == 1
        assert operation.created_by == approved_user_operator.user
        assert operation.created_at is not None
        assert operation.updated_by is not None  # the operation is created first, and then we add the purpose
        # check purpose
        assert operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert operation.status == Operation.Statuses.DRAFT

    @staticmethod
    def test_register_operation_information_existing_operation():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, created_by=approved_user_operator.user
        )
        payload = OperationInformationIn(
            registration_purpose='Potential Reporting Operation',
            name="string",
            type="SFO",
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        # check operation updates
        operation = OperationServiceV2.register_operation_information(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.updated_by == approved_user_operator.user
        assert operation.updated_at is not None
        # check purpose
        assert operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        assert operation.status == Operation.Statuses.DRAFT


class TestOperationServiceV2CreateOrUpdateOperation:
    def test_create_operation_without_multiple_operators(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="string",
            type="SFO",
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        operation = OperationServiceV2.create_or_update_operation_v2(approved_user_operator.user.user_guid, payload)
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert operation.created_by == approved_user_operator.user
        assert operation.created_at is not None
        assert operation.updated_at is None

    @staticmethod
    def test_create_operation_with_multiple_operators():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="string",
            type="SFO",
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        payload.multiple_operators_array = [
            MultipleOperatorIn(
                mo_legal_name='i am new',
                mo_trade_name='new',
                mo_cra_business_number=111111111,
                mo_business_structure='General Partnership',
                mo_bc_corporate_registry_number='ghj1234567',
                mo_attorney_street_address='Seahorses St',
                mo_municipality='Ocean Town',
                mo_province='BC',
                mo_postal_code='H0H0H0',
            ),
            MultipleOperatorIn(
                mo_legal_name='i am new 2',
                mo_trade_name='new 2',
                mo_cra_business_number=111111111,
                mo_business_structure='General Partnership',
                mo_attorney_street_address='Lion St',
                mo_municipality='Zebra Town',
                mo_province='MB',
                mo_postal_code='H0H0H0',
            ),
        ]
        operation = OperationServiceV2.create_or_update_operation_v2(approved_user_operator.user.user_guid, payload)
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.created_by == approved_user_operator.user
        assert operation.created_at is not None
        assert MultipleOperator.objects.count() == 2
        assert MultipleOperator.objects.first().bc_corporate_registry_number == 'ghj1234567'
        assert MultipleOperator.objects.last().bc_corporate_registry_number is None
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_update_operation_with_multiple_operators():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        existing_operation = baker.make_recipe('utils.operation')
        multiple_operators = baker.make_recipe('utils.multiple_operator', operation=existing_operation, _quantity=3)
        existing_operation.multiple_operators.set(multiple_operators)

        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="I am updated",
            type="SFO",
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        payload.multiple_operators_array = [
            MultipleOperatorIn(
                mo_legal_name='i am new',
                mo_trade_name='new',
                mo_cra_business_number=111111111,
                mo_business_structure='General Partnership',
                mo_bc_corporate_registry_number='ghj1234567',
                mo_attorney_street_address='Seahorses St',
                mo_municipality='Ocean Town',
                mo_province='BC',
                mo_postal_code='H0H0H0',
            ),
            MultipleOperatorIn(
                mo_legal_name='i am new 2',
                mo_trade_name='new 2',
                mo_cra_business_number=111111111,
                mo_business_structure='General Partnership',
                mo_attorney_street_address='Lion St',
                mo_municipality='Zebra Town',
                mo_province='MB',
                mo_postal_code='H0H0H0',
            ),
        ]
        operation = OperationServiceV2.create_or_update_operation_v2(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.multiple_operators.count() == 2
        assert operation.multiple_operators.first().legal_name == 'i am new'
        assert operation.multiple_operators.last().legal_name == 'i am new 2'
        assert operation.name == "I am updated"
        assert operation.updated_by == approved_user_operator.user
        assert operation.updated_at is not None
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_update_operation_archive_multiple_operators():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        existing_operation = baker.make_recipe('utils.operation')
        multiple_operators = baker.make_recipe('utils.multiple_operator', operation=existing_operation, _quantity=3)
        existing_operation.multiple_operators.set(multiple_operators)

        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="I am updated",
            type="SFO",
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )

        operation = OperationServiceV2.create_or_update_operation_v2(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.multiple_operators.count() == 0
        assert operation.updated_by == approved_user_operator.user
        assert operation.updated_at is not None


class TestOperationServiceV2UpdateOperation:
    def test_update_operation(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, created_by=approved_user_operator.user
        )
        payload = OperationInformationIn(
            registration_purpose='Potential Reporting Operation',
            regulated_products=[1],
            name="Test Update Operation Name",
            type="SFO",
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        operation = OperationServiceV2.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.created_by == approved_user_operator.user
        assert operation.created_at is not None
        assert operation.updated_at is not None
        assert operation.regulated_products.count() == 1
        assert operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION

    def test_update_operation_with_no_regulated_products(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, created_by=approved_user_operator.user
        )
        payload = OperationInformationIn(
            registration_purpose='OBPS Regulated Operation',
            name="Test Update Operation Name",
            type="SFO",
            naics_code_id=2,
            secondary_naics_code_id=3,
            tertiary_naics_code_id=4,
            activities=[3],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        operation = OperationServiceV2.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.created_by == approved_user_operator.user
        assert operation.created_at is not None
        assert operation.updated_at is not None
        assert operation.regulated_products.count() == 0
        assert operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION

    def test_update_operation_with_new_entrant_application_data(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_AFTER_APRIL_1_2024,
        )
        payload = OperationInformationIn(
            registration_purpose='New Entrant Operation',
            name="Test Update Operation Name",
            type="SFO",
            naics_code_id=2,
            secondary_naics_code_id=3,
            tertiary_naics_code_id=4,
            activities=[3],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
            new_entrant_application=MOCK_DATA_URL,
        )
        operation = OperationServiceV2.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 3
        assert operation.created_by == approved_user_operator.user
        assert operation.created_at is not None
        assert operation.updated_at is not None
        assert operation.date_of_first_shipment == Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024
        assert operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).count() == 1
        assert operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION


class TestOperationServiceV2CheckCurrentUsersRegisteredOperation:
    def test_check_current_users_registered_operation_returns_true(self):
        # Create a user operator and a registered operation
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')

        # Create an operation with status 'Registered'
        baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Registered",
        )

        # Check that the method returns True when there is a registered operation
        assert Operation.objects.count() == 1
        assert (
            OperationDataAccessServiceV2.check_current_users_registered_operation(approved_user_operator.operator.id)
            is True
        )

        # Create an operation with a different status
        baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Draft",
        )

        # Ensure the method still returns True with mixed statuses
        assert Operation.objects.count() == 2
        assert (
            OperationDataAccessServiceV2.check_current_users_registered_operation(approved_user_operator.operator.id)
            is True
        )

    def test_check_current_users_registered_operation_returns_false(self):
        # Create a user operator and an operation with a non-registered status
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')

        # Create an operation with a non-registered status
        baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Draft",
        )

        # Check that the method returns False when there is no registered operation
        assert Operation.objects.count() == 1
        assert (
            OperationDataAccessServiceV2.check_current_users_registered_operation(approved_user_operator.operator.id)
            is False
        )


class TestRaiseExceptionIfOperationRegistrationDataIncomplete:
    @staticmethod
    def test_raises_exception_if_no_purpose():
        operation = baker.make_recipe('utils.operation', status=Operation.Statuses.DRAFT)
        # the only way to not have a registration purpose on an operation is to first set one when creating the operation,
        # then manually remove it
        operation.registration_purpose = None

        with pytest.raises(Exception, match="Operation must have a registration purpose."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_operation_rep():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.contacts.all().delete()

        with pytest.raises(Exception, match="Operation must have an operation representative with an address."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_operation_rep_missing_address():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        op_rep = operation.contacts.first()
        op_rep.address = None
        op_rep.save()

        with pytest.raises(Exception, match="Operation must have an operation representative with an address."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_operation_rep_missing_required_fields():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        op_rep_address = operation.contacts.first().address
        op_rep_address.street_address = None
        op_rep_address.save()

        with pytest.raises(Exception, match="Operation must have an operation representative with an address."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_facilities():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        FacilityDesignatedOperationTimeline.objects.filter(operation=operation).delete()

        with pytest.raises(Exception, match="Operation must have at least one facility."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_activities():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.activities.all().delete()

        with pytest.raises(Exception, match="Operation must have at least one reporting activity."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_documents():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.documents.all().delete()

        with pytest.raises(Exception, match="Operation must have a process flow diagram and a boundary map."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_one_of_the_documents_is_missing():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.documents.filter(type=DocumentType.objects.get(name='boundary_map')).delete()

        with pytest.raises(Exception, match="Operation must have a process flow diagram and a boundary map."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_do_not_raise_exception_if_data_complete_new_entrant():
        operation = set_up_valid_mock_operation(Operation.Purposes.NEW_ENTRANT_OPERATION)
        OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_new_entrant_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.NEW_ENTRANT_OPERATION)
        # remove statutory declaration
        operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).delete()

        with pytest.raises(
            Exception, match="Operation must have a signed statutory declaration if it is a new entrant."
        ):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_opt_in_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # remove opted in information
        operation.opted_in_operation = None
        operation.save()

        with pytest.raises(Exception, match="Operation must have completed opt-in information if it is opted in."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_incomplete_opt_in_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # make the opt-in record blank
        operation.opted_in_operation = baker.make(OptedInOperationDetail)
        operation.save()

        with pytest.raises(Exception, match="Operation must have completed opt-in information if it is opted in."):
            OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_do_not_raise_exception_if_data_complete_opt_in():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # test will pass if no exception raised
        OperationServiceV2.raise_exception_if_operation_missing_registration_information(operation)


class TestGenerateBoroId:
    @staticmethod
    def test_generates_boro_id():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        OperationServiceV2.generate_boro_id(approved_user_operator.user.user_guid, operation.id)
        operation.refresh_from_db()
        assert operation.bc_obps_regulated_operation is not None
        assert operation.bc_obps_regulated_operation.issued_by == approved_user_operator.user

    @staticmethod
    def test_raises_exception_if_operation_is_non_regulated():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
        )

        with pytest.raises(Exception, match="Non-regulated operations cannot be issued BORO ID."):
            OperationServiceV2.generate_boro_id(approved_user_operator.user.user_guid, operation.id)

    @staticmethod
    def test_raises_exception_if_operation_is_not_registered():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.DRAFT,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
        )

        with pytest.raises(Exception, match="Operations must be registered before they can be issued a BORO ID."):
            OperationServiceV2.generate_boro_id(approved_user_operator.user.user_guid, operation.id)


class TestRemoveOperationRepresentative:
    @staticmethod
    def test_cannot_remove_anything_from_other_users_operations():
        user = baker.make_recipe('utils.industry_operator_user')
        operation = baker.make_recipe(
            'utils.operation',
        )
        contact1 = baker.make_recipe('utils.contact', id=1)
        contact2 = baker.make_recipe('utils.contact', id=2)
        operation.contacts.add(contact1, contact2)
        operation.save()
        with pytest.raises(Exception, match="Unauthorized."):
            OperationServiceV2.remove_operation_representative(user.user_guid, operation.id, {id: contact1.id})

    @staticmethod
    def test_removes_operation_representative():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        contact1 = baker.make_recipe('utils.contact', id=1)
        contact2 = baker.make_recipe('utils.contact', id=2)
        operation.contacts.add(contact1, contact2)
        operation.save()

        OperationServiceV2.remove_operation_representative(
            approved_user_operator.user.user_guid, operation.id, OperationRepresentativeRemove(id=contact2.id)
        )
        operation.refresh_from_db()

        assert operation.contacts.count() == 1
        assert operation.contacts.first().id == 1
        assert operation.updated_by == approved_user_operator.user
        # confirm the contact was only removed from the operation, not removed from the db
        assert Contact.objects.filter(id=2).exists()


class TestUpdateOperationsOperator:
    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_unauthorized_user_cannot_update_operations_operator(mock_get_by_guid):
        cas_admin = baker.make_recipe('utils.cas_admin')
        mock_get_by_guid.return_value = cas_admin
        operation = MagicMock()
        operator_id = uuid4()
        with pytest.raises(Exception, match="Unauthorized."):
            OperationServiceV2.update_operator(cas_admin.user_guid, operation, operator_id)

    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    @patch("registration.models.Operation.set_create_or_update")
    def test_update_operations_operator_success(mock_get_by_guid, mock_set_create_or_update):
        cas_analyst = baker.make_recipe('utils.cas_analyst')
        mock_get_by_guid.return_value = cas_analyst
        operation = baker.make_recipe('utils.operation')
        operator = baker.make_recipe('utils.operator')
        OperationServiceV2.update_operator(cas_analyst.user_guid, operation, operator.id)
        mock_set_create_or_update.assert_called_once()
        assert operation.operator == operator
