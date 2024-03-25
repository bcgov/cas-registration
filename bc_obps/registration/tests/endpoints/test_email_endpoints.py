import json
from registration.email.schema import BodyType, EmailIn, TemplateMergeIn, ContextObject
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from registration.models import AppRole


class TestEmailEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + 'email'

    def test_email_service_health_check(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy("email_health_check"))
        assert response.status_code == 200
        response_json = json.loads(response.content)
        assert isinstance(response_json, dict)

    def test_get_message_status(self):
        # first need to send an email so we can get a message_id
        email_data = EmailIn(
            to=['andrea.williams@gov.bc.ca'],
            subject='Another Automated Test Email',
            body='Testing get_message_status',
            bodyType=BodyType.TEXT,
            send_from="andrea.williams@gov.bc.ca",
        )
        # CHES API wants payload with keyword 'from', which Python doesn't allow because 'from' is a reserved keyword,
        # hence this hack.
        email_data_dict = email_data.dict()
        email_data_dict["from"] = email_data_dict["send_from"]
        post_response = TestUtils.mock_post_with_auth_role(
            self,
            "cas_admin",
            'application/json',
            json.dumps(email_data_dict),
            endpoint=custom_reverse_lazy("send_email"),
        )

        assert post_response.status_code == 200
        # convert post_response.content (a bytes-array) to a string and then to json
        post_response_json = json.loads(post_response.content.decode('utf8').replace("'", '"'))
        # store the messageId received in the post_response
        message_id = post_response_json.get('messages')[0].get('msgId')

        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy("email_check_status", kwargs={"message_id": message_id}),
        )
        assert response.status_code == 200
        response_json = json.loads(response.content)
        assert isinstance(response_json, str)
        # depending on the timing of the CHES system, the email we just requested to send might have already been sent
        # in which case the status will be "completed", or it might still be in the queue for sending, in which case
        # the status will be "pending".
        # Accepting either status so that this unit test is not flaky.
        assert response_json == "completed" or "pending"

    def test_get_message_status_unauthorized_role(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("email_check_status", kwargs={"message_id": "56968b39-8af5-46e4-867a-8ac8c798ba38"}),
        )
        assert response.status_code == 401

    def test_send_email_all_authorized_irc_roles(self):
        all_irc_roles = AppRole.get_authorized_irc_roles()
        email_data = EmailIn(
            to=['andrea.williams@gov.bc.ca'],
            subject='Automated Test Email',
            body="This is a CHES test email from me to me.",
            bodyType=BodyType.TEXT,
            send_from="andrea.williams@gov.bc.ca",
        )
        email_data_dict = email_data.dict()
        for role_name in all_irc_roles:
            email_data_dict['body'] = f'This is a CHES test email from me to me as a {role_name} user'
            response = TestUtils.mock_post_with_auth_role(
                self,
                role_name,
                'application/json',
                json.dumps(email_data_dict),
                endpoint=custom_reverse_lazy("send_email"),
            )
            assert response.status_code == 200
            assert response.json().get('errors') is None

    def test_merge_template_and_send(self):
        all_irc_roles = AppRole.get_authorized_irc_roles()

        context_1 = ContextObject(
            to=['andrea.williams@gov.bc.ca'],
            tag='unit_test',
            context={'something': {'greeting': 'Howdy', 'target': 'Pardner'}, 'someone': {'user': 'Woody'}},
        ).dict()

        context_2 = ContextObject(
            to=['andrea.williams@gov.bc.ca'],
            tag='template_unit_test',
            context={
                'something': {'greeting': 'To Infinity and Beyond', 'target': 'Earthlings'},
                'someone': {'user': 'Buzz Lightyear'},
            },
        ).dict()

        email_template = TemplateMergeIn(
            bodyType='text',
            send_from='andrea.williams@gov.bc.ca',
            subject='Automated Test - Email Template Merge',
            body='{{ something.greeting }} {{ something.target }}\n\nMoooooooo\n\nFrom {{ someone.user }} the {{ someone.role }}',
            contexts=[context_1, context_2],
        )
        email_template_dict = email_template.dict()

        for role_name in all_irc_roles:
            for context in email_template_dict.get('contexts'):
                context['context']['someone']['role'] = role_name

            response = TestUtils.mock_post_with_auth_role(
                self,
                role_name,
                'application/json',
                json.dumps(email_template_dict),
                endpoint=custom_reverse_lazy("send_email_from_template"),
            )
            assert response.status_code == 200
            assert response.json().get('errors') is None
