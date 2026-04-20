from reporting.service.reporting_flow_service import ReportingFlow


SECTION_APPLICABLE_FLOWS: dict[str, set[ReportingFlow]] = {
    "review_operation_information": {
        ReportingFlow.EIO,
        ReportingFlow.SFO,
        ReportingFlow.LFO,
        ReportingFlow.NEW_ENTRANT_SFO,
        ReportingFlow.NEW_ENTRANT_LFO,
        ReportingFlow.REPORTING_ONLY_SFO,
        ReportingFlow.REPORTING_ONLY_LFO,
    },
    "person_responsible": {
        ReportingFlow.EIO,
        ReportingFlow.SFO,
        ReportingFlow.LFO,
        ReportingFlow.NEW_ENTRANT_SFO,
        ReportingFlow.NEW_ENTRANT_LFO,
        ReportingFlow.REPORTING_ONLY_SFO,
        ReportingFlow.REPORTING_ONLY_LFO,
    },
    "review_facilities": {
        ReportingFlow.EIO,
        ReportingFlow.SFO,
        ReportingFlow.LFO,
        ReportingFlow.NEW_ENTRANT_SFO,
        ReportingFlow.NEW_ENTRANT_LFO,
        ReportingFlow.REPORTING_ONLY_SFO,
        ReportingFlow.REPORTING_ONLY_LFO,
    },
    "non_attributable_emissions": {
        ReportingFlow.SFO,
        ReportingFlow.LFO,
        ReportingFlow.NEW_ENTRANT_SFO,
        ReportingFlow.NEW_ENTRANT_LFO,
        ReportingFlow.REPORTING_ONLY_SFO,
        ReportingFlow.REPORTING_ONLY_LFO,
    },
    "production_data": {
        ReportingFlow.SFO,
        ReportingFlow.LFO,
        ReportingFlow.NEW_ENTRANT_SFO,
        ReportingFlow.NEW_ENTRANT_LFO,
    },
    "allocation_of_emissions": {
        ReportingFlow.SFO,
        ReportingFlow.LFO,
        ReportingFlow.NEW_ENTRANT_SFO,
        ReportingFlow.NEW_ENTRANT_LFO,
    },
    "new_entrant_information": {
        ReportingFlow.NEW_ENTRANT_SFO,
        ReportingFlow.NEW_ENTRANT_LFO,
    },
    "compliance_summary": {
        ReportingFlow.SFO,
        ReportingFlow.LFO,
        ReportingFlow.NEW_ENTRANT_SFO,
        ReportingFlow.NEW_ENTRANT_LFO,
    },
}
