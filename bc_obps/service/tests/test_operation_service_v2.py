from registration.models.operation import Operation
from registration.models.regulated_product import RegulatedProduct
from registration.models.registration_purpose import RegistrationPurpose
from registration.schema.v2.operation import RegistrationPurposeIn
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
        assert list(registration_purposes.values_list('registration_purpose', flat=True)) == [
            'New Entrant Operation',
            'OBPS Regulated Operation',
            'Reporting Operation',
        ]
        assert operation.regulated_products.count() == 1
        assert list(operation.regulated_products.values_list('name', flat=True)) == [
            RegulatedProduct.objects.get(pk=4).name,
        ]

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
