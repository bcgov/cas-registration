import pytest
from typing import List
from model_bakery import baker

from registration.models import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestChangingRegistrationPurpose(CommonTestSetup):
    def _prepare_test_data(self, registration_purpose):
        self.approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        contact = baker.make_recipe('utils.contact')
        self.operation = baker.make_recipe(
            'utils.operation',
            created_by=self.user,
            operator=self.approved_user_operator.operator,
            registration_purpose=registration_purpose,
            contacts=[contact],
        )

    def _set_new_registration_purpose(self, new_purpose):
        operation_payload = {"registration_purpose": new_purpose}
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            operation_payload,
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': self.operation.id}),
        )
        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_registration_submission(self):
        response = TestUtils.mock_patch_with_auth_role()

    @pytest.mark.parametrize("original_purpose", List[Operation.Purposes])
    @pytest.mark.parametrize("new_purpose", List[Operation.Purposes])
    def test_changing_registration_purpose(self, original_purpose, new_purpose):
        ### set original registration_purpose and save the operation
        self._prepare_test_data(original_purpose)

        ### change to new_purpose
        self._set_new_registration_purpose(new_purpose)

        ### Assertions
