from uuid import UUID
from registration.email.schema import EmailOutData
from registration.email.emailService import EmailService
from .api_base import router
from ninja.responses import codes_4xx
from registration.schema import Message

email_service = EmailService()


##### GET #####
@router.get("/email/health_check", response={200: None, codes_4xx: Message}, url_name="email_health_check")
def get_email_health_check(request):
    print("Requesting health check")
    return email_service.health_check()


@router.get("/email/send_to_dev", response={201: None, codes_4xx: Message}, url_name="email_dev")
def send_dev_email(request):
    print("Sending test email to dev")
    email_data: EmailOutData = {
        'to': ['andrea.williams@gov.bc.ca', 'andrea.k.williams7@gmail.com'],
        'subject': 'Test Email',
        'body': "This is a CHES test email from me to me.",
        'bodyType': "text",
        'from': "andrea.williams@gov.bc.ca",
    }
    return email_service.send_email(email_data)


@router.get("/email/check_status/{message_id}", response={200: str, codes_4xx: Message}, url_name="email_check_status")
def check_email_status(request, message_id: UUID):
    response = email_service.get_message_status(msgId=message_id)
    print(response.json())
    return response.json().get('status')


##### POST #####


##### PUT #####


##### DELETE #####
