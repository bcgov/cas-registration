import pytest
from unittest.mock import patch, MagicMock
from compliance.service.automated_process.automated_process_service import AutomatedProcessService
from model_bakery.baker import make_recipe

pytestmark = pytest.mark.django_db


class TestAutomatedProcessService:
    @patch('compliance.service.automated_process.automated_process_service.ComplianceHandlerManager')
    @patch(
        'compliance.service.automated_process.automated_process_service.ElicensingDataRefreshService.refresh_data_by_invoice'
    )
    def test_run_scheduled_compliance_sync(self, mock_refresh_data, mock_handler_manager_class):
        # Setup mock handler manager
        mock_handler_manager = MagicMock()
        mock_handler_manager_class.return_value = mock_handler_manager

        invoice1 = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='INV-001')
        invoice2 = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='INV-002')
        invoice3 = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='INV-003')

        AutomatedProcessService.run_scheduled_compliance_sync()

        # Verify refresh_data_by_invoice is called for each invoice
        assert mock_refresh_data.call_count == 3
        expected_refresh_calls = [
            {'client_operator_id': invoice1.elicensing_client_operator.id, 'invoice_number': 'INV-001'},
            {'client_operator_id': invoice2.elicensing_client_operator.id, 'invoice_number': 'INV-002'},
            {'client_operator_id': invoice3.elicensing_client_operator.id, 'invoice_number': 'INV-003'},
        ]
        actual_refresh_calls = []
        for call in mock_refresh_data.call_args_list:
            actual_refresh_calls.append(
                {
                    'client_operator_id': call.kwargs['client_operator_id'],
                    'invoice_number': call.kwargs['invoice_number'],
                }
            )

        assert sorted(actual_refresh_calls, key=lambda x: x['invoice_number']) == sorted(
            expected_refresh_calls, key=lambda x: x['invoice_number']
        )

        assert mock_handler_manager_class.call_count == 3
        assert mock_handler_manager.process_compliance_updates.call_count == 3
        # Get all the invoice arguments passed to process_compliance_updates
        compliance_update_calls = mock_handler_manager.process_compliance_updates.call_args_list
        invoice_numbers_processed = []
        for call in compliance_update_calls:
            invoice = call[0][0]
            invoice_numbers_processed.append(invoice.invoice_number)

        expected_invoice_numbers = ['INV-001', 'INV-002', 'INV-003']
        assert sorted(invoice_numbers_processed) == sorted(expected_invoice_numbers)
