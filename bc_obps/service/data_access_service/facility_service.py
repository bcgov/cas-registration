from service.user_operator_service import UserOperatorService
from registration.models import Facility, User
from django.db.models import QuerySet


class FacilityDataAccessService:
    @classmethod
    def get_all_facilities_for_user(cls, user: User) -> QuerySet[Facility]:
        queryset = Facility.objects.all()
        if user.is_irc_user():
            # IRC users can see all facilities
            return queryset
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return queryset.filter(ownerships__operation__operator_id=user_operator.operator_id).distinct()
