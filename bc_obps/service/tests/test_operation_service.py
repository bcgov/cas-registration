from datetime import datetime, timedelta
import os
from unittest.mock import patch, MagicMock
import pytest
from common.lib import pgtrigger
from uuid import uuid4
from zoneinfo import ZoneInfo
from registration.models.facility import Facility
from registration.models.contact import Contact
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.document_type import DocumentType
from registration.models.document import Document
from registration.models.activity import Activity
from registration.models.business_role import BusinessRole
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.address import Address
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from registration.schema import (
    FacilityIn,
    OperationInformationInUpdate,
    OperationRepresentativeIn,
    OperationNewEntrantApplicationIn,
    OperationRepresentativeRemove,
    OperationTimelineFilterSchema,
    MultipleOperatorIn,
    OperationInformationIn,
)
from registration.enums.enums import EmailTemplateNames
from service.data_access_service.operation_service import OperationDataAccessService
from service.operation_service import OperationService
from service.email.email_service import EmailService
from registration.models.multiple_operator import MultipleOperator
from registration.models.operation import Operation
from registration.tests.constants import MOCK_DATA_URL
from model_bakery import baker
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline

pytestmark = pytest.mark.django_db
email_service = EmailService()


def set_up_valid_mock_operation(purpose: Operation.Purposes, document_scan_status: Document.FileStatus = "Clean"):
    # create operation and purpose
    operation = baker.make_recipe(
        'registration.tests.utils.operation', status=Operation.Statuses.DRAFT, registration_purpose=purpose
    )

    # create mock valid operation rep
    address = baker.make_recipe('registration.tests.utils.address')
    operation_representative = baker.make_recipe(
        'registration.tests.utils.contact',
        business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        address=address,
    )
    operation.contacts.set([operation_representative])

    # create facility for operation
    baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline', operation=operation)

    # activity
    operation.activities.set([baker.make(Activity)])

    # docs
    boundary_map = baker.make_recipe(
        "registration.tests.utils.document",
        type=DocumentType.objects.get(name="boundary_map"),
        status=document_scan_status,
    )
    process_flow_diagram = baker.make_recipe(
        "registration.tests.utils.document",
        type=DocumentType.objects.get(name="process_flow_diagram"),
        status=document_scan_status,
    )

    operation.documents.set([boundary_map, process_flow_diagram])

    if purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
        # statutory dec if new entrant
        new_entrant_application = baker.make_recipe(
            'registration.tests.utils.document',
            type=DocumentType.objects.get(name='new_entrant_application'),
            status=document_scan_status,
        )
        operation.documents.add(new_entrant_application)
        operation.date_of_first_shipment = "On or after April 1, 2024"

    if purpose == Operation.Purposes.OPTED_IN_OPERATION:
        # opt in record
        opted_in_operation_detail = baker.make_recipe('registration.tests.utils.opted_in_operation_detail')
        operation.opted_in_operation = opted_in_operation_detail
        operation.save()
    return operation


