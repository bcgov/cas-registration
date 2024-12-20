from uuid import UUID

from registration.models import Operation


class OperationDataAccessServiceV2:
    @classmethod
    def check_current_users_registered_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered', False otherwise.
        """
        return Operation.objects.filter(operator_id=operator_id, status="Registered").exists()
