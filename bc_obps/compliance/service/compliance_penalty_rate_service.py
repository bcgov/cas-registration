from compliance.models.compliance_penalty_rate import CompliancePenaltyRate


class CompliancePenaltyRateService:
    """
    Service for managing compliance penalty rate
    """

    @classmethod
    def get_current_compliance_penalty_rate(cls) -> CompliancePenaltyRate:
        """
        Gets the compliance penalty rate for the current compliance period
        """
        return CompliancePenaltyRate.objects.get(is_current_rate=True)