class TestOperationService:
    @staticmethod
    def test_assigns_single_selected_purpose():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='Potential Reporting Operation',
        )
        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        OperationService.register_operation_information(approved_user_operator.user.user_guid, operation.id, payload)

        operation.refresh_from_db()  # refresh the operation object to get the updated audit columns
        assert operation.updated_at is not None
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_list_current_users_unregistered_operations():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_unregistered_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.DRAFT,
        )
        # operation with a registered status
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        # operation for a different user_operator
        baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.DRAFT)

        result = OperationService.list_current_users_unregistered_operations(approved_user_operator.user.user_guid)
        assert Operation.objects.count() == 3
        assert len(result) == 1
        assert result[0] == users_unregistered_operation

    @staticmethod
    @patch('service.operation_service.send_registration_and_boro_id_email')
    def test_submit_registration_success(mock_email_service):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        users_operation.operator = approved_user_operator.operator
        users_operation.save()

        updated_operation = OperationService.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()
        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.updated_at is not None
        # make sure the submission_date is set - using 2 seconds as a buffer for the test
        assert datetime.now(ZoneInfo("UTC")).replace(microsecond=0) - updated_operation.submission_date.replace(
            microsecond=0
        ) < timedelta(seconds=2)
        assert updated_operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION

        mock_email_service.assert_called_once_with(
            EmailTemplateNames.REGISTRATION_CONFIRMATION,
            users_operation.operator.legal_name,
            users_operation,
            approved_user_operator.user,
        )

    @staticmethod
    @patch('service.operation_service.send_registration_and_boro_id_email')
    def test_submit_registration_fail(mock_email_service):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )
        users_operation.contacts.set([])

        with pytest.raises(Exception, match="Operation must have an operation representative with an address."):
            OperationService.update_status(
                approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
            )

        # assert the email does not get sent if the registration failed to submit
        mock_email_service.assert_not_called()

    @staticmethod
    @patch('service.operation_service.send_registration_and_boro_id_email')
    def test_raises_error_if_operation_does_not_belong_to_user_when_submitting_registration(mock_email_service):
        user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'registration.tests.utils.operator',
            cra_business_number=123456789,
            bc_corporate_registry_number='abc1234567',
        )
        operation = baker.make_recipe('registration.tests.utils.operation', operator=random_operator)
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.update_status(
                approved_user_operator.user.user_guid, operation.id, Operation.Statuses.REGISTERED
            )

        # assert the email does not get sent if the registration failed to submit
        mock_email_service.assert_not_called()

    @staticmethod
    def test_register_operation_with_preexisting_boro_id():
        # If an operation already has a BORO ID (i.e., it was issued in 2024),
        # we should not expect a pgtrigger error raised when we register the operation
        # and the BORO ID should remain the same.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        boro_id = baker.make(BcObpsRegulatedOperation, id='24-0999')
        op_rep = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
        )

        # need to temporarily disable the pgtrigger in order to be able to insert an operation with boro_id and status=Draft into the test DB
        with pgtrigger.ignore("registration.Operation:restrict_boro_id_unless_registered"):
            users_operation = Operation.objects.create(
                name="Old Operation that already has a BORO ID",
                status="Draft",
                bc_obps_regulated_operation_id=boro_id.id,
                registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
                operator=approved_user_operator.operator,
                type='Single Facility Operation',
            )
        users_operation.contacts.set([op_rep])
        facility = baker.make_recipe('registration.tests.utils.facility', operation=users_operation)
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=facility,
            operation=users_operation,
            end_date=None,
        )
        activity = baker.make_recipe('registration.tests.utils.activity')
        users_operation.activities.set([activity])
        product = baker.make_recipe('registration.tests.utils.regulated_product')
        users_operation.regulated_products.set([product])
        pfd = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='process_flow_diagram'),
        )
        b_map = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='boundary_map'),
        )
        users_operation.documents.set([pfd, b_map])

        users_operation.save()
        users_operation.refresh_from_db()

        updated_operation = OperationService.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()

        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert updated_operation.bc_obps_regulated_operation == users_operation.bc_obps_regulated_operation
        assert updated_operation.bc_obps_regulated_operation.id == '24-0999'

    @staticmethod
    def test_register_operation_with_preexisting_bcghg_id():
        # If an operation already has a BCGHG ID,
        # we should not expect a pgtrigger error raised when we register the operation
        # and the BCGHG ID should remain the same.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        bcghg_id = baker.make_recipe('registration.tests.utils.bcghg_id')
        op_rep = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
        )

        # need to temporarily disable the pgtrigger in order to be able to insert an operation with bcghg_id and status=Draft into the test DB
        with pgtrigger.ignore("registration.Operation:restrict_bcghg_id_unless_registered"):
            users_operation = Operation.objects.create(
                name="Old Operation that already has a BCGHG ID",
                status="Draft",
                bcghg_id=bcghg_id,
                registration_purpose=Operation.Purposes.REPORTING_OPERATION,
                operator=approved_user_operator.operator,
                type='Single Facility Operation',
            )
        users_operation.contacts.set([op_rep])
        facility = baker.make_recipe('registration.tests.utils.facility', operation=users_operation)
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=facility,
            operation=users_operation,
            end_date=None,
        )
        activity = baker.make_recipe('registration.tests.utils.activity')
        users_operation.activities.set([activity])
        pfd = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='process_flow_diagram'),
        )
        b_map = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='boundary_map'),
        )
        users_operation.documents.set([pfd, b_map])

        users_operation.save()
        users_operation.refresh_from_db()

        updated_operation = OperationService.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()

        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert updated_operation.bcghg_id == users_operation.bcghg_id
        assert updated_operation.bcghg_id == bcghg_id

    @staticmethod
    def test_register_operation_with_facility_with_preexisting_bcghg_id():
        # If an operation has a facility that already has a BCGHG ID,
        # we should not expect a pgtrigger error raised when we register the operation
        # and the BCGHG ID should remain the same.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        bcghg_id = baker.make_recipe('registration.tests.utils.bcghg_id')
        op_rep = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
        )

        users_operation = Operation.objects.create(
            name="Old Operation",
            status="Draft",
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            operator=approved_user_operator.operator,
            type='Single Facility Operation',
        )
        users_operation.contacts.set([op_rep])

        # need to temporarily disable the pgtrigger in order to be able to insert a facility with bcghg_id
        with pgtrigger.ignore("registration.Facility:restrict_bcghg_id_unless_operation_registered"):
            facility = baker.make_recipe(
                'registration.tests.utils.facility', operation=users_operation, bcghg_id=bcghg_id
            )
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=facility,
            operation=users_operation,
            end_date=None,
        )
        activity = baker.make_recipe('registration.tests.utils.activity')
        users_operation.activities.set([activity])
        pfd = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='process_flow_diagram'),
        )
        b_map = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='boundary_map'),
        )
        users_operation.documents.set([pfd, b_map])

        users_operation.save()
        users_operation.refresh_from_db()

        updated_operation = OperationService.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()

        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert updated_operation.facilities.count() == 1
        operations_facility = updated_operation.facilities.first()
        assert operations_facility.bcghg_id == bcghg_id

    @staticmethod
    def test_assign_new_contacts_to_operation_and_operator():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
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

        OperationService.create_operation_representative(approved_user_operator.user.user_guid, operation.id, payload)
        operation.refresh_from_db()

        assert approved_user_operator.operator.contacts.count() == 1
        assert operation.contacts.count() == 1
        assert Address.objects.count() == 2  # 1 is the contact's, 1 is from the operation baker recipe
        operation_contact = operation.contacts.first()
        operation_contact.refresh_from_db()
        assert operation_contact.first_name == 'John'
        assert operation_contact.address.street_address == '13 Street'
        assert operation_contact.created_at is not None

    @staticmethod
    def test_assign_existing_contacts_to_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        contacts = baker.make_recipe(
            'registration.tests.utils.contact', operator=approved_user_operator.operator, _quantity=5
        )
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)

        contact_to_update = contacts[0]

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
            OperationService.create_operation_representative(
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

        OperationService.create_operation_representative(
            approved_user_operator.user.user_guid, operation.id, good_payload
        )
        operation.refresh_from_db()
        assert operation.contacts.count() == 1

    @staticmethod
    def test_raises_error_if_operation_does_not_belong_to_user_when_updating_opted_in_operation_detail():
        user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'registration.tests.utils.operator',
            cra_business_number=123456789,
            bc_corporate_registry_number='abc1234567',
        )
        operation = baker.make_recipe('registration.tests.utils.operation', operator=random_operator)
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.update_opted_in_operation_detail(approved_user_operator.user.user_guid, operation.id, {})

    @staticmethod
    def test_create_or_replace_new_entrant_application():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )
        payload = OperationNewEntrantApplicationIn(
            new_entrant_application=MOCK_DATA_URL,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
        )
        operation = OperationService.create_or_replace_new_entrant_application(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        assert operation.id == users_operation.id
        assert operation.updated_at is not None
        assert operation.date_of_first_shipment == Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024
        assert operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).count() == 1


