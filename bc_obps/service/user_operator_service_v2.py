import pdb
from typing import Dict
from uuid import UUID

from django.db import transaction
from registration.utils import update_model_instance
from registration.models import Operator, UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from registration.schema.v2.operator import OperatorIn
from service.operator_service_v2 import OperatorServiceV2

class UserOperatorServiceV2:
    
    # Function to create/update an operator when creating/updating a user_operator
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
        created_or_updated_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, updated_data.dict()
        )
        created_or_updated_operator_instance.save(update_fields=operator_related_fields + ["status"])
        created_or_updated_operator_instance.set_create_or_update(user_guid)

        return created_or_updated_operator_instance

    @classmethod
    @transaction.atomic()

    def create_operator_and_user_operator(cls, user_guid: UUID, payload: OperatorIn) -> Operator:
    #def create_operator_and_user_operator(cls, user_guid: UUID, payload: OperatorIn) -> Dict[str, UUID]:
        """
        Function to create a user_operator and an operator (new operator that doesn't exist yet).

        Parameters:
            payload: Request payload from Operator form POST
            user_guid: GUID of the user.

        Returns:
            dict: A dictionary containing the IDs of the created user_operator and operator.
                - 'user_operator_id' (UUID): ID of the user_operator.
                - 'operator_id' (UUID): ID of the operator.

        """
       
        operator_instance: Operator = Operator(
            cra_business_number=payload.cra_business_number,
            bc_corporate_registry_number=payload.bc_corporate_registry_number,
            # treating business_structure as a foreign key
            business_structure=payload.business_structure,  # type: ignore[misc] # we use field validator which returns a BusinessStructure object
            status=Operator.Statuses.APPROVED,
        )
        # save operator
        operator: Operator = cls.save_operator(payload, operator_instance, user_guid)

        # get an existing user_operator instance or create a new one with the default role
        user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator.id)
        if created:
            user_operator.set_create_or_update(user_guid)
            user_operator.role= UserOperator.Roles.ADMIN;
            user_operator.status= UserOperator.Statuses.APPROVED;
            user_operator.save();
       
        # update the operator with data in the request payload
        OperatorServiceV2.update_operator(user_guid, payload)
        
        return {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}

 