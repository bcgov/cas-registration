import logging
import uuid
from typing import Dict, Any, Optional
from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

from service.elicensing_api_client import ELicensingAPIClient
from service.operator_elicensing_service import OperatorELicensingService
from service.elicensing_link_service import ELicensingLinkService
from service.compliance_fee_service import ComplianceFeeService
from compliance.models import ComplianceFee, ELicensingLink
import requests

logger = logging.getLogger(__name__)

# Create a singleton instance for use throughout this service
elicensing_api_client = ELicensingAPIClient()


class FeeELicensingService:
    """
    Service for managing fee-related eLicensing operations.
    This service handles syncing fee data between the system and eLicensing.
    """

    @classmethod
    def _map_fee_to_elicensing_data(cls, fee: ComplianceFee, fee_link: ELicensingLink) -> Dict[str, Any]:
        """
        Map fee data to eLicensing fee data format.

        Args:
            fee: The fee object
            fee_link: The eLicensing link object for the fee

        Returns:
            A dictionary with fee data in the format expected by the eLicensing API
        """
        return {
            "fees": [
                {
                    "businessAreaCode": fee.business_area_code,
                    "feeGUID": str(fee_link.elicensing_guid),
                    "feeProfileGroupName": fee.fee_profile_group_name,
                    "feeDescription": fee.fee_description,
                    "feeAmount": float(fee.fee_amount),
                    "feeDate": fee.fee_date.strftime("%Y-%m-%d")
                }
            ]
        }

    @classmethod
    @transaction.atomic
    def sync_fee_with_elicensing(cls, fee_id: int) -> Optional[ELicensingLink]:
        """
        Syncs a compliance fee with the eLicensing system by creating a fee record.
        
        Args:
            fee_id: The ID of the compliance fee to sync
            
        Returns:
            The ELicensingLink object if successful, None if there was an error
            
        Raises:
            ComplianceFee.DoesNotExist: If the fee doesn't exist
        """
        try:
            fee = ComplianceFee.objects.get(id=fee_id)
            operator = fee.compliance_obligation.compliance_summary.report.operator
            
            # Check if the fee has already been synced
            existing_link = ELicensingLinkService.get_link_for_model(
                ComplianceFee, fee.id, elicensing_object_kind=ELicensingLink.ObjectKind.FEE
            )
            
            if existing_link and existing_link.elicensing_object_id is not None:
                if fee.status == ComplianceFee.FeeStatus.SYNCED:
                    logger.info(f"Fee {fee_id} has already been synced with eLicensing")
                    return existing_link
                # If fee exists in eLicensing but status isn't SYNCED, we'll update the status
            
            # Ensure an eLicensing client exists for the operator
            client_link = OperatorELicensingService.sync_client_with_elicensing(operator.id)
            
            if client_link is None or not client_link.elicensing_object_id:
                logger.error(f"No eLicensing client found for operator {operator.id}")
                return None
            
            # Create a new ELicensingLink for this fee if it doesn't exist
            if not existing_link:
                fee_link = ELicensingLink(
                    content_type=ContentType.objects.get_for_model(ComplianceFee),
                    object_id=fee.id,
                    elicensing_object_kind=ELicensingLink.ObjectKind.FEE,
                    last_sync_at=timezone.now(),
                    sync_status="PENDING",
                )
                fee_link.save()
            else:
                fee_link = existing_link
                fee_link.sync_status = "PENDING"
                fee_link.last_sync_at = timezone.now()
                fee_link.save()
            
            # Prepare fee data for eLicensing API
            fee_data = cls._map_fee_to_elicensing_data(fee, fee_link)
            
            # Make the API call
            try:
                response = elicensing_api_client.create_fees(
                    client_link.elicensing_object_id, 
                    fee_data
                )
                
                # Update the link and fee with the response data
                for fee_result in response.get("fees", []):
                    if fee_result.get("feeGUID") == str(fee_link.elicensing_guid):
                        fee_link.elicensing_object_id = fee_result.get("feeObjectId")
                        fee_link.sync_status = "SUCCESS"
                        fee_link.save()
                        
                        fee.elicensing_fee_object_id = fee_result.get("feeObjectId")
                        ComplianceFeeService.update_fee_status(fee.id, ComplianceFee.FeeStatus.SYNCED)
                        
                        logger.info(f"Successfully synced fee {fee.id} with eLicensing")
                        return fee_link
                
                logger.error(f"Failed to find matching fee GUID in eLicensing response")
                return None
                
            except requests.RequestException as e:
                logger.error(f"eLicensing API request failed for fee {fee_id}: {str(e)}")
                fee_link.sync_status = "FAILED"
                fee_link.save()
                return None
            
        except ComplianceFee.DoesNotExist:
            logger.error(f"Compliance fee with ID {fee_id} does not exist")
            return None
        except Exception as e:
            logger.error(f"Error syncing fee {fee_id} with eLicensing: {str(e)}")
            raise 