class TestRegisterOperationInformation:
    @staticmethod
    def test_register_operation_information_new_eio():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationInformationIn(
            registration_purpose='Electricity Import Operation',
            name="TestEIO",
            type=Operation.Types.EIO,
        )
        # check operation
        operation = OperationService.register_operation_information(
            approved_user_operator.user.user_guid, None, payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        # check purpose and status
        assert operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert operation.status == Operation.Statuses.DRAFT
        # check facility
        facilities = operation.facilities.all()
        assert facilities.count() == 1
        assert facilities[0].name == "TestEIO"
        assert facilities[0].type == Facility.Types.ELECTRICITY_IMPORT

    @staticmethod
    def test_register_operation_information_existing_eio():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            type=Operation.Types.EIO,
            registration_purpose='Electricity Import Operation',
        )
        payload = OperationInformationIn(
            registration_purpose='Electricity Import Operation',
            name="UpdatedEIO",
            type=Operation.Types.EIO,
        )
        # check operation updates
        operation = OperationService.register_operation_information(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        # check purpose and status
        assert operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert operation.status == Operation.Statuses.DRAFT
        # check facility
        facilities = operation.facilities.all()
        assert facilities.count() == 1
        assert facilities[0].name == "UpdatedEIO"
        assert facilities[0].type == Facility.Types.ELECTRICITY_IMPORT

    @staticmethod
    def test_register_operation_information_new_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        operation = OperationService.register_operation_information(
            approved_user_operator.user.user_guid, None, payload
        )
        operation.refresh_from_db()
        # check operation creation
        assert Operation.objects.count() == 1
        # check purpose
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert operation.status == Operation.Statuses.DRAFT
        facilities = operation.facilities.all()
        assert facilities.count() == 0

    @staticmethod
    def test_register_operation_information_existing_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )
        payload = OperationInformationIn(
            registration_purpose='Potential Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        # check operation updates
        operation = OperationService.register_operation_information(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.updated_at is not None
        # check purpose
        assert operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        assert operation.status == Operation.Statuses.DRAFT
        facilities = operation.facilities.all()
        assert facilities.count() == 0

    @staticmethod
    def test_is_operation_new_entrant_information_complete_true():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_AFTER_APRIL_1_2024,
        )
        new_entrant_application = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='new_entrant_application')
        )
        users_operation.documents.add(new_entrant_application)

        assert OperationService.is_operation_new_entrant_information_complete(users_operation)

    @staticmethod
    def test_is_operation_new_entrant_information_complete_no_date():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
        )
        new_entrant_application = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='new_entrant_application')
        )
        users_operation.documents.add(new_entrant_application)

        assert not OperationService.is_operation_new_entrant_information_complete(users_operation)

    @staticmethod
    def test_is_operation_new_entrant_information_complete_no_application():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
        )

        assert not OperationService.is_operation_new_entrant_information_complete(users_operation)


