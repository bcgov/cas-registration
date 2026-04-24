from reporting.service.reporting_flow_applicability import SECTION_APPLICABLE_FLOWS
from reporting.service.reporting_flow_service import ReportingFlow


class TestReportingFlowApplicability:
    def test_review_operation_information_flows(self):
        flows = SECTION_APPLICABLE_FLOWS["review_operation_information"]

        assert flows == {
            ReportingFlow.EIO,
            ReportingFlow.SFO,
            ReportingFlow.LFO,
            ReportingFlow.NEW_ENTRANT_SFO,
            ReportingFlow.NEW_ENTRANT_LFO,
            ReportingFlow.REPORTING_ONLY_SFO,
            ReportingFlow.REPORTING_ONLY_LFO,
        }

    def test_person_responsible_flows(self):
        flows = SECTION_APPLICABLE_FLOWS["person_responsible"]

        assert flows == {
            ReportingFlow.EIO,
            ReportingFlow.SFO,
            ReportingFlow.LFO,
            ReportingFlow.NEW_ENTRANT_SFO,
            ReportingFlow.NEW_ENTRANT_LFO,
            ReportingFlow.REPORTING_ONLY_SFO,
            ReportingFlow.REPORTING_ONLY_LFO,
        }

    def test_review_facilities_flows(self):
        flows = SECTION_APPLICABLE_FLOWS["review_facilities"]

        assert flows == {
            ReportingFlow.LFO,
            ReportingFlow.NEW_ENTRANT_LFO,
            ReportingFlow.REPORTING_ONLY_LFO,
        }

        assert ReportingFlow.SFO not in flows
        assert ReportingFlow.EIO not in flows

    def test_review_facility_information_flows(self):
        flows = SECTION_APPLICABLE_FLOWS["review_facility_information"]

        assert flows == {
            ReportingFlow.EIO,
            ReportingFlow.SFO,
            ReportingFlow.LFO,
            ReportingFlow.NEW_ENTRANT_SFO,
            ReportingFlow.NEW_ENTRANT_LFO,
            ReportingFlow.REPORTING_ONLY_SFO,
            ReportingFlow.REPORTING_ONLY_LFO,
        }

    def test_non_attributable_emissions_flows(self):
        flows = SECTION_APPLICABLE_FLOWS["non_attributable_emissions"]

        assert flows == {
            ReportingFlow.SFO,
            ReportingFlow.LFO,
            ReportingFlow.NEW_ENTRANT_SFO,
            ReportingFlow.NEW_ENTRANT_LFO,
            ReportingFlow.REPORTING_ONLY_SFO,
            ReportingFlow.REPORTING_ONLY_LFO,
        }

        assert ReportingFlow.EIO not in flows

    def test_production_data_flows(self):
        flows = SECTION_APPLICABLE_FLOWS["production_data"]

        assert flows == {
            ReportingFlow.SFO,
            ReportingFlow.LFO,
            ReportingFlow.NEW_ENTRANT_SFO,
            ReportingFlow.NEW_ENTRANT_LFO,
        }

        assert ReportingFlow.REPORTING_ONLY_SFO not in flows
        assert ReportingFlow.REPORTING_ONLY_LFO not in flows

    def test_additional_reporting_data_flows(self):
        flows = SECTION_APPLICABLE_FLOWS["additional_reporting_data"]

        assert flows == {
            ReportingFlow.SFO,
            ReportingFlow.LFO,
            ReportingFlow.NEW_ENTRANT_SFO,
            ReportingFlow.NEW_ENTRANT_LFO,
            ReportingFlow.REPORTING_ONLY_SFO,
            ReportingFlow.REPORTING_ONLY_LFO,
        }

        assert ReportingFlow.EIO not in flows

    def test_new_entrant_information_flows(self):
        flows = SECTION_APPLICABLE_FLOWS["new_entrant_information"]

        assert flows == {
            ReportingFlow.NEW_ENTRANT_SFO,
            ReportingFlow.NEW_ENTRANT_LFO,
        }

        assert ReportingFlow.SFO not in flows
        assert ReportingFlow.LFO not in flows
        assert ReportingFlow.EIO not in flows
