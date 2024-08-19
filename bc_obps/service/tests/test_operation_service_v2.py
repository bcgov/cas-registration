from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.operation import Operation
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.regulated_product import RegulatedProduct
from registration.models.registration_purpose import RegistrationPurpose
from registration.schema.v2.operation import RegistrationPurposeIn, OperationStatutoryDeclarationIn
from registration.tests.constants import MOCK_DATA_URL
from service.operation_service_v2 import OperationServiceV2
import pytest

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

            OperationServiceV2.register_operation_information(user.user_guid, operation.id, payload)

    @staticmethod
    def test_assigns_single_selected_purpose():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        payload = RegistrationPurposeIn(registration_purpose='Potential Reporting Operation')
        OperationServiceV2.register_operation_information(approved_user_operator.user.user_guid, operation.id, payload)

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
        OperationServiceV2.register_operation_information(approved_user_operator.user.user_guid, operation.id, payload)

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
        OperationServiceV2.register_operation_information(approved_user_operator.user.user_guid, operation.id, payload)

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
        OperationServiceV2.register_operation_information(approved_user_operator.user.user_guid, operation.id, payload)

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
    def test_list_current_users_operations():

        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        # operation for a different user_operator
        baker.make_recipe('utils.operation')

        result = OperationServiceV2.list_current_users_operations(approved_user_operator.user.user_guid)
        assert Operation.objects.count() == 2
        assert len(result) == 1
        assert result[0] == users_operation

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
    # Uncomment this skip to test file uploads locally
    @pytest.mark.skip(
        reason="This test passes locally but will fail in CI since we don't have Google Cloud Storage set up for CI"
    )
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