class TestOperationServiceV2CreateOperation:
    @staticmethod
    def test_create_operation_without_multiple_operators():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            regulated_products=[1, 2],
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        operation = OperationService._create_operation(approved_user_operator.user.user_guid, payload)
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.regulated_products.count() == 2
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

        # check timeline model
        assert OperationDesignatedOperatorTimeline.objects.count() == 1
        timeline_record = OperationDesignatedOperatorTimeline.objects.first()
        assert timeline_record.operation == operation
        assert timeline_record.operator == approved_user_operator.operator
        assert timeline_record.start_date is not None

    @staticmethod
    def test_create_operation_with_multiple_operators():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
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
        operation = OperationService._create_operation(approved_user_operator.user.user_guid, payload)
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert MultipleOperator.objects.count() == 2
        assert MultipleOperator.objects.first().bc_corporate_registry_number == 'ghj1234567'
        assert MultipleOperator.objects.last().bc_corporate_registry_number is None
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_assigning_opted_in_operation_will_create_and_opted_in_operation_detail():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationInformationIn(
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        operation = OperationService._create_operation(approved_user_operator.user.user_guid, payload)

        operation.refresh_from_db()
        assert operation.opted_in_operation is not None
        assert OptedInOperationDetail.objects.count() == 1

    @staticmethod
    def test_create_makes_eio_facility():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationInformationIn(
            registration_purpose='Electricity Import Operation',
            name="TestEIO",
            type=Operation.Types.EIO,
        )
        # check operation
        operation = OperationService._create_operation(approved_user_operator.user.user_guid, payload)
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        # check facility
        facilities = operation.facilities.all()
        assert facilities.count() == 1
        assert facilities[0].name == "TestEIO"
        assert facilities[0].type == Facility.Types.ELECTRICITY_IMPORT


class TestOperationServiceV2UpdateOperation:
    @staticmethod
    def test_raises_error_if_operation_does_not_belong_to_user():
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        baker.make_recipe('registration.tests.utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'registration.tests.utils.operator',
            cra_business_number=123456789,
            bc_corporate_registry_number='abc1234567',
        )
        # random operator's operation
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=random_operator,
            registration_purpose='Potential Reporting Operation',
        )

        payload = OperationInformationIn(
            registration_purpose='Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
        )
        with pytest.raises(Exception):
            OperationService.update_operation(user.user_guid, payload)

    @staticmethod
    def test_update_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = OperationInformationInUpdate(
            registration_purpose='Potential Reporting Operation',
            name="Test Update Operation Name",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION

    @staticmethod
    def test_update_operation_with_no_regulated_products():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = OperationInformationInUpdate(
            registration_purpose='OBPS Regulated Operation',
            name="Test Update Operation Name",
            type=Operation.Types.SFO,
            naics_code_id=2,
            secondary_naics_code_id=3,
            tertiary_naics_code_id=4,
            activities=[3],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.regulated_products.count() == 0
        assert operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION

    @staticmethod
    def test_update_operation_with_new_entrant_application_data():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_AFTER_APRIL_1_2024,
            status=Operation.Statuses.REGISTERED,
        )
        payload = OperationInformationInUpdate(
            registration_purpose='New Entrant Operation',
            name="Test Update Operation Name",
            type=Operation.Types.SFO,
            naics_code_id=2,
            secondary_naics_code_id=3,
            tertiary_naics_code_id=4,
            activities=[3],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
            new_entrant_application=MOCK_DATA_URL,
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 3
        assert operation.date_of_first_shipment == Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024
        assert operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).count() == 1
        assert operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION

    @staticmethod
    def test_update_operation_with_multiple_operators():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )
        multiple_operators = baker.make_recipe(
            'registration.tests.utils.multiple_operator', operation=existing_operation, _quantity=3
        )
        existing_operation.multiple_operators.set(multiple_operators)

        payload = OperationInformationInUpdate(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
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
        operation = OperationService.update_operation(
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
        assert operation.updated_at is not None
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_update_operation_archive_multiple_operators():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )
        multiple_operators = baker.make_recipe(
            'registration.tests.utils.multiple_operator', operation=existing_operation, _quantity=3
        )
        existing_operation.multiple_operators.set(multiple_operators)

        payload = OperationInformationInUpdate(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )

        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.multiple_operators.count() == 0
        assert operation.updated_at is not None

    @staticmethod
    def test_update_operation_with_operation_representatives_with_address():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        contacts = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            _quantity=3,
        )

        payload = OperationInformationInUpdate(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[contact.id for contact in contacts],
        )

        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.contacts.count() == 3

    @classmethod
    def test_update_operation_with_eio(cls):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.SFO,
            status=Operation.Statuses.DRAFT,
        )
        facility = baker.make_recipe(
            'registration.tests.utils.facility', operation=existing_operation, type=Facility.Types.SINGLE_FACILITY
        )
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=facility,
            operation=existing_operation,
            end_date=None,
        )

        contacts = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            _quantity=3,
        )

        payload = OperationInformationInUpdate(
            registration_purpose='Electricity Import Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.EIO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[contact.id for contact in contacts],
        )

        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        
        assert Facility.objects.count() == 0
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        # 1 facility because the EIO creation service will create a facility
        assert Facility.objects.count() == 1

    @staticmethod
    def test_update_opt_in_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='Opted-in Operation',
            status=Operation.Statuses.DRAFT,
        )
        opted_in_operation_detail = baker.make_recipe('registration.tests.utils.opted_in_operation_detail')
        existing_operation.opted_in_operation = opted_in_operation_detail
        existing_operation.save()

        contacts = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            _quantity=3,
        )

        payload = OperationInformationInUpdate(
            registration_purpose='Opted-in Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[contact.id for contact in contacts],
        )

        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert (
            OptedInOperationDetail.objects.count() == 1
        )  # only 1 record (to make sure we didn't create duplicate new ones)
        assert OptedInOperationDetail._base_manager.count() == 1  # 1 operation total including archived records

    @classmethod
    @patch(
        "service.facility_designated_operation_timeline_service.FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id",
    )
    def test_unregistered_update_operation_with_new_type(cls, mock_delete_facilities_by_operation_id: MagicMock):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            type=Operation.Types.SFO,
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.DRAFT,
        )
        payload = OperationInformationInUpdate(
            registration_purpose='Potential Reporting Operation',
            name="Test Update Operation Name",
            type=Operation.Types.LFO,
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        mock_delete_facilities_by_operation_id.assert_called_once_with(
            approved_user_operator.user.user_guid,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.type == Operation.Types.LFO

    @classmethod
    @patch(
        "service.facility_designated_operation_timeline_service.FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id",
    )
    def test_cannot_update_type_of_registered_operation(cls, mock_delete_facilities_by_operation_id: MagicMock):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            type=Operation.Types.SFO,
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = OperationInformationInUpdate(
            registration_purpose='Potential Reporting Operation',
            name="Test Update Operation Name",
            type=Operation.Types.LFO,
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        with pytest.raises(Exception, match="Cannot change the type of an operation that has already been registered."):
            OperationService.update_operation(approved_user_operator.user.user_guid, payload, existing_operation.id)
        mock_delete_facilities_by_operation_id.assert_not_called()

    @staticmethod
    @patch("service.operation_service.operation_registration_purpose_changed.send")
    def test_signal_emitted_on_registration_purpose_change(mock_signal_send):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='OBPS Regulated Operation',
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = OperationInformationInUpdate(
            registration_purpose='Potential Reporting Operation',
            name="Test Update Operation Name",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=MOCK_DATA_URL,
            boundary_map=MOCK_DATA_URL,
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )

        OperationService.update_operation(approved_user_operator.user.user_guid, payload, operation.id)

        mock_signal_send.assert_called_once_with(
            sender=OperationService,
            operation_id=operation.id,
        )


class TestCreateOrUpdateEio:
    @staticmethod
    @patch("service.facility_service.FacilityService.create_facilities_with_designated_operations")
    def test_create_eio(mock_create_facilities_with_designated_operations):
        user_guid = uuid4()

        registration_purpose = 'Electricity Import Operation'
        name = "TestEIO"

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            registration_purpose=registration_purpose,
            name=name,
            type=Operation.Types.EIO,
        )
        payload = FacilityIn(
            registration_purpose=registration_purpose,
            name=name,
            type=Facility.Types.ELECTRICITY_IMPORT,
            operation_id=operation.id,
        )

        OperationService._create_or_update_eio(user_guid, operation, payload)
        mock_create_facilities_with_designated_operations.assert_called_with(user_guid, [payload])

    @staticmethod
    @patch("service.facility_service.FacilityService.update_facility")
    def test_update_eio(mock_update_facility):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        registration_purpose = 'Electricity Import Operation'

        name = "TestEIO"

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            registration_purpose=registration_purpose,
            name=name,
            type=Operation.Types.EIO,
            operator=approved_user_operator.operator,
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        # create timeline record
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', operation=operation, facility=facility
        )

        payload = FacilityIn(
            operation_id=operation.id,
            registration_purpose=registration_purpose,
            name=name,
            type=Facility.Types.ELECTRICITY_IMPORT,
        )
        OperationService._create_or_update_eio(approved_user_operator.user.user_guid, operation, payload)

        mock_update_facility.assert_called_once_with(approved_user_operator.user.user_guid, facility.id, payload)


class TestOperationServiceV2CheckCurrentUsersRegisteredOperation:
    def test_check_current_users_registered_operation_returns_true(self):
        # Create a user operator and a registered operation
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Create an operation with status 'Registered'
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Registered",
        )

        # Check that the method returns True when there is a registered operation
        assert Operation.objects.count() == 1
        assert (
            OperationDataAccessService.check_current_users_registered_operation(approved_user_operator.operator.id)
            is True
        )

        # Create an operation with a different status
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Draft",
        )

        # Ensure the method still returns True with mixed statuses
        assert Operation.objects.count() == 2
        assert (
            OperationDataAccessService.check_current_users_registered_operation(approved_user_operator.operator.id)
            is True
        )

    def test_check_current_users_registered_operation_returns_false(self):
        # Create a user operator and an operation with a non-registered status
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Create an operation with a non-registered status
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Draft",
        )

        # Check that the method returns False when there is no registered operation
        assert Operation.objects.count() == 1
        assert (
            OperationDataAccessService.check_current_users_registered_operation(approved_user_operator.operator.id)
            is False
        )

    def test_returns_true_when_operation_is_registered_and_not_potential_reporting(self):
        # Create a user operator and a valid registered operation
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Create an operation with status "Registered" and a reporting registration purpose
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,  # valid reporting purpose
        )

        # Ensure one operation exists
        assert Operation.objects.count() == 1

        # Should return True because there is at least one valid registered operation.
        result = OperationDataAccessService.check_current_users_reporting_registered_operation(
            approved_user_operator.operator.id
        )
        assert result is True

    def test_returns_false_when_no_registered_operation_exists(self):
        # Create a user operator with only a non-registered operation (e.g., Draft)
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.DRAFT,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
        )

        # Only one operation exists, but with a non-registered status.
        assert Operation.objects.count() == 1

        # Should return False because there are no operations with status "Registered"
        result = OperationDataAccessService.check_current_users_reporting_registered_operation(
            approved_user_operator.operator.id
        )
        assert result is False

    def test_returns_false_when_registered_operation_is_potential_reporting(self):
        # Create a user operator with an operation that is registered but has a potential reporting purpose.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.POTENTIAL_REPORTING_OPERATION,  # should be excluded
        )

        # Should be one operation, but it must be excluded because it's potential reporting.
        assert Operation.objects.count() == 1

        result = OperationDataAccessService.check_current_users_reporting_registered_operation(
            approved_user_operator.operator.id
        )
        assert result is False

    def test_returns_true_when_mixed_operations_exist(self):
        # Create a user operator that has two registered operations: one valid and one potential reporting.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # This operation should be excluded.
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
        )

        # This operation should count.
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
        )

        # Two operations exist in total.
        assert Operation.objects.count() == 2

        # Should return True because one valid operation is present.
        result = OperationDataAccessService.check_current_users_reporting_registered_operation(
            approved_user_operator.operator.id
        )
        assert result is True


