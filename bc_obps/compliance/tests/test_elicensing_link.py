import uuid
from django.test import TestCase
from compliance.models.elicensing_link import ELicensingLink
from registration.models.operator import Operator
from datetime import datetime
from django.contrib.contenttypes.models import ContentType


class TestELicensingLink(TestCase):
    """Tests for the ELicensingLink model"""

    def setUp(self):
        """Set up the test environment before each test"""
        # Create a test operator
        self.operator = Operator.objects.create(
            id=uuid.uuid4(),
            legal_name="Test Operator",
            cra_business_number=123456789,
            bc_corporate_registry_number="BC1234567",
        )
        self.operator_content_type = ContentType.objects.get_for_model(Operator)

    def test_create_elicensing_link(self):
        """Test creating an ELicensingLink"""
        now = datetime.now()
        link = ELicensingLink.objects.create(
            content_type=self.operator_content_type,
            object_id=self.operator.id,
            elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT,
            elicensing_object_id="12345",
            last_sync_at=now,
            sync_status="SUCCESS",
        )

        # Verify that the link was created
        assert link.id is not None
        assert link.elicensing_guid is not None
        assert link.content_object == self.operator
        assert link.elicensing_object_id == "12345"
        assert isinstance(link.id, int)
        assert isinstance(link.elicensing_guid, uuid.UUID)
        assert link.last_sync_at == now
        assert link.sync_status == "SUCCESS"

    def test_operator_relationship(self):
        """Test the relationship between ELicensingLink and Operator"""
        link = ELicensingLink.objects.create(
            content_type=self.operator_content_type,
            object_id=self.operator.id,
            elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT,
            elicensing_object_id="12345",
        )

        # Verify the content_object relationship works
        assert link.content_object == self.operator

    def test_unique_operator_constraint(self):
        """Test that an operator can only have one ELicensingLink for each elicensing_object_kind"""
        # Create a link
        _ = ELicensingLink.objects.create(
            content_type=self.operator_content_type,
            object_id=self.operator.id,
            elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT,
            elicensing_object_id="12345",
        )

        # Try to create another link for the same operator with same elicensing_object_kind
        with self.assertRaises(Exception):
            _ = ELicensingLink.objects.create(
                content_type=self.operator_content_type,
                object_id=self.operator.id,
                elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT,
                elicensing_object_id="67890",
            )

        # Should be able to create a link with a different elicensing_object_kind
        invoice_link = ELicensingLink.objects.create(
            content_type=self.operator_content_type,
            object_id=self.operator.id,
            elicensing_object_kind=ELicensingLink.ObjectKind.INVOICE,
            elicensing_object_id="INV-12345",
        )

        assert invoice_link.id is not None
        assert invoice_link.elicensing_guid is not None
        assert invoice_link.content_object == self.operator
        assert invoice_link.elicensing_object_kind == ELicensingLink.ObjectKind.INVOICE
