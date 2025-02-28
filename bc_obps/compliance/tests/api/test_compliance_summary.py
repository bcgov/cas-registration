from decimal import Decimal
import pytest
from django.test import Client
from model_bakery import baker
from compliance.models import ComplianceSummary, ComplianceObligation


class TestComplianceSummaryEndpoint:
    endpoint_under_test = "/api/compliance/summaries"
    client = Client()

    @pytest.fixture
    def mock_user(self):
        return baker.make('registration.User')

    def test_get_compliance_summaries(self, mock_user):
        # Arrange
        self.client.force_login(mock_user)

        # Create test data using recipes
        op = baker.make_recipe('registration.tests.utils.operation', bcghg_id__identifier='BC1234')
        baker.make_recipe(
            'registration.tests.utils.user_operator', user=mock_user, operator=op.operator, status='Approved'
        )

        # Create compliance summary with related objects
        mock_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.compliance_summary',
            report__operation=op,
            compliance_status=ComplianceSummary.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        baker.make_recipe('compliance.tests.utils.compliance_product', compliance_summary=mock_compliance_summary)
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_summary=mock_compliance_summary,
            status=ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET,
        )

        # Act
        response = self.client.get(self.endpoint_under_test)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        summary = data[0]
        assert summary['id'] == mock_compliance_summary.id
        assert summary['operation_name'] == mock_compliance_summary.report.operation.name
        assert summary['reporting_year'] == mock_compliance_summary.compliance_period.end_date.year
        assert Decimal(summary['excess_emissions']) == mock_compliance_summary.excess_emissions

    def test_get_compliance_summaries_unauthorized(self):
        # Act
        response = self.client.get(self.endpoint_under_test)

        # Assert
        assert response.status_code == 401

    def test_get_compliance_summaries_no_data(self, mock_user):
        # Arrange
        self.client.force_login(mock_user)
        op = baker.make_recipe('registration.tests.utils.operation')
        baker.make_recipe(
            'registration.tests.utils.user_operator', user=mock_user, operator=op.operator, status='Approved'
        )

        # Act
        response = self.client.get(self.endpoint_under_test)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_compliance_summary_by_id(self, mock_user):
        # Arrange
        self.client.force_login(mock_user)

        # Create test data using recipes
        op = baker.make_recipe('registration.tests.utils.operation', bcghg_id__identifier='BC1234')
        baker.make_recipe(
            'registration.tests.utils.user_operator', user=mock_user, operator=op.operator, status='Approved'
        )

        # Create compliance summary with related objects
        mock_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.compliance_summary',
            report__operation=op,
            compliance_status=ComplianceSummary.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        mock_compliance_product = baker.make_recipe(
            'compliance.tests.utils.compliance_product', compliance_summary=mock_compliance_summary
        )

        mock_compliance_obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_summary=mock_compliance_summary,
            status=ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET,
        )

        # Act
        response = self.client.get(f"{self.endpoint_under_test}/{mock_compliance_summary.id}")

        # Assert
        assert response.status_code == 200
        summary = response.json()
        assert summary['operation_name'] == mock_compliance_summary.report.operation.name
        assert summary['operation_bcghg_id'] == mock_compliance_summary.report.operation.bcghg_id.identifier
        assert summary['reporting_year'] == mock_compliance_summary.compliance_period.end_date.year
        assert (
            Decimal(summary['emissions_attributable_for_reporting'])
            == mock_compliance_summary.emissions_attributable_for_reporting
        )
        assert Decimal(summary['reporting_only_emissions']) == mock_compliance_summary.reporting_only_emissions
        assert (
            Decimal(summary['emissions_attributable_for_compliance'])
            == mock_compliance_summary.emissions_attributable_for_compliance
        )
        assert Decimal(summary['emission_limit']) == mock_compliance_summary.emission_limit
        assert Decimal(summary['excess_emissions']) == mock_compliance_summary.excess_emissions
        assert Decimal(summary['credited_emissions']) == mock_compliance_summary.credited_emissions
        assert Decimal(summary['reduction_factor']) == mock_compliance_summary.reduction_factor
        assert Decimal(summary['tightening_rate']) == mock_compliance_summary.tightening_rate
        assert summary['compliance_status'] == mock_compliance_summary.compliance_status

        assert len(summary['products']) == 1
        product = summary['products'][0]
        assert Decimal(product['annual_production']) == mock_compliance_product.annual_production
        assert Decimal(product['apr_dec_production']) == mock_compliance_product.apr_dec_production
        assert Decimal(product['emission_intensity']) == mock_compliance_product.emission_intensity
        assert (
            Decimal(product['allocated_industrial_process_emissions'])
            == mock_compliance_product.allocated_industrial_process_emissions
        )
        assert (
            Decimal(product['allocated_compliance_emissions']) == mock_compliance_product.allocated_compliance_emissions
        )

        assert summary['obligation'] is not None
        obligation = summary['obligation']
        assert Decimal(obligation['emissions_amount_tco2e']) == mock_compliance_obligation.emissions_amount_tco2e
        assert obligation['status'] == mock_compliance_obligation.status

    def test_get_compliance_summary_by_id_not_found(self, mock_user):
        # Arrange
        self.client.force_login(mock_user)
        op = baker.make_recipe('registration.tests.utils.operation')
        baker.make_recipe(
            'registration.tests.utils.user_operator', user=mock_user, operator=op.operator, status='Approved'
        )

        # Act
        response = self.client.get(f"{self.endpoint_under_test}/999")

        # Assert
        assert response.status_code == 404

    def test_get_compliance_summary_by_id_unauthorized(self):
        # Arrange
        mock_compliance_summary = baker.make_recipe('compliance.tests.utils.compliance_summary')

        # Act
        response = self.client.get(f"{self.endpoint_under_test}/{mock_compliance_summary.id}")

        # Assert
        assert response.status_code == 401