class TestRaiseExceptionIfOperationRegistrationDataIncomplete:
    @staticmethod
    def test_raises_exception_if_no_purpose():
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.DRAFT)
        # the only way to not have a registration purpose on an operation is to first set one when creating the operation,
        # then manually remove it
        operation.registration_purpose = None

        with pytest.raises(Exception, match="Operation must have a registration purpose."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_operation_rep():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.contacts.all().delete()

        with pytest.raises(Exception, match="Operation must have an operation representative with an address."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_facilities():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        FacilityDesignatedOperationTimeline.objects.filter(operation=operation).delete()

        with pytest.raises(Exception, match="Operation must have at least one facility."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_activities():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.activities.all().delete()

        with pytest.raises(Exception, match="Operation must have at least one reporting activity."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_documents():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.documents.all().delete()

        with pytest.raises(Exception, match="Operation must have a process flow diagram and a boundary map."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_documents_are_quarantined(monkeypatch):
        # This test doesn't actually hit GCS, so we want to change the env variables to hit the check for document scans
        monkeypatch.setattr(os, "environ", {"ENVIRONMENT": "develop", "CI": "false"})

        operation = set_up_valid_mock_operation(
            Operation.Purposes.OPTED_IN_OPERATION, document_scan_status="Quarantined"
        )

        with pytest.raises(
            Exception,
            match="Potential threat detected in test.pdf, test.pdf. Please go back and replace these attachments before submitting.",
        ):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_documents_are_still_unscanned(monkeypatch):
        # This test doesn't actually hit GCS, so we want to change the env variables to hit the check for document scans
        monkeypatch.setattr(os, "environ", {"ENVIRONMENT": "develop", "CI": "false"})
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION, document_scan_status="Unscanned")

        with pytest.raises(
            Exception,
            match="Please wait. Your attachments are being scanned for malware, this may take a few minutes.",
        ):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_one_of_the_documents_is_missing():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.documents.filter(type=DocumentType.objects.get(name='boundary_map')).delete()

        with pytest.raises(Exception, match="Operation must have a process flow diagram and a boundary map."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_do_not_raise_exception_if_data_complete_new_entrant():
        operation = set_up_valid_mock_operation(Operation.Purposes.NEW_ENTRANT_OPERATION)
        OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_new_entrant_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.NEW_ENTRANT_OPERATION)
        # remove statutory declaration
        operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).delete()

        with pytest.raises(
            Exception,
            match="Operation must have a signed statutory declaration and date of first shipment if it is a new entrant.",
        ):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_opt_in_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # remove opted in information
        operation.opted_in_operation = None
        operation.save()

        with pytest.raises(Exception, match="Operation must have completed opt-in information if it is opted in."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_incomplete_opt_in_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # make the opt-in record blank
        operation.opted_in_operation = baker.make(OptedInOperationDetail)
        operation.save()

        with pytest.raises(Exception, match="Operation must have completed opt-in information if it is opted in."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_do_not_raise_exception_if_data_complete_opt_in():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # test will pass if no exception raised
        OperationService.raise_exception_if_operation_missing_registration_information(operation)


class TestHandleChangeOfRegistrationPurpose:
    """
    Note that these tests are different from the integration tests for handling change of
    registration purpose as these unit tests only go as far as confirming that the
    OperationInformationIn payload is generated correctly.
    """

    @staticmethod
    def test_old_purpose_opted_in():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
        )
        opted_in_operation_detail = baker.make_recipe('registration.tests.utils.opted_in_operation_detail')
        operation.opted_in_operation = opted_in_operation_detail
        operation.save()

        assert OptedInOperationDetail.objects.count() == 1

        submitted_payload = OperationInformationIn(
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            name='Updated Operation',
            type=Operation.Types.SFO,
            activities=[1, 2, 3],
        )
        returned_payload = OperationService.handle_change_of_registration_purpose(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )

        assert returned_payload.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert OptedInOperationDetail.objects.count() == 0

        # assert handle_change_of_registration_purpose isn't modifying parts of the payload that should be untouched
        assert returned_payload.name == "Updated Operation"

    @staticmethod
    def test_old_purpose_new_entrant():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
        )
        boundary_map = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='boundary_map')
        )
        process_flow_diagram = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='process_flow_diagram')
        )
        new_entrant_application = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='new_entrant_application')
        )
        operation.documents.set([new_entrant_application, boundary_map, process_flow_diagram])

        assert Document.objects.count() == 3
        assert operation.documents.count() == 3

        submitted_payload = OperationInformationIn(
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
            name="Updated Operation",
            type=Operation.Types.SFO,
            activities=[1, 2, 3],
        )
        returned_payload = OperationService.handle_change_of_registration_purpose(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )

        assert returned_payload.date_of_first_shipment is None
        assert Document.objects.count() == 2
        assert operation.documents.count() == 2

        # assert handle_change_of_registration_purpose isn't modifying parts of the payload that should be untouched
        assert returned_payload.activities == [1, 2, 3]
        assert returned_payload.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION

    @staticmethod
    def test_new_purpose_eio():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
        )

        submitted_payload = OperationInformationIn(
            registration_purpose=Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
            name="Updated Operation",
            type=Operation.Types.EIO,
            # submitting a bunch of irrelevant data just to confirm it gets removed
            activities=operation.activities,
            regulated_products=[1, 2, 3],
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            boundary_map=MOCK_DATA_URL,
            process_flow_diagram=MOCK_DATA_URL,
        )
        returned_payload = OperationService.handle_change_of_registration_purpose(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )

        assert returned_payload.activities == []
        assert returned_payload.regulated_products == []
        assert returned_payload.naics_code_id is None
        assert returned_payload.secondary_naics_code_id is None
        assert returned_payload.tertiary_naics_code_id is None
        assert returned_payload.boundary_map is None
        assert returned_payload.process_flow_diagram is None
        assert FacilityDesignatedOperationTimeline.objects.filter(operation=operation).count() == 0
        assert operation.facilities.count() == 0

    @staticmethod
    def test_new_purpose_reporting():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        products = baker.make_recipe('registration.tests.utils.regulated_product', _quantity=3)
        activities = baker.make(Activity, _quantity=3)
        activity_pks = [activity.id for activity in activities]
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            regulated_products=products,
        )

        submitted_payload = OperationInformationIn(
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            name="Updated Operation",
            type=Operation.Types.SFO,
            activities=activity_pks,
            naics_code_id=operation.naics_code_id,
        )
        returned_payload = OperationService.handle_change_of_registration_purpose(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )

        assert returned_payload.regulated_products == []
        assert returned_payload.activities == activity_pks
        assert returned_payload.naics_code_id is not None
        assert returned_payload.registration_purpose == Operation.Purposes.REPORTING_OPERATION


