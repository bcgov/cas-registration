import logging
import uuid
from typing import Dict, Any, Optional

from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from service.elicensing_api_client import ELicensingAPIClient
from service.elicensing_link_service import ELicensingLinkService
from registration.models.operator import Operator
from compliance.models.elicensing_link import ELicensingLink
import requests

logger = logging.getLogger(__name__)

# Create a singleton instance for use throughout this service
elicensing_api_client = ELicensingAPIClient()


class OperatorELicensingService:
    """
    Service for managing operator-related eLicensing operations.
    This service handles the mapping between operators and eLicensing clients,
    creating clients in eLicensing, and syncing data between systems.
    """

    @classmethod
    def _map_operator_to_client_data(
        cls, operator: Operator, existing_link: Optional[ELicensingLink] = None
    ) -> Dict[str, Any]:
        """
        Map operator data to eLicensing client data format.

        Args:
            operator: The operator object
            existing_link: Optional existing link to use for the GUID

        Returns:
            A dictionary with client data in the format expected by the eLicensing API
        """
        if existing_link is None:
            raise ValueError("Cannot map operator to client data without an existing link")

        client_guid = str(existing_link.elicensing_guid)

        client_data = {
            "clientGUID": client_guid,
            "companyName": operator.legal_name,
            "doingBusinessAs": operator.trade_name if operator.trade_name else "",
            "bcCompanyRegistrationNumber": operator.bc_corporate_registry_number or "",
            # Add default dateOfBirth as operators are companies, not individuals
            "dateOfBirth": "1970-01-01",
        }

        # Add address information if available
        if operator.physical_address:
            address = operator.physical_address
            client_data.update(
                {
                    "addressLine1": address.street_address or "",
                    "addressLine2": "",  # The Address model doesn't have additional_information field
                    "city": address.municipality or "",  # Using municipality instead of city
                    "stateProvince": address.province or "",
                    "postalCode": address.postal_code or "",
                    "country": "Canada",  # Default to Canada as Address model doesn't have country
                }
            )
        elif operator.mailing_address:
            # Fall back to mailing address if physical address is not available
            address = operator.mailing_address
            client_data.update(
                {
                    "addressLine1": address.street_address or "",
                    "addressLine2": "",  # The Address model doesn't have additional_information field
                    "city": address.municipality or "",  # Using municipality instead of city
                    "stateProvince": address.province or "",
                    "postalCode": address.postal_code or "",
                    "country": "Canada",  # Default to Canada as Address model doesn't have country
                }
            )
        else:
            # If no address is available, use placeholder values
            # These will need to be updated later
            client_data.update(
                {
                    "addressLine1": "Unknown",
                    "city": "Unknown",
                    "stateProvince": "BC",
                    "postalCode": "V0V0V0",
                    "country": "Canada",
                }
            )

        # Add at least one phone number (required by API)
        # Since we don't have direct phone number fields in the Operator model,
        # we'll use a placeholder value
        client_data["businessPhone"] = "0000000000"  # Placeholder

        return client_data

    @classmethod
    @transaction.atomic
    def ensure_client_exists(cls, operator_id: uuid.UUID) -> Optional[ELicensingLink]:
        """
        Ensure that an eLicensing client exists for the given operator.
        If a client already exists, return it. Otherwise, create a new client.

        Args:
            operator_id: The UUID of the operator

        Returns:
            The ELicensingLink object if successful, None if there was an error
        """
        # Check if a client already exists for this operator
        client_link = ELicensingLinkService.get_link_for_model(
            Operator, operator_id, elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT
        )

        if client_link and client_link.elicensing_object_id is not None:
            return client_link

        try:
            operator = Operator.objects.get(id=operator_id)
        except Operator.DoesNotExist:
            logger.error(f"Operator with ID {operator_id} does not exist")
            return None

        temp_link = ELicensingLink(
            content_type=ContentType.objects.get_for_model(Operator),
            object_id=operator.id,
            elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT,
            last_sync_at=timezone.now(),
            sync_status="PENDING",
        )

        client_data = cls._map_operator_to_client_data(operator, temp_link)

        try:
            response = elicensing_api_client.create_client(client_data)

            temp_link.elicensing_object_id = response['clientObjectId']
            temp_link.sync_status = "SUCCESS"
            temp_link.save()

            return temp_link
        except requests.RequestException as e:
            logger.error(f"eLicensing API request failed for operator {operator_id}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error creating client for operator {operator_id}: {str(e)}")
            return None
