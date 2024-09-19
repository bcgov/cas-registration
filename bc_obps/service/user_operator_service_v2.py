from typing import Dict
from uuid import UUID

from django.db import transaction
from registration.utils import update_model_instance
from registration.models import Operator, UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from registration.schema.v2.operator import OperatorIn
from service.operator_service_v2 import OperatorServiceV2

class UserOperatorServiceV2:
    
    # Function to create operator instance
    @classmethod
    @transaction.atomic()
    def save_operator(
        cls, updated_data: OperatorIn, operator_instance: Operator, user_guid: UUID
    ) -> Operator:
        # fields to update on the Operator model
        operator_related_fields = [
            "legal_name",
            "trade_name",
            "business_structure",
            "cra_business_number",
            "bc_corporate_registry_number",
        ]
        created_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, updated_data.dict()
        )
        created_operator_instance.save(update_fields=operator_related_fields + ["status"])
        created_operator_instance.set_create_or_update(user_guid)

        return created_operator_instance

    @classmethod
    @transaction.atomic()

    def create_operator_and_user_operator(cls, user_guid: UUID, payload: OperatorIn)  -> Dict[str, UUID]:
        """
        Function to create a user_operator and an operator

        Parameters:
            payload: Request payload from Operator form POST
            user_guid: GUID of the user.

        Returns:
            dict: A dictionary containing the IDs of the created user_operator and operator.
                - 'user_operator_id' (UUID): ID of the user_operator.
                - 'operator_id' (UUID): ID of the operator.

        """
       
       # create/save operator instance as approved
        operator_instance: Operator = Operator(
            cra_business_number=payload.cra_business_number,
            bc_corporate_registry_number=payload.bc_corporate_registry_number,
            business_structure=payload.business_structure,
            status=Operator.Statuses.APPROVED,
        )
        operator: Operator = cls.save_operator(payload, operator_instance, user_guid)

        # create/save user operator instance as an approved admin
        user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator.id)
        if created:
            user_operator.set_create_or_update(user_guid)
            user_operator.role= UserOperator.Roles.ADMIN
            user_operator.status= UserOperator.Statuses.APPROVED
            user_operator.save()
       
        # update the user operator operator with data in the request payload
        OperatorServiceV2.update_operator(user_guid, payload)
        
        return {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}

 