class TestGenerateBoroId:
    @staticmethod
    @patch('service.operation_service.send_registration_and_boro_id_email')
    def test_generates_boro_id(mock_send_email):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        OperationService.generate_boro_id(cas_director.user_guid, operation.id)
        operation.refresh_from_db()

        assert operation.bc_obps_regulated_operation is not None
        assert operation.bc_obps_regulated_operation.issued_by == cas_director

        mock_send_email.assert_called_once_with(
            EmailTemplateNames.BORO_ID_ISSUANCE,
            operation.operator.legal_name,
            operation,
        )

    @staticmethod
    def test_raises_exception_if_operation_is_non_regulated():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        with pytest.raises(Exception, match="Non-regulated operations cannot be issued BORO ID."):
            OperationService.generate_boro_id(cas_director.user_guid, operation.id)

    @staticmethod
    def test_raises_exception_if_operation_is_not_registered():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.DRAFT,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        with pytest.raises(Exception, match="Operations must be registered before they can be issued a BORO ID."):
            OperationService.generate_boro_id(cas_director.user_guid, operation.id)

    @staticmethod
    def test_raises_exception_if_user_unauthorized():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.generate_boro_id(approved_user_operator.user.user_guid, operation.id)


class TestRemoveOperationRepresentative:
    @staticmethod
    def test_cannot_remove_anything_from_other_users_operations():
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
        )
        contact1 = baker.make_recipe('registration.tests.utils.contact', id=1)
        contact2 = baker.make_recipe('registration.tests.utils.contact', id=2)
        operation.contacts.add(contact1, contact2)
        operation.save()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.remove_operation_representative(user.user_guid, operation.id, {id: contact1.id})

    @staticmethod
    def test_removes_operation_representative():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        contact1 = baker.make_recipe('registration.tests.utils.contact', id=1)
        contact2 = baker.make_recipe('registration.tests.utils.contact', id=2)
        operation.contacts.add(contact1, contact2)
        operation.save()

        OperationService.remove_operation_representative(
            approved_user_operator.user.user_guid, operation.id, OperationRepresentativeRemove(id=contact2.id)
        )
        operation.refresh_from_db()

        assert operation.contacts.count() == 1
        assert operation.contacts.first().id == 1
        # confirm the contact was only removed from the operation, not removed from the db
        assert Contact.objects.filter(id=2).exists()


class TestUpdateOperationsOperator:
    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_unauthorized_user_cannot_update_operations_operator(mock_get_by_guid):
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        mock_get_by_guid.return_value = cas_admin
        operation = MagicMock()
        operator_id = uuid4()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.update_operator(cas_admin.user_guid, operation, operator_id)

    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_update_operations_operator_success(mock_get_by_guid):
        cas_analyst = baker.make_recipe('registration.tests.utils.cas_analyst')
        mock_get_by_guid.return_value = cas_analyst
        operation = baker.make_recipe('registration.tests.utils.operation')
        operator = baker.make_recipe('registration.tests.utils.operator')
        OperationService.update_operator(cas_analyst.user_guid, operation, operator.id)
        assert operation.operator == operator


class TestListOperationTimeline:
    @staticmethod
    def test_raise_exception_if_user_unapproved():
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.list_operations_timeline(
                user.user_guid,
                sort_field="created_at",
                sort_order="desc",
            )

    @staticmethod
    def test_gets_unfiltered_sorted_list_for_industry_user():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
        )
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
        )
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
        )

        timeline = OperationService.list_operations_timeline(
            approved_user_operator.user.user_guid,
            sort_field="created_at",
            sort_order="desc",
            filters=OperationTimelineFilterSchema(),
        )

        assert timeline.count() == 3

    @staticmethod
    def test_gets_filtered_sorted_list_for_industry_user():
        filters = OperationTimelineFilterSchema(
            operation__bcghg_id='1',
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                bcghg_id=(baker.make(BcGreenhouseGasId, id='11111111111')),
                status=Operation.Statuses.REGISTERED,
            ),
        )
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                bcghg_id=(baker.make(BcGreenhouseGasId, id='15555555555')),
                status=Operation.Statuses.REGISTERED,
            ),
        )
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                bcghg_id=(baker.make(BcGreenhouseGasId, id='29999999999')),
                status=Operation.Statuses.REGISTERED,
            ),
        )

        timeline = OperationService.list_operations_timeline(
            approved_user_operator.user.user_guid, sort_field="created_at", sort_order="desc", filters=filters
        )
        assert timeline.count() == 2


