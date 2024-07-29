from registration.models.parent_operator import ParentOperator
from registration.models.partner_operator import PartnerOperator
from registration.schema.v2.partner_operator import PartnerOperatorIn
from service.data_access_service.partner_operator_service import PartnerOperatorService
from service.data_access_service.address_service import AddressDataAccessService
from service.data_access_service.parent_operator_service import ParentOperatorService
from service.data_access_service.user_service import UserDataAccessService
from registration.models import Operator
from service.data_access_service.operator_service import OperatorDataAccessService
from uuid import UUID
from django.db import transaction
from registration.models import (
    Address,
)
from registration.schema.v2.operator import OperatorIn
from registration.schema.v2.parent_operator import ParentOperatorIn
from django.db.models import QuerySet


class OperatorServiceV2:
    @classmethod
    @transaction.atomic()
    def upsert_partner_operators(
        cls, operator: Operator, partner_operator_data: list[PartnerOperatorIn] | None, user_guid: UUID
    ) -> None:
        old_partner_operators: QuerySet[PartnerOperator] = operator.partner_operators.all()

        # If all partner operators have been removed, archive them
        if not partner_operator_data:
            for old_partner in old_partner_operators:
                old_partner.set_archive(user_guid)
            return

        # Otherwise, create or update the partner operators
        new_partner_operators = [
            PartnerOperatorService.create_or_update(partner.id, operator, user_guid, partner.dict())  # type: ignore[attr-defined]
            for partner in partner_operator_data
        ]

        for old_partner in old_partner_operators:
            if old_partner not in new_partner_operators:
                old_partner.set_archive(user_guid)

    @classmethod
    @transaction.atomic()
    def upsert_parent_operators(
        cls, operator: Operator, parent_operators_data: list[ParentOperatorIn] | None, user_guid: UUID
    ) -> None:
        old_parent_operators: QuerySet[ParentOperator] = operator.parent_operators.all()
        # if all parent operators have been removed, archive them
        if not parent_operators_data:
            for old_parent in old_parent_operators:
                old_parent.set_archive(user_guid)
            return

        new_parent_operators = []
        for po_data in parent_operators_data:
            po_operator_data: dict = po_data.dict(
                include={'legal_name', 'cra_business_number', 'foreign_address', 'foreign_tax_id_number'}
            )
            old_address_id = po_data.mailing_address
            new_address = po_data.dict(
                include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
            )
            if old_address_id and not new_address:
                old_address = Address.objects.get(id=old_address_id)
                po_operator_data['mailing_address'] = None
                old_address.delete()

            if new_address:
                updated_mailing_address = AddressDataAccessService.upsert_address_from_data(new_address, old_address_id)
                po_operator_data['mailing_address'] = updated_mailing_address

            new_parent_operators.append(
                ParentOperatorService.create_or_update(po_data.id, operator, user_guid, po_operator_data)
            )

        for old_parent in old_parent_operators:
            if old_parent not in new_parent_operators:
                old_parent.set_archive(user_guid)

    @classmethod
    @transaction.atomic()
    def update_operator(cls, user_guid: UUID, payload: OperatorIn) -> Operator:
        # users can only update their own operators
        operator_id = UserDataAccessService.get_operator_by_user(user_guid).id
        parent_operator_data = payload.parent_operators_array
        partner_operator_data = payload.partner_operators_array
        operator_data: dict = payload.dict(
            include={
                'legal_name',
                'trade_name',
                'business_structure',
                'cra_business_number',
                'bc_corporate_registry_number',
            }
        )
        address_data = payload.dict(include={'street_address', 'municipality', 'province', 'postal_code'})
        mailing_address = AddressDataAccessService.upsert_address_from_data(address_data, payload.mailing_address)
        operator_data['mailing_address'] = mailing_address
        operator = OperatorDataAccessService.update_operator(user_guid, operator_id, operator_data)

        # partner operators
        cls.upsert_partner_operators(operator, partner_operator_data, user_guid)

        # parent operators
        cls.upsert_parent_operators(operator, parent_operator_data, user_guid)

        return operator