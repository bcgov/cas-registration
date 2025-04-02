import pytest
from model_bakery import baker
from registration.models import Operation
from django.core.exceptions import ValidationError

pytestmark = pytest.mark.django_db


@pytest.fixture
def cas_director():
    return baker.make_recipe('registration.tests.utils.cas_director')


@pytest.fixture
def registered_operation():
    return baker.make_recipe(
        'registration.tests.utils.operation',
        status=Operation.Statuses.REGISTERED,
        type=Operation.Types.LFO,
        naics_code=baker.make_recipe('registration.tests.utils.naics_code', naics_code='322121'),
    )


@pytest.fixture
def facility(registered_operation):
    return baker.make_recipe('registration.tests.utils.facility', operation=registered_operation)


class TestGenerateUniqueBcghgIdForOperationOrFacility:
    def test_cannot_create_operation_with_duplicate_bcghg_id(self, registered_operation):
        bcghg_id = baker.make_recipe('registration.tests.utils.bcghg_id', id='14121100001')
        registered_operation.bcghg_id = bcghg_id
        registered_operation.save(update_fields=['bcghg_id'])
        with pytest.raises(ValidationError, match='Operation with this Bcghg id already exists.'):
            baker.make_recipe(
                'registration.tests.utils.operation', bcghg_id=bcghg_id, status=Operation.Statuses.REGISTERED
            )

    def test_cannot_create_facility_with_duplicate_bcghg_id(self, registered_operation, facility):
        bcghg_id = baker.make_recipe('registration.tests.utils.bcghg_id', id='14121100001')
        facility.bcghg_id = bcghg_id
        facility.save(update_fields=['bcghg_id'])
        with pytest.raises(ValidationError, match='Facility with this Bcghg id already exists.'):
            baker.make_recipe('registration.tests.utils.facility', bcghg_id=bcghg_id, operation=registered_operation)

    def test_does_not_generate_if_record_has_existing_bcghg_id(self, registered_operation, cas_director):
        existing_id = baker.make_recipe('registration.tests.utils.bcghg_id', id='14121100001')
        registered_operation.bcghg_id = existing_id
        registered_operation.save(update_fields=['bcghg_id'])
        registered_operation.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        assert registered_operation.bcghg_id == existing_id

    @pytest.mark.parametrize(
        "op_type, expected_prefix",
        [
            (Operation.Types.SFO, "1"),
            (Operation.Types.LFO, "2"),
        ],
    )
    def test_generate_unique_bcghg_id_for_operation(self, cas_director, op_type, expected_prefix):
        """Test BCGHG ID generation for operations with different types."""
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            type=op_type,
            status=Operation.Statuses.REGISTERED,
            naics_code=baker.make_recipe('registration.tests.utils.naics_code', naics_code='322121'),
        )
        operation.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        expected_id = f"{expected_prefix}3221210001"
        assert operation.bcghg_id.pk == expected_id

    def test_generate_unique_bcghg_id_for_facility(self, facility, cas_director):
        facility.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        expected_id = f"2{facility.operation.naics_code.naics_code}0001"
        assert facility.bcghg_id.pk == expected_id

    def test_generate_unique_bcghg_id_multiple_existing_ids(self, registered_operation, facility, cas_director):
        existing_ids = ['13221210001', '13221210002', '13221210003', '23221210001', '23221210002']
        for existing_id in existing_ids:
            baker.make_recipe('registration.tests.utils.bcghg_id', id=existing_id)

        # Generate ID for operation
        registered_operation.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        assert registered_operation.bcghg_id.pk == '23221210003'

        # Generate ID for facility
        facility.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        assert facility.bcghg_id.pk == '23221210004'

    def test_missing_naics_code_raises_error(self, cas_director):
        operation = baker.make_recipe(
            'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, naics_code=None
        )
        with pytest.raises(ValueError, match='BCGHG cannot be generated. Missing NAICS code.'):
            operation.generate_unique_bcghg_id(user_guid=cas_director.user_guid)

    @pytest.mark.parametrize(
        "status", [Operation.Statuses.DRAFT, Operation.Statuses.NOT_STARTED, Operation.Statuses.DECLINED]
    )
    def test_invalid_status_raises_error(self, cas_director, status):
        operation = baker.make_recipe('registration.tests.utils.operation', status=status, type=Operation.Types.LFO)
        with pytest.raises(ValueError, match='Operation must be registered before generating a BCGHG ID.'):
            operation.generate_unique_bcghg_id(user_guid=cas_director.user_guid)

    def test_invalid_operation_type_raises_error(self, cas_director):
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        operation.type = "INVALID"
        with pytest.raises(ValueError, match='Invalid operation type: INVALID'):
            operation.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
