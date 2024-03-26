from service.data_access_service import DataAccessService
from service.current_user_service import CurrentUserService
from registration.utils import (
    check_access_request_matches_business_guid,
)
from registration.schema import (
    SelectOperatorIn,
)
from django.shortcuts import get_object_or_404

from registration.models import (
    Operator,
    User,
    UserOperator,
)
from django.db import transaction
class ApplicationAccessService:
    def request_access(payload: SelectOperatorIn):
        operator: Operator = DataAccessService.get_operator(payload.operator_id)
        
        # this should be a method on this service and it should return a boolean or something
        status, message = check_access_request_matches_business_guid(CurrentUserService.get_user_guid(), operator)
        # too http-y for in here
        if status != 200:
            return status, message

        # Making a draft UserOperator instance if one doesn't exist
        user_operator = DataAccessService.get_or_create_user_operator()

        # brianna should nothing in the service layer be returning codes then? or are we have multiple layers, e.g. the database one which only returns db things, and then whatever layer this request access would be? or should it just be DatabaseAccessService and api endpoint?

        
        return 201, {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}
    
    # this function could just return boolean or throw exception or whatever, if we control flow with throwing errors we don't need to return anything probably better, success/fail/array of errors also an option
