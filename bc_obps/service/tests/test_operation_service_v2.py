from registration.models.regulated_product import RegulatedProduct
from registration.models.registration_purpose import RegistrationPurpose
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.address import Address
from registration.schema.v1.contact import ContactIn
from registration.models.contact import Contact
from registration.schema.v2.operation import (
    OperationRepresentativeIn,
    OperationStatutoryDeclarationIn,
    RegistrationPurposeIn,
)
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
        operation = baker.make_recipe('utils.operation', operator=random_operator)

        payload = RegistrationPurposeIn(registration_purpose='Reporting Operation')
        with pytest.raises(Exception):

            OperationServiceV2.set_registration_purpose(user.user_guid, operation.id, payload)

    @staticmethod
    def test_assigns_single_selected_purpose():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        payload = RegistrationPurposeIn(registration_purpose='Potential Reporting Operation')
        OperationServiceV2.set_registration_purpose(approved_user_operator.user.user_guid, operation.id, payload)

        registration_purposes = RegistrationPurpose.objects.filter(operation_id=operation.id)
        assert registration_purposes.count() == 1
        assert list(registration_purposes.values_list('registration_purpose', flat=True)) == [
            'Potential Reporting Operation'
        ]
        operation.refresh_from_db()  # refresh the operation object to get the updated audit columns
        assert operation.updated_at is not None
        assert operation.updated_by == approved_user_operator.user

    @staticmethod
    def test_assigns_selected_and_additional_purpose():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)

        payload = RegistrationPurposeIn(registration_purpose='OBPS Regulated Operation', regulated_products=[1, 2, 6])
        OperationServiceV2.set_registration_purpose(approved_user_operator.user.user_guid, operation.id, payload)

        registration_purposes = RegistrationPurpose.objects.filter(operation_id=operation.id)
        assert registration_purposes.count() == 2
        assert list(registration_purposes.values_list('registration_purpose', flat=True)) == [
            'OBPS Regulated Operation',
            'Reporting Operation',
        ]
        assert operation.regulated_products.count() == 3
        assert list(operation.regulated_products.values_list('name', flat=True)) == [
            RegulatedProduct.objects.get(pk=1).name,
            RegulatedProduct.objects.get(pk=2).name,
            RegulatedProduct.objects.get(pk=6).name,
        ]

    @staticmethod
    def test_assigns_selected_and_additional_purposes():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)

        payload = RegistrationPurposeIn(registration_purpose='New Entrant Operation', regulated_products=[4])
        OperationServiceV2.set_registration_purpose(approved_user_operator.user.user_guid, operation.id, payload)

        registration_purposes = RegistrationPurpose.objects.filter(operation_id=operation.id)
        assert registration_purposes.count() == 3
        assert sorted(list(registration_purposes.values_list('registration_purpose', flat=True))) == sorted(
            [
                'New Entrant Operation',
                'OBPS Regulated Operation',
                'Reporting Operation',
            ]
        )
        assert operation.regulated_products.count() == 1
        assert list(operation.regulated_products.values_list('name', flat=True)) == [
            RegulatedProduct.objects.get(pk=4).name,
        ]

    @staticmethod
    def test_assigning_opted_in_operation_will_create_and_opted_in_operation_detail():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)

        payload = RegistrationPurposeIn(registration_purpose='Opted-in Operation')
        OperationServiceV2.set_registration_purpose(approved_user_operator.user.user_guid, operation.id, payload)

        registration_purposes = RegistrationPurpose.objects.filter(operation_id=operation.id)
        assert registration_purposes.count() == 3
        assert sorted(list(registration_purposes.values_list('registration_purpose', flat=True))) == sorted(
            [
                'Opted-in Operation',
                'OBPS Regulated Operation',
                'Reporting Operation',
            ]
        )
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
    def test_update_status():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, created_by=approved_user_operator.user
        )
        updated_operation = OperationServiceV2.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()
        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.updated_by == approved_user_operator.user
        assert updated_operation.updated_at is not None

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
            new_operation_representatives=[
                ContactIn(
                    first_name="John",
                    last_name="Doe",
                    email="john.doe@example.com",
                    phone_number="+16044011234",
                    position_title="Mr.Tester",
                    street_address='13 Street',
                    municipality='municipality',
                    province='AB',
                    postal_code='H0H0H0',
                ),
                ContactIn(
                    first_name="Fruit",
                    last_name="Loops",
                    email="froot.loops@example.com",
                    phone_number="+16044011234",
                    position_title="Mx.Tester",
                ),
            ]
        )

        OperationServiceV2.register_operation_operation_representative(
            approved_user_operator.user.user_guid, operation.id, payload
        )
        operation.refresh_from_db()

        assert approved_user_operator.operator.contacts.count() == 2
        assert operation.contacts.count() == 2
        assert Address.objects.count() == 2  # 1 is the contact's, 1 is from the operation baker recipe
        first_operation_contact = operation.contacts.first()
        assert first_operation_contact.first_name == 'John'
        assert first_operation_contact.address.street_address == '13 Street'
        assert first_operation_contact.created_at is not None
        assert first_operation_contact.created_by == approved_user_operator.user
        assert operation.contacts.last().first_name == 'Fruit'
        assert operation.contacts.last().address is None

        assert operation.updated_at is not None
        assert operation.updated_by == approved_user_operator.user

    @staticmethod
    def test_assign_existing_contacts_to_operation():
        contacts = baker.make_recipe('utils.contact', _quantity=5)
        operator = baker.make_recipe('utils.operator', contacts=contacts)
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', operator=operator)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)

        payload = OperationRepresentativeIn(operation_representatives=Contact.objects.values_list('id', flat=True))

        OperationServiceV2.register_operation_operation_representative(
            approved_user_operator.user.user_guid, operation.id, payload
        )
        operation.refresh_from_db()
        assert approved_user_operator.operator.contacts.count() == 5  # existing contacts should be unaffected
        assert operation.contacts.count() == 5
        assert operation.updated_at is not None
        assert operation.updated_by == approved_user_operator.user

    @staticmethod
    def test_assign_existing_and_new_contacts_to_operation():
        contacts = baker.make_recipe('utils.contact', _quantity=5)
        operator = baker.make_recipe('utils.operator', contacts=contacts)
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', operator=operator)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)

        payload = OperationRepresentativeIn(
            operation_representatives=Contact.objects.values_list('id', flat=True),
            new_operation_representatives=[
                ContactIn(
                    first_name="John",
                    last_name="Doe",
                    email="john.doe@example.com",
                    phone_number="+16044011234",
                    position_title="Mr.Tester",
                    street_address='13 Street',
                    municipality='municipality',
                    province='AB',
                    postal_code='H0H0H0',
                ),
                ContactIn(
                    first_name="Fruit",
                    last_name="Loops",
                    email="froot.loops@example.com",
                    phone_number="+16044011234",
                    position_title="Mx.Tester",
                ),
            ],
        )

        OperationServiceV2.register_operation_operation_representative(
            approved_user_operator.user.user_guid, operation.id, payload
        )
        operation.refresh_from_db()
        assert approved_user_operator.operator.contacts.count() == 7
        assert operation.updated_at is not None
        assert operation.updated_by == approved_user_operator.user
        assert operation.contacts.count() == 7
        assert Address.objects.count() == 2  # 1 is the contact's, 1 is from the operation baker recipe

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
    def test_create_or_replace_statutory_declaration():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, created_by=approved_user_operator.user
        )
        payload = OperationStatutoryDeclarationIn(statutory_declaration=MOCK_DATA_URL)
        operation = OperationServiceV2.create_or_replace_statutory_declaration(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        # Just returning the operation without the statutory_declaration due to performance reasons
        assert operation.id == users_operation.id
        assert operation.updated_by == approved_user_operator.user
        assert operation.updated_at is not None

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
            equipment_list=MOCK_DATA_URL,
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
        assert operation.registration_purposes.count() == 1

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
            equipment_list=MOCK_DATA_URL,
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
        assert operation.registration_purposes.count() == 1


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
            equipment_list=MOCK_DATA_URL,
        )
        operation = OperationServiceV2.create_or_update_operation_v2(
            approved_user_operator.user.user_guid,  payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 3
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
            equipment_list=MOCK_DATA_URL,
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
            approved_user_operator.user.user_guid,  payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.created_by == approved_user_operator.user
        assert operation.created_at is not None
        assert MultipleOperator.objects.count() == 2
        assert MultipleOperator.objects.first().bc_corporate_registry_number == 'ghj1234567'
        assert MultipleOperator.objects.last().bc_corporate_registry_number is None

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
            equipment_list=MOCK_DATA_URL,
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
            approved_user_operator.user.user_guid,  payload, existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 3
        assert operation.multiple_operators.count() == 2
        assert operation.multiple_operators.first().legal_name == 'i am new'
        assert operation.multiple_operators.last().legal_name == 'i am new 2'
        assert operation.name == "I am updated"
        assert operation.updated_by == approved_user_operator.user
        assert operation.updated_at is not None

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
            equipment_list=MOCK_DATA_URL,
        )

        operation = OperationServiceV2.create_or_update_operation_v2(
            approved_user_operator.user.user_guid,  payload, existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.multiple_operators.count() == 0
        assert operation.updated_by == approved_user_operator.user
        assert operation.updated_at is not None