class TestChangeOperationType:
    """
    Note that these tests are different from the integration tests for handling change of
    registration purpose as these unit tests only go as far as confirming that the
    OperationInformationIn payload is generated correctly.
    """

    @classmethod
    @patch(
        "service.facility_designated_operation_timeline_service.FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id",
        autospec=True,
    )
    def test_delete_service_called_if_type_changes(cls, mock_delete_facilities_by_operation_id: MagicMock):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.SFO,
        )

        submitted_payload = OperationInformationIn(
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            name='Updated Operation',
            type=Operation.Types.SFO,
            activities=[1, 2, 3],
        )
        returned_payload = OperationService.update_operation(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )
        mock_delete_facilities_by_operation_id.assert_called_once_with(
            approved_user_operator.user.user_guid,
            operation.id,
        )

        assert returned_payload.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert OptedInOperationDetail.objects.count() == 0

        # assert handle_change_of_registration_purpose isn't modifying parts of the payload that should be untouched
        assert returned_payload.name == "Updated Operation"


class TestChangeOperationType:
    """
    Note that these tests are different from the integration tests for handling change of
    registration purpose as these unit tests only go as far as confirming that the
    OperationInformationIn payload is generated correctly.
    """

    @classmethod
    @patch(
        "service.facility_designated_operation_timeline_service.FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id",
    )
    def test_delete_service_called_if_type_changes(cls, mock_delete_facilities_by_operation_id: MagicMock):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.SFO,
        )

        submitted_payload = OperationInformationIn(
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            name='Updated Operation',
            type=Operation.Types.LFO,
            activities=[1, 2, 3],
        )
        returned_payload = OperationService.update_operation(
            approved_user_operator.user.user_guid, submitted_payload, operation.id
        )
        mock_delete_facilities_by_operation_id.assert_called_once_with(
            approved_user_operator.user.user_guid,
            operation.id,
        )

        assert returned_payload.registration_purpose == Operation.Purposes.REPORTING_OPERATION

        # assert handle_change_of_registration_purpose isn't modifying parts of the payload that should be untouched
        assert returned_payload.name == "Updated Operation"