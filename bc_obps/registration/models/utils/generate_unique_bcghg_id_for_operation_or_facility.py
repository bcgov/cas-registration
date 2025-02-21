from uuid import UUID
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.facility import Facility
from registration.models.operation import Operation
from registration.enums.enums import OperationTypes


def generate_unique_bcghg_id_for_operation_or_facility(record: Operation | Facility, user_guid: UUID) -> None:
    """
    Generate a unique BCGHG ID for an operation or facility based on the operation type, NAICS code, and the latest BCGHG ID with the same type and code.
    """
    # if the operation or facility already has a BCGHG ID, do nothing
    if record.bcghg_id:
        return None

    operation = record.current_designated_operation if isinstance(record, Facility) else record

    if not operation.naics_code:
        raise ValueError('BCGHG cannot be generated. Missing NAICS code.')

    if operation.type == OperationTypes.SFO:
        first_digit = '1'
    elif operation.type == OperationTypes.LFO:
        first_digit = '2'
    else:
        raise ValueError(f"Invalid operation type: {operation.type}")

    naics_code = operation.naics_code.naics_code
    latest_bcghg_id = (
        BcGreenhouseGasId.objects.filter(id__startswith=str(first_digit + naics_code))
        .order_by('-id')
        .values_list('id', flat=True)
        .first()
    )

    if latest_bcghg_id:
        new_bcghg_id = str(int(latest_bcghg_id) + 1)
    else:
        new_bcghg_id = str(f"{first_digit}{naics_code}{1:04d}")  # Pad the number with zeros to make it 4 digits long
    new_bcghg_id_instance = BcGreenhouseGasId.objects.create(id=new_bcghg_id, issued_by_id=user_guid)
    record.bcghg_id = new_bcghg_id_instance
