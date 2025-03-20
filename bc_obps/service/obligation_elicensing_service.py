import logging
import uuid
from typing import Optional
from django.db import transaction

from compliance.models import ComplianceObligation, ComplianceFee
from service.fee_elicensing_service import FeeELicensingService
from service.compliance_fee_service import ComplianceFeeService
import requests

logger = logging.getLogger(__name__)


class ObligationELicensingService:
    """
    Service for managing Compliance Obligation-related eLicensing operations.
    This service handles eLicensing integration for compliance obligations,
    including fee creation and synchronization with the eLicensing system.
    """

    @classmethod
    def process_obligation_integration(cls, obligation_id: int) -> bool:
        """
        Processes the full eLicensing integration for a compliance obligation.
        This includes creating a fee and syncing it with eLicensing.
        
        Args:
            obligation_id: The ID of the compliance obligation to process
            
        Returns:
            bool: True if all integration steps completed successfully, False otherwise
        """
        try:
            # Validate the obligation exists
            obligation = ComplianceObligation.objects.get(id=obligation_id)
            
            # First step: Ensure there's a fee for this obligation
            fee = cls._ensure_obligation_fee(obligation_id)
            if not fee:
                logger.warning(f"Failed to create or retrieve fee for obligation {obligation_id}")
                return False
                
            # Second step: Sync the fee with eLicensing
            fee_link = FeeELicensingService.sync_fee_with_elicensing(fee.id)
            if not fee_link:
                logger.warning(f"Failed to sync fee {fee.id} for obligation {obligation_id} with eLicensing")
                return False
                
            logger.info(f"Successfully processed obligation {obligation_id} integration with eLicensing")
            return True
            
        except ComplianceObligation.DoesNotExist:
            logger.error(f"Compliance obligation with ID {obligation_id} does not exist")
            return False
        except requests.RequestException as e:
            logger.error(f"eLicensing API error during obligation {obligation_id} integration: {str(e)}", exc_info=True)
            return False
        except Exception as e:
            logger.error(f"Unexpected error processing obligation {obligation_id} integration: {str(e)}", exc_info=True)
            return False
    
    @classmethod
    def _ensure_obligation_fee(cls, obligation_id: int) -> Optional[ComplianceFee]:
        """
        Ensures a fee exists for the given obligation, creating one if needed.
        
        Args:
            obligation_id: The ID of the compliance obligation
            
        Returns:
            The ComplianceFee object if it exists or was created successfully, None otherwise
        """
        try:
            # Check if a fee already exists for this obligation
            existing_fees = ComplianceFee.objects.filter(compliance_obligation_id=obligation_id)
            if existing_fees.exists():
                return existing_fees.first()
                
            # Create a new fee if one doesn't exist
            return ComplianceFeeService.create_compliance_fee(obligation_id)
            
        except Exception as e:
            logger.error(f"Error ensuring fee for obligation {obligation_id}: {str(e)}", exc_info=True)
            return None 