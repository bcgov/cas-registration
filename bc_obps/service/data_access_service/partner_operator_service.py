from registration.models.operator import Operator
from registration.models.partner_operator import PartnerOperator
from ninja.types import DictStrAny


class PartnerOperatorService:
    @classmethod
    def create_or_update(
        cls, partner_operator_id: int, bc_obps_operator: Operator, data: DictStrAny
    ) -> PartnerOperator:
        partner_operator_instance, _ = PartnerOperator.objects.update_or_create(
            pk=partner_operator_id, defaults={**data, 'bc_obps_operator': bc_obps_operator}
        )

        return partner_operator_instance
