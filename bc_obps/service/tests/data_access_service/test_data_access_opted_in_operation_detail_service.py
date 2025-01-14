import pytest
from service.data_access_service.opted_in_operation_detail_service import OptedInOperationDataAccessService
from registration.models.operation import Operation, OptedInOperationDetail
from model_bakery import baker
from registration.schema.v2.operation import OptedInOperationDetailIn

pytestmark = pytest.mark.django_db


class TestDataAccessOptedInOperationService:
    @staticmethod
    def test_update_opted_in_operation_detail():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'utils.operation',
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            created_by=approved_user_operator.user,
            opted_in_operation=baker.make_recipe(
                'utils.opted_in_operation_detail', created_by=approved_user_operator.user
            ),
            operator=approved_user_operator.operator,
            opt_in=True,
        )

        opted_in_operation_detail_payload = OptedInOperationDetailIn(
            meets_section_3_emissions_requirements=False,
            meets_electricity_import_operation_criteria=True,
            meets_entire_operation_requirements=True,
            # changing section_6 value from True in opted_in_operation_detail baker recipe
            meets_section_6_emissions_requirements=False,
            meets_naics_code_11_22_562_classification_requirements=True,
            meets_producing_gger_schedule_a1_regulated_product=False,
            meets_reporting_and_regulated_obligations=False,
            meets_notification_to_director_on_criteria_change=False,
        )
        opted_in_operation_detail = OptedInOperationDataAccessService.update_opted_in_operation_detail(
            approved_user_operator.user.user_guid,
            users_operation.opted_in_operation.id,
            opted_in_operation_detail_payload,
        )
        users_operation.refresh_from_db()
        assert opted_in_operation_detail.id == users_operation.opted_in_operation.id
        assert OptedInOperationDetail.objects.count() == 1
        assert users_operation.opted_in_operation is not None
        assert users_operation.opt_in is True
        assert users_operation.opted_in_operation.meets_section_3_emissions_requirements is False
        assert users_operation.opted_in_operation.meets_electricity_import_operation_criteria is True
        assert users_operation.opted_in_operation.meets_entire_operation_requirements is True
        assert users_operation.opted_in_operation.meets_section_6_emissions_requirements is False
        assert users_operation.opted_in_operation.meets_naics_code_11_22_562_classification_requirements is True
        assert users_operation.opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is False
        assert users_operation.opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert users_operation.opted_in_operation.meets_notification_to_director_on_criteria_change is False
        assert users_operation.opted_in_operation.updated_by == approved_user_operator.user
        assert users_operation.opted_in_operation.updated_at is not None

    @staticmethod
    def test_archive_or_delete_opted_in_operation_detail():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'utils.operation',
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            created_by=approved_user_operator.user,
            opted_in_operation=baker.make_recipe(
                'utils.opted_in_operation_detail', created_by=approved_user_operator.user
            ),
            operator=approved_user_operator.operator,
            opt_in=True,
        )
        assert OptedInOperationDetail.objects.count() == 1
        OptedInOperationDataAccessService.archive_or_delete_opted_in_operation_detail(
            approved_user_operator.user.user_guid, users_operation.id
        )
        users_operation.refresh_from_db()
        # at the moment there's no easy way to tell whether a record has been deleted or archived, so not testing any further than
        # this for now. We may eventually need to implement a way to fetch archived records from the db.
        assert users_operation.opted_in_operation is None
        assert OptedInOperationDetail.objects.count() == 0
