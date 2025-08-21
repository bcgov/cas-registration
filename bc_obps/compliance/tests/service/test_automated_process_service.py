import pytest
from unittest.mock import patch
from compliance.service.automated_process_service import AutomatedProcessService
from model_bakery.baker import make_recipe

pytestmark = pytest.mark.django_db


class TestAutomatedProcessService:
    @patch('compliance.service.automated_process_service.ElicensingDataRefreshService.refresh_data_by_invoice')
    def test_refresh_all_obligation_invoices_calls_refresh_for_each_invoice(self, mock_refresh_data):
        invoice1 = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='INV-001')
        invoice2 = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='INV-002')
        invoice3 = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='INV-003')

        AutomatedProcessService.refresh_all_obligation_invoices()

        assert mock_refresh_data.call_count == 3
        expected_calls = [
            {'client_operator_id': invoice1.elicensing_client_operator.id, 'invoice_number': 'INV-001'},
            {'client_operator_id': invoice2.elicensing_client_operator.id, 'invoice_number': 'INV-002'},
            {'client_operator_id': invoice3.elicensing_client_operator.id, 'invoice_number': 'INV-003'},
        ]
        actual_calls = []
        for call in mock_refresh_data.call_args_list:
            actual_calls.append(
                {
                    'client_operator_id': call.kwargs['client_operator_id'],
                    'invoice_number': call.kwargs['invoice_number'],
                }
            )

        assert sorted(actual_calls, key=lambda x: x['invoice_number']) == sorted(
            expected_calls, key=lambda x: x['invoice_number']
        )
