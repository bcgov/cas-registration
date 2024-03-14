from uuid import UUID
from registration.decorators import authorize
from registration.email.schema import EmailOutData
from registration.email.emailService import EmailService
from .api_base import router
from ninja.responses import codes_4xx
from registration.schema import Message
from registration.models import AppRole

email_service = EmailService()


##### GET #####
@router.get("/email/health-check", response={codes_4xx: Message}, url_name="email_health_check")
@authorize(AppRole.get_authorized_irc_roles())
def get_email_health_check(request):
    response = email_service.health_check()
    print("response from endpoint ", response)
    return response


@router.get("/email/check-status/{message_id}", response={codes_4xx: Message}, url_name="email_check_status")
@authorize(AppRole.get_authorized_irc_roles())
def check_email_status(request, message_id: UUID):
    response = email_service.get_message_status(msgId=message_id)
    return response.get('status')


@router.get("/email/cancel-email/{message_id}", response={202: dict, codes_4xx: Message}, url_name="cancel_email")
def cancel_email_send(request, message_id: UUID):
    response = email_service.cancel_email(msgId=message_id)
    return response.json()


@router.get("/email/send-from-template", response={201: dict, codes_4xx: Message}, url_name="send_email_from_template")
def send_email_from_template(request):
    response = email_service.merge_template_and_send()
    return response.json()


##### POST #####
@router.post("/email/send", response={201: dict, codes_4xx: Message}, url_name="send_email")
@authorize(AppRole.get_all_authorized_app_roles())
def send_email(request, email_data: EmailOutData):
    response = email_service.send_email(email_data)
    return response.json()


##### DELETE #####
