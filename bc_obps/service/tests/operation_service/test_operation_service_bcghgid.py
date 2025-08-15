from model_bakery import baker
import pytest
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.operation import Operation
from service.operation_service import OperationService

pytestmark = pytest.mark.django_db


class TestManageBCGHGId:
    @staticmethod
    def test_raise_exception_if_user_not_cas_director():
        cas_analyst = baker.make_recipe('registration.tests.utils.cas_analyst')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.generate_bcghg_id(cas_analyst.user_guid, operation.id)

    @staticmethod
    def test_generate_bcghg_id_for_sfo():
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.SFO,
        )
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        OperationService.generate_bcghg_id(cas_director.user_guid, operation.id)
        operation.refresh_from_db()
        facility.refresh_from_db()

        assert operation.bcghg_id is not None
        assert operation.bcghg_id.issued_by == cas_director
        assert facility.bcghg_id == operation.bcghg_id
        assert facility.bcghg_id.issued_by == cas_director

    @staticmethod
    def test_generate_bcghg_id_for_lfo():
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.LFO,
        )
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        OperationService.generate_bcghg_id(cas_director.user_guid, operation.id)
        operation.refresh_from_db()
        facility.refresh_from_db()

        assert operation.bcghg_id is not None
        assert operation.bcghg_id.issued_by == cas_director
        assert facility.bcghg_id is None

    def test_generate_bcghg_id_with_manual_id_success(self):
        """Test generating BCGHG ID with manually provided ID"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        baker.make_recipe('registration.tests.utils.facility', operation=operation)

        manual_bcghg_id = "11234567890"

        result = OperationService.generate_bcghg_id(cas_director.user_guid, operation.id, manual_bcghg_id)

        assert result.id == manual_bcghg_id
        assert result.issued_by_id == cas_director.user_guid
        assert result.comments == 'bcghg id manually set to operation'

        operation.refresh_from_db()
        assert operation.bcghg_id.id == manual_bcghg_id

    def test_generate_bcghg_id_with_existing_manual_id(self):
        """Test using an existing manually set BCGHG ID"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        baker.make_recipe('registration.tests.utils.facility', operation=operation)

        existing_bcghg_id = "11234560000"

        # Create existing BCGHG ID
        BcGreenhouseGasId.objects.create(id=existing_bcghg_id, issued_by_id=cas_director.user_guid, comments='test')

        result = OperationService.generate_bcghg_id(cas_director.user_guid, operation.id, existing_bcghg_id)

        assert result.id == existing_bcghg_id

        operation.refresh_from_db()
        assert operation.bcghg_id.id == existing_bcghg_id

    def test_generate_bcghg_id_sfo_with_manual_id_updates_facility(self):
        """Test that SFO facilities get the manually set BCGHG ID"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, type=Operation.Types.SFO
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        manual_bcghg_id = "11234567890"

        result = OperationService.generate_bcghg_id(cas_director.user_guid, operation.id, manual_bcghg_id)

        facility.refresh_from_db()
        operation.refresh_from_db()

        assert operation.bcghg_id.id == manual_bcghg_id
        assert facility.bcghg_id.id == manual_bcghg_id
        assert result.id == manual_bcghg_id

    def test_generate_bcghg_id_lfo_with_manual_id_does_not_update_facility(self):
        """Test that LFO facilities get the manually set BCGHG ID"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, type=Operation.Types.LFO
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        manual_bcghg_id = "11234567890"

        result = OperationService.generate_bcghg_id(cas_director.user_guid, operation.id, manual_bcghg_id)

        facility.refresh_from_db()
        operation.refresh_from_db()

        assert operation.bcghg_id.id == manual_bcghg_id
        assert facility.bcghg_id is None
        assert result.id == manual_bcghg_id

    def test_generate_bcghg_id_manual_id_unauthorized_user_raises_exception(self):
        """Test that non-CAS director cannot manually set BCGHG ID"""
        industry_user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.generate_bcghg_id(industry_user.user_guid, operation.id, "11111111111")

    def test_clear_bcghg_id(self):
        """Test clearing BCGHG ID for an operation"""
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
            operator=approved_user_operator.operator,
            bcghg_id=baker.make_recipe(
                'registration.tests.utils.bc_greenhouse_gas_id',
                issued_by=approved_user_operator.user,
            ),
        )

        OperationService.clear_bcghg_id(approved_user_operator.user.user_guid, operation.id)
        operation.refresh_from_db()

        assert operation.bcghg_id is None
