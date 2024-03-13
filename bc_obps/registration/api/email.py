from uuid import UUID
from registration.email.schema import EmailOutData
from registration.email.emailService import EmailService
from .api_base import router
from ninja.responses import codes_4xx
from registration.schema import Message

email_service = EmailService()


##### GET #####
@router.get("/email/health-check", response={200: bool, codes_4xx: Message}, url_name="email_health_check")
def get_email_health_check(request):
    print("Requesting health check")
    return email_service.health_check()


# TODO : delete this route - only used for testing POC
@router.get("/email/send-to-dev", response={200: dict, codes_4xx: Message}, url_name="email_dev")
def send_dev_email(_):
    print("Sending test email to dev")
    email_data: EmailOutData = {
        'to': ['andrea.williams@gov.bc.ca'],
        'subject': 'Test Email 4',
        'body': "This is a CHES test email from me to me.",
        'bodyType': "text",
        'from': "andrea.williams@gov.bc.ca",
    }
    return email_service.send_email(email_data)


@router.get("/email/check-status/{message_id}", response={200: str, codes_4xx: Message}, url_name="email_check_status")
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


##### DELETE #####
