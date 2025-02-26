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

    @pytest.fixture
    def mock_operation(self):
        return baker.make('registration.Operation', bcghg_id__identifier='BC1234')

    @pytest.fixture
    def mock_user_operator(self, mock_user, mock_operation):
        return baker.make(
            'registration.UserOperator', user=mock_user, operator=mock_operation.operator, status='Approved'
        )

    @pytest.fixture
    def mock_compliance_period(self):
        return baker.make(
            'compliance.CompliancePeriod',
            start_date='2024-01-01',
            end_date='2024-12-31',
            compliance_deadline='2025-06-30',
        )

    @pytest.fixture
    def mock_report(self, mock_operation):
        return baker.make('reporting.Report', operation=mock_operation)

    @pytest.fixture
    def mock_report_version(self, mock_report):
        return baker.make('reporting.ReportVersion', report=mock_report)

    @pytest.fixture
    def mock_compliance_summary(self, mock_report, mock_report_version, mock_compliance_period):
        return baker.make(
            'compliance.ComplianceSummary',
            report=mock_report,
            current_report_version=mock_report_version,
            compliance_period=mock_compliance_period,
            emissions_attributable_for_reporting=Decimal('100.0'),
            reporting_only_emissions=Decimal('10.0'),
            emissions_attributable_for_compliance=Decimal('90.0'),
            emission_limit=Decimal('80.0'),
            excess_emissions=Decimal('10.0'),
            credited_emissions=Decimal('0.0'),
            reduction_factor=Decimal('0.95'),
            tightening_rate=Decimal('0.01'),
            compliance_status=ComplianceSummary.ComplianceStatus.OBLIGATION_NOT_MET,
        )

    @pytest.fixture
    def mock_compliance_product(self, mock_compliance_summary):
        return baker.make(
            'compliance.ComplianceProduct',
            compliance_summary=mock_compliance_summary,
            annual_production=Decimal('1000.0'),
            apr_dec_production=Decimal('750.0'),
            emission_intensity=Decimal('0.1'),
            allocated_industrial_process_emissions=Decimal('50.0'),
            allocated_compliance_emissions=Decimal('40.0'),
        )

    @pytest.fixture
    def mock_compliance_obligation(self, mock_compliance_summary):
        return baker.make(
            'compliance.ComplianceObligation',
            compliance_summary=mock_compliance_summary,
            emissions_amount_tco2e=Decimal('10.0'),
            status=ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET,
        )

    def test_get_compliance_summaries(
        self,
        mock_user,
        mock_user_operator,
        mock_compliance_summary,
        mock_compliance_product,
        mock_compliance_obligation,
    ):
        # Arrange
        self.client.force_login(mock_user)

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

    def test_get_compliance_summaries_no_data(self, mock_user, mock_user_operator):
        # Arrange
        self.client.force_login(mock_user)

        # Act
        response = self.client.get(self.endpoint_under_test)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_compliance_summary_by_id(
        self,
        mock_user,
        mock_user_operator,
        mock_compliance_summary,
        mock_compliance_product,
        mock_compliance_obligation,
    ):
        # Arrange
        self.client.force_login(mock_user)

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

    def test_get_compliance_summary_by_id_not_found(self, mock_user, mock_user_operator):
        # Arrange
        self.client.force_login(mock_user)

        # Act
        response = self.client.get(f"{self.endpoint_under_test}/999")

        # Assert
        assert response.status_code == 404

    def test_get_compliance_summary_by_id_unauthorized(self, mock_compliance_summary):
        # Act
        response = self.client.get(f"{self.endpoint_under_test}/{mock_compliance_summary.id}")

        # Assert
        assert response.status_code == 401
