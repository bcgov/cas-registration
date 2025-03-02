from service.email.email_service import EmailService
from registration.models import Operator
from typing import List, Optional, Union
from django.db.models import QuerySet
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.schema import OperatorSearchOut

email_service = EmailService()


class OperatorService:
    @classmethod
    def get_operators_by_cra_number_or_legal_name(
        cls, cra_business_number: Optional[int] = None, legal_name: Optional[str] = ""
    ) -> Union[Operator, QuerySet[Operator], OperatorSearchOut, List[OperatorSearchOut]]:
        if not cra_business_number and not legal_name:
            raise Exception("No search value provided")
        if cra_business_number:
            try:
                operator: Operator = OperatorDataAccessService.get_operators_by_cra_number(cra_business_number)
                return OperatorSearchOut.model_validate(operator)
            except Exception:
                raise Exception("No matching operator found. Retry or add operator.")
        elif legal_name:
            try:
                operators: QuerySet[Operator] = OperatorDataAccessService.get_operators_by_legal_name(legal_name)
                return [OperatorSearchOut.model_validate(operator) for operator in operators]
            except Exception:
                raise Exception("No matching operator found. Retry or add operator.")
        return []