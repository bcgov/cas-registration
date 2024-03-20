from uuid import UUID
from registration.decorators import authorize
from registration.email.schema import EmailIn, TemplateMergeIn
from registration.email.emailService import EmailService
from .api_base import router
from ninja.responses import codes_4xx
from registration.schema import Message
from registration.models import AppRole

email_service = EmailService()


##### GET #####
@router.get("/email/health-check", response={200: dict, codes_4xx: Message}, url_name="email_health_check")
@authorize(AppRole.get_authorized_irc_roles())
def get_email_health_check(request):
    response = email_service.health_check()
    return response


@router.get("/email/check-status/{message_id}", response={200: str, codes_4xx: Message}, url_name="email_check_status")
@authorize(AppRole.get_authorized_irc_roles())
def check_email_status(request, message_id: UUID):
    response = email_service.get_message_status(msgId=message_id)
    return response.get('status')


##### POST #####
@router.post("/email/send", response={200: dict, codes_4xx: Message}, url_name="send_email")
@authorize(AppRole.get_all_app_roles())
def send_email(request, payload: EmailIn):
    response = email_service.send_email(payload)
    return response


@router.post("/email/send-from-template", response={200: dict, codes_4xx: Message}, url_name="send_email_from_template")
@authorize(AppRole.get_all_app_roles())
def send_email_from_template(request, payload: TemplateMergeIn):
    response = email_service.merge_template_and_send(payload)
    return response.json()


##### DELETE #####
