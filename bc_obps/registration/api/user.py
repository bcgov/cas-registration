from .api_base import router
from registration.models import User
from typing import List
from registration.schema import UserOut


##### GET #####

# @router.get("/users", response=List[UserOut])
# def list_users(request):
#     qs = User.objects.all()
#     return qs

# @router.get(
#     "/select-operator/user-operator/{int:user_operator_id}",
#     response=UserOperatorOut,
# )
# def get_user_operator(request, user_operator_id: int):
#     user_operator = get_object_or_404(UserOperator, id=user_operator_id)
#     user: User = user_operator.user
#     user_related_fields_dict = model_to_dict(
#         user,
#         fields=[
#             "first_name",
#             "last_name",
#             "position_title",
#             "street_address",
#             "municipality",
#             "province",
#             "postal_code",
#             "email",
#         ],
#     )
#     operator: Operator = user_operator.operator
#     operator_related_fields_dict = model_to_dict(
#         operator,
#         fields=[
#             "legal_name",
#             "trade_name",
#             "cra_business_number",
#             "bc_corporate_registry_number",
#             "business_structure",
#             "physical_street_address",
#             "physical_municipality",
#             "physical_province",
#             "physical_postal_code",
#             "mailing_street_address",
#             "mailing_municipality",
#             "mailing_province",
#             "mailing_postal_code",
#             "website",
#         ],
#     )

#     return {
#         **user_related_fields_dict,
#         "phone_number": user.phone_number.as_e164,  # PhoneNumberField returns a PhoneNumber object and we need a string
#         **operator_related_fields_dict,
#     }


##### POST #####


##### PUT #####


##### POST #####


##### PUT #####


##### DELETE #####
