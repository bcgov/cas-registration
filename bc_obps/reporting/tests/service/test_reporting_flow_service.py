import pytest
from model_bakery import baker

from registration.models.operation import Operation
from reporting.service.reporting_flow_service import ReportingFlow, resolve_flow

pytestmark = pytest.mark.django_db


class TestResolveFlow:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.report_operation = baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
        )

    def set_operation_context(self, *, operation_type, registration_purpose):
        self.report_operation.operation_type = operation_type
        self.report_operation.registration_purpose = registration_purpose
        self.report_operation.save()

    def test_returns_eio_for_electricity_import_operation(self):
        self.set_operation_context(
            operation_type=Operation.Types.SFO,
            registration_purpose=Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
        )

        result = resolve_flow(self.report_version)

        assert result == ReportingFlow.EIO

    def test_returns_sfo_for_standard_single_facility_operation(self):
        self.set_operation_context(
            operation_type=Operation.Types.SFO,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        result = resolve_flow(self.report_version)

        assert result == ReportingFlow.SFO

    def test_returns_new_entrant_sfo_for_new_entrant_single_facility_operation(self):
        self.set_operation_context(
            operation_type=Operation.Types.SFO,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
        )

        result = resolve_flow(self.report_version)

        assert result == ReportingFlow.NEW_ENTRANT_SFO

    def test_returns_reporting_only_sfo_for_reporting_only_single_facility_operation(self):
        self.set_operation_context(
            operation_type=Operation.Types.SFO,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
        )

        result = resolve_flow(self.report_version)

        assert result == ReportingFlow.REPORTING_ONLY_SFO

    def test_returns_lfo_for_standard_linear_facility_operation(self):
        self.set_operation_context(
            operation_type=Operation.Types.LFO,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        result = resolve_flow(self.report_version)

        assert result == ReportingFlow.LFO

    def test_returns_new_entrant_lfo_for_new_entrant_linear_facility_operation(self):
        self.set_operation_context(
            operation_type=Operation.Types.LFO,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
        )

        result = resolve_flow(self.report_version)

        assert result == ReportingFlow.NEW_ENTRANT_LFO

    def test_returns_reporting_only_lfo_for_reporting_only_linear_facility_operation(self):
        self.set_operation_context(
            operation_type=Operation.Types.LFO,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
        )

        result = resolve_flow(self.report_version)

        assert result == ReportingFlow.REPORTING_ONLY_LFO

    def test_raises_value_error_for_unhandled_operation_type_and_registration_purpose(
        self,
    ):
        self.set_operation_context(
            operation_type="UNKNOWN_TYPE",
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        with pytest.raises(
            ValueError,
            match="Unable to resolve reporting flow",
        ):
            resolve_flow(self.report_version)
