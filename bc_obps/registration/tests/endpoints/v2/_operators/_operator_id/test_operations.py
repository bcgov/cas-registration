from itertools import cycle
from unittest.mock import patch, MagicMock
from uuid import uuid4
from model_bakery import baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestOperatorIdOperations(CommonTestSetup):
    @patch(
        'service.operation_designated_operator_timeline_service.OperationDesignatedOperatorTimelineService.list_timeline_by_operator_id'
    )
    def test_list_timeline_by_operator_id(self, mock_list_timeline_by_operator_id: MagicMock):
        operator_id = uuid4()
        operation_designated_operator_timelines = baker.make_recipe(
            'utils.operation_designated_operator_timeline',
            operation=cycle(baker.make_recipe('utils.operation', _quantity=2)),
            _quantity=2,
        )
        mock_list_timeline_by_operator_id.return_value = operation_designated_operator_timelines
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_analyst",
            custom_reverse_lazy("list_operations_by_operator_id", kwargs={"operator_id": operator_id}),
        )

        mock_list_timeline_by_operator_id.assert_called_once_with(operator_id)
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 2
        assert response_json[0].keys() == {'id', 'name'}
