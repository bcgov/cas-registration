from registration.models import Operation
from registration.tests.utils.helpers import CommonTestSetup
from registration.tests.utils.helpers import TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationBcghgIdEndpoint(CommonTestSetup):
    def test_authorized_role_can_issue_id(self):
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        # facility
        baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
        )

        response = TestUtils.mock_patch_with_auth_role(
            self,
            'cas_director',
            self.content_type,
            {},
            custom_reverse_lazy(
                "operation_bcghg_id",
                kwargs={'operation_id': operation.id},
            ),
        )
        assert response.status_code == 200
        assert response.json() == {'id': '14862100001'}  # '1' and '486210' come from the recipe's mock data

    def test_authorized_role_can_set_bcghghid_manually(self):
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        # facility
        baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
        )

        response = TestUtils.mock_patch_with_auth_role(
            self,
            'cas_director',
            self.content_type,
            {
                'bcghg_id': '21234567890',
            },
            custom_reverse_lazy(
                "operation_bcghg_id",
                kwargs={'operation_id': operation.id},
            ),
        )
        assert response.status_code == 200
        assert response.json() == {'id': '21234567890'}  # '1' and '486210' come from the recipe's mock data

    def test_authorized_role_can_clear_id(self):
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
            bcghg_id=baker.make_recipe('registration.tests.utils.bcghg_id', id='11234567890'),
        )

        response = TestUtils.mock_delete_with_auth_role(
            self,
            'cas_director',
            custom_reverse_lazy(
                "delete_operation_bcghg_id",
                kwargs={'operation_id': operation.id},
            ),
        )
        assert response.status_code == 200

        operation.refresh_from_db()
        assert operation.bcghg_id is None
