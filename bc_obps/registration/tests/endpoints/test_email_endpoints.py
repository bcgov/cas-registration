import json
from registration.email.schema import BodyType, EmailIn
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
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy("email_check_status", kwargs={"message_id": "56968b39-8af5-46e4-867a-8ac8c798ba38"}),
        )
        assert response.status_code == 200
        response_json = json.loads(response.content)
        assert isinstance(response_json, str)
        assert response_json == "completed"

    def test_get_message_status_unauthorized_role(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("email_check_status", kwargs={"message_id": "56968b39-8af5-46e4-867a-8ac8c798ba38"}),
        )
        assert response.status_code == 401

    def test_send_email_all_authorized_roles(self):
        all_roles = AppRole.get_authorized_irc_roles()
        email_data = EmailIn(
            to=['andrea.williams@gov.bc.ca'],
            subject='Automated Test Email',
            body="This is a CHES test email from me to me.",
            bodyType=BodyType.TEXT,
            send_from="andrea.williams@gov.bc.ca",
        )
        email_data_dict = email_data.dict()
        # CHES API wants payload with keyword 'from', which Python doesn't allow because 'from' is a reserved keyword,
        # hence this hack.
        email_data_dict['from'] = email_data_dict['send_from']
        # must convert the BodyType enum to a string because "BodyType is not JSON serializable"
        email_data_dict['bodyType'] = BodyType(email_data_dict['bodyType']).value
        for role_name in all_roles:
            print(f'Testing role {role_name}...')
            email_data_dict['body'] = f'This is a CHES test email from me to me as a {role_name} user'
            response = TestUtils.mock_post_with_auth_role(
                self,
                role_name,
                'application/json',
                json.dumps(email_data_dict),
                endpoint=custom_reverse_lazy("send_email"),
            )
            assert response.status_code == 200
