from unittest.mock import patch

from compliance.service.elicensing.elicensing_link_service import ELicensingLinkService
import pytest
from django.contrib.contenttypes.models import ContentType
from model_bakery import baker

from compliance.models.elicensing_link import ELicensingLink
from registration.models.operator import Operator


@pytest.fixture
def content_type():
    """Create ContentType object for Operator model"""
    return ContentType.objects.get_for_model(Operator)


@pytest.fixture
def operator():
    """Create an Operator instance"""
    return baker.make_recipe('registration.tests.utils.operator')


@pytest.fixture
def elicensing_link(operator, content_type):
    """Create an ELicensingLink instance"""
    return baker.make_recipe(
        'compliance.tests.utils.elicensing_link',
        content_type=content_type,
        object_id=str(operator.id),
    )


class TestELicensingLinkService:
    """Tests for the ELicensingLinkService class"""

    @pytest.mark.django_db
    @patch('compliance.service.elicensing.elicensing_link_service.ContentType.objects.get_for_model')
    def test_get_link_for_model_success(self, mock_get_for_model, operator, content_type, elicensing_link):
        """Test getting an existing link for a model"""
        # Set up mocks
        mock_get_for_model.return_value = content_type

        # Call the method
        result = ELicensingLinkService.get_link_for_model(Operator, operator.id)

        # Verify results
        assert result == elicensing_link

        # Verify the right methods were called with correct parameters
        mock_get_for_model.assert_called_once_with(Operator)

    @pytest.mark.django_db
    @patch('compliance.service.elicensing.elicensing_link_service.ContentType.objects.get_for_model')
    def test_get_link_for_model_not_found(self, mock_get_for_model, operator, content_type):
        """Test getting a link that doesn't exist"""
        # Set up mocks
        mock_get_for_model.return_value = content_type

        # Call the method
        result = ELicensingLinkService.get_link_for_model(Operator, operator.id)

        # Verify results
        assert result is None

        # Verify the right methods were called with correct parameters
        mock_get_for_model.assert_called_once_with(Operator)

    @pytest.mark.django_db
    @patch('compliance.service.elicensing.elicensing_link_service.ContentType.objects.get_for_model')
    def test_get_link_for_model_with_custom_elicensing_object_kind(
        self, mock_get_for_model, operator, content_type, elicensing_link
    ):
        """Test getting a link with a custom elicensing object kind"""
        # Set up mocks
        mock_get_for_model.return_value = content_type
        custom_kind = ELicensingLink.ObjectKind.INVOICE
        elicensing_link.elicensing_object_kind = custom_kind
        elicensing_link.save()

        # Call the method
        result = ELicensingLinkService.get_link_for_model(Operator, operator.id, elicensing_object_kind=custom_kind)

        # Verify results
        assert result == elicensing_link

        # Verify the right methods were called with correct parameters
        mock_get_for_model.assert_called_once_with(Operator)
