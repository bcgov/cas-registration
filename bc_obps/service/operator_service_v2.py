from registration.schema.v2.partner_operator import PartnerOperatorIn
from service.data_access_service.partner_operator_service import PartnerOperatorService
from service.data_access_service.address_service import AddressDataAccessService
from service.data_access_service.parent_operator_service import ParentOperatorService
from service.data_access_service.user_service import UserDataAccessService
from service.email.email_service import EmailService
from registration.models import Operator
from service.data_access_service.operator_service import OperatorDataAccessService
from uuid import UUID
from django.db import transaction
from registration.models import (
    Address,
)
from registration.schema.v2.operator import OperatorIn
from registration.schema.v2.parent_operator import ParentOperatorIn

email_service = EmailService()


class OperatorServiceV2:
    @classmethod
    @transaction.atomic()
    def upsert_partner_operators(
        cls, operator: Operator, partner_operator_data: list[PartnerOperatorIn] | None, user_guid: UUID
    ) -> None:
        # this function is for reg2

        # if all partner operators have been removed, archive them
        if not partner_operator_data:
            for old_partner in operator.partner_operators.all():
                old_partner.set_archive(user_guid)

        if partner_operator_data:
            old_partner_operators = list(operator.partner_operators.all())

            new_partner_operators = []
            for partner in partner_operator_data:
                new_partner_operators.append(
                    PartnerOperatorService.create_or_update(partner.id, operator, user_guid, partner.dict())
                )

            for old_partner in old_partner_operators:
                if old_partner not in new_partner_operators:
                    old_partner.set_archive(user_guid)

    @classmethod
    @transaction.atomic()
    def upsert_parent_operators(
        cls, operator: Operator, parent_operator_data: list[ParentOperatorIn] | None, user_guid: UUID
    ) -> None:
        # this function is for reg2
        # if all parent operators have been removed, archive them
        if not parent_operator_data:
            for old_parent in operator.parent_operators.all():
                old_parent.set_archive(user_guid)

        if parent_operator_data:
            old_parent_operators = list(operator.parent_operators.all())
            new_parent_operators = []
            for po in parent_operator_data:
                po_operator_data: dict = po.dict(
                    include={'legal_name', 'cra_business_number', 'foreign_address', 'foreign_tax_id_number'}
                )
                old_address_id = po.mailing_address
                new_address = po.dict(
                    include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
                )
                if old_address_id and not new_address:
                    old_address = Address.objects.all().get(id=old_address_id)
                    po_operator_data['mailing_address'] = None
                    old_address.delete()

                if new_address:
                    updated_mailing_address = AddressDataAccessService.upsert_address_from_data(
                        new_address, old_address_id
                    )
                    po_operator_data['mailing_address'] = updated_mailing_address

                new_parent_operators.append(
                    ParentOperatorService.create_or_update(po.id, operator, user_guid, po_operator_data)
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
