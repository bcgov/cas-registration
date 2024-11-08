import pytest
from model_bakery import baker
from registration.schema.v2.operation import OptedInOperationDetailIn
from service.operation_service_v2 import OperationServiceV2
from service.operation_service import OperationService

pytestmark = pytest.mark.django_db


class TestDataAccessOptedInOperationService:
    @staticmethod
    def test_update_opted_in_operation_detail():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            registration_purpose='Opted-in Operation',
        )
        opted_in_operation_detail_payload = OptedInOperationDetailIn(
            meets_section_3_emissions_requirements=True,
            meets_electricity_import_operation_criteria=True,
            meets_entire_operation_requirements=True,
            meets_section_6_emissions_requirements=True,
            meets_naics_code_11_22_562_classification_requirements=True,
            meets_producing_gger_schedule_a1_regulated_product=False,
            meets_reporting_and_regulated_obligations=False,
            meets_notification_to_director_on_criteria_change=False,
        )
        opted_in_operation = OperationServiceV2.update_opted_in_operation_detail(
            approved_user_operator.user.user_guid, users_operation.id, opted_in_operation_detail_payload
        )
        updated_operation = OperationService.get_if_authorized(
            approved_user_operator.user.user_guid, users_operation.id
        )
        opted_in_operation.refresh_from_db()
        assert opted_in_operation is not None
        assert opted_in_operation.meets_section_3_emissions_requirements is True
        assert opted_in_operation.meets_electricity_import_operation_criteria is True
        assert opted_in_operation.meets_entire_operation_requirements is True
        assert opted_in_operation.meets_section_6_emissions_requirements is True
        assert opted_in_operation.meets_naics_code_11_22_562_classification_requirements is True
        assert opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is False
        assert opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert opted_in_operation.meets_notification_to_director_on_criteria_change is False
        assert opted_in_operation.updated_by == approved_user_operator.user
        assert opted_in_operation.updated_at is not None
        assert updated_operation.opt_in is True
