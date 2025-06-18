from django.test import TestCase
from decimal import Decimal
from dataclasses import dataclass


@dataclass
class TestInvoiceQueryResponse:
    invoiceOutstandingBalance: Decimal


class TestComplianceDashboardService(TestCase):
    """Tests for the ComplianceDashboardService class"""
