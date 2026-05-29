from unittest.mock import MagicMock, patch

import pytest
from model_bakery.baker import make_recipe

from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags

REPORT_VALIDATION_SERVICE_PATH = "reporting.service.report_validation.report_validation_service"
RESOLVE_FLOW_PATH = f"{REPORT_VALIDATION_SERVICE_PATH}.resolve_flow"


@pytest.fixture
def mock_validation_plugins():
    original_plugins = ReportValidationService.validation_plugins

    def _set_plugins(plugins):
        ReportValidationService.validation_plugins = plugins
        return plugins

    yield _set_plugins

    ReportValidationService.validation_plugins = original_plugins


@pytest.fixture
def mock_resolve_flow():
    with patch(RESOLVE_FLOW_PATH) as mock:
        mock.return_value = "TEST_FLOW"
        yield mock


@pytest.mark.django_db
class TestReportValidationService:
    def test_initializes_with_the_proper_plugins(self):
        plugin_names = [p.__name__ for p in ReportValidationService.validation_plugins]

        assert plugin_names == [
            "reporting.service.report_validation.validators.operation_boroid_presence",
            "reporting.service.report_validation.validators.mandatory_verification_statement",
            "reporting.service.report_validation.validators.report_attachments_are_scanned",
            "reporting.service.report_validation.validators.supplementary_report_version_change",
            "reporting.service.report_validation.validators.supplementary_report_attachments_confirmation",
            "reporting.service.report_validation.validators.report_activity_json_validation",
            "reporting.service.report_validation.validators.report_emission_allocation_validator",
            "reporting.service.report_validation.validators.report_emission_allocation_other_excluded_category",
            "reporting.service.report_validation.validators.report_data_by_fuel_type_validator",
            "reporting.service.report_validation.validators.report_regulated_product_presence",
            "reporting.service.report_validation.validators.reporting_configuration_validator",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_operation_information",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_person_responsible",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_activity_data",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_review_facilities",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_review_facility_information",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_non_attributable_emissions",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_production_data",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_emission_allocation",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_additional_data",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_new_entrant_information",
            "reporting.service.report_validation.validators.required_fields.required_fields_report_electricity_import_data",
        ]

    def test_validates_the_report_with_the_registered_plugins(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        plugins = mock_validation_plugins(
            [
                MagicMock(TAGS=[ValidationTags.ON_SUBMIT]),
                MagicMock(TAGS=[ValidationTags.ON_SUBMIT]),
                MagicMock(TAGS=[ValidationTags.REPORT_VALIDATION]),
                MagicMock(TAGS=[]),
            ]
        )

        plugins[0].validate.return_value = {"mock_key": "mock_errors"}
        plugins[1].validate.return_value = {"mock_key2": "mock_errors2"}

        report_version = make_recipe("reporting.tests.utils.report_version")

        errors = ReportValidationService.validate_report_version(
            report_version.id,
            ValidationTags.ON_SUBMIT,
        )

        mock_resolve_flow.assert_called_once_with(report_version)
        plugins[0].validate.assert_called_once_with(report_version)
        plugins[1].validate.assert_called_once_with(report_version)
        plugins[2].validate.assert_not_called()
        plugins[3].validate.assert_not_called()

        assert errors == {
            "mock_key": "mock_errors",
            "mock_key2": "mock_errors2",
        }

    def test_validator_runs_if_it_has_multiple_tags_including_requested_tag(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        mock_plugin = MagicMock(
            TAGS=[ValidationTags.ON_SUBMIT, ValidationTags.REPORT_VALIDATION],
        )
        mock_plugin.validate.return_value = {"multi_tag": "error"}

        mock_validation_plugins([mock_plugin])

        report_version = make_recipe("reporting.tests.utils.report_version")

        errors = ReportValidationService.validate_report_version(
            report_version.id,
            ValidationTags.ON_SUBMIT,
        )

        mock_resolve_flow.assert_called_once_with(report_version)
        mock_plugin.validate.assert_called_once_with(report_version)
        assert errors == {"multi_tag": "error"}

    def test_validates_the_report_with_all_plugins_if_tag_is_none(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        plugins = mock_validation_plugins(
            [
                MagicMock(TAGS=[ValidationTags.ON_SUBMIT]),
                MagicMock(TAGS=[]),
                MagicMock(TAGS=[]),
            ]
        )

        report_version = make_recipe("reporting.tests.utils.report_version")

        ReportValidationService.validate_report_version(report_version.id)

        mock_resolve_flow.assert_called_once_with(report_version)
        plugins[0].validate.assert_called_once_with(report_version)
        plugins[1].validate.assert_called_once_with(report_version)
        plugins[2].validate.assert_called_once_with(report_version)

    def test_skips_validator_when_applies_returns_false(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        mock_plugin = MagicMock(TAGS=[ValidationTags.ON_SUBMIT])
        mock_plugin.applies.return_value = False
        mock_plugin.validate.return_value = {"mock_key": "mock_error"}

        mock_validation_plugins([mock_plugin])

        report_version = make_recipe("reporting.tests.utils.report_version")

        errors = ReportValidationService.validate_report_version(
            report_version.id,
            ValidationTags.ON_SUBMIT,
        )

        mock_resolve_flow.assert_called_once_with(report_version)
        mock_plugin.applies.assert_called_once_with("TEST_FLOW")
        mock_plugin.validate.assert_not_called()
        assert errors == {}

    def test_runs_validator_when_applies_returns_true(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        mock_plugin = MagicMock(TAGS=[ValidationTags.ON_SUBMIT])
        mock_plugin.applies.return_value = True
        mock_plugin.validate.return_value = {"mock_key": "mock_error"}

        mock_validation_plugins([mock_plugin])

        report_version = make_recipe("reporting.tests.utils.report_version")

        errors = ReportValidationService.validate_report_version(
            report_version.id,
            ValidationTags.ON_SUBMIT,
        )

        mock_resolve_flow.assert_called_once_with(report_version)
        mock_plugin.applies.assert_called_once_with("TEST_FLOW")
        mock_plugin.validate.assert_called_once_with(report_version)
        assert errors == {"mock_key": "mock_error"}

    def test_validator_without_applies_still_runs(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        mock_plugin = MagicMock(TAGS=[ValidationTags.ON_SUBMIT])
        del mock_plugin.applies
        mock_plugin.validate.return_value = {"mock_key": "mock_error"}

        mock_validation_plugins([mock_plugin])

        report_version = make_recipe("reporting.tests.utils.report_version")

        errors = ReportValidationService.validate_report_version(
            report_version.id,
            ValidationTags.ON_SUBMIT,
        )

        mock_resolve_flow.assert_called_once_with(report_version)
        mock_plugin.validate.assert_called_once_with(report_version)
        assert errors == {"mock_key": "mock_error"}

    def test_applies_exception_bubbles_up(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        mock_plugin = MagicMock(TAGS=[ValidationTags.ON_SUBMIT])
        mock_plugin.applies.side_effect = RuntimeError("applies failed")

        mock_validation_plugins([mock_plugin])

        report_version = make_recipe("reporting.tests.utils.report_version")

        with pytest.raises(RuntimeError, match="applies failed"):
            ReportValidationService.validate_report_version(
                report_version.id,
                ValidationTags.ON_SUBMIT,
            )

        mock_resolve_flow.assert_called_once_with(report_version)
        mock_plugin.applies.assert_called_once_with("TEST_FLOW")
        mock_plugin.validate.assert_not_called()

    def test_validate_exception_bubbles_up(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        mock_plugin = MagicMock(TAGS=[ValidationTags.ON_SUBMIT])
        mock_plugin.validate.side_effect = RuntimeError("validate failed")

        mock_validation_plugins([mock_plugin])

        report_version = make_recipe("reporting.tests.utils.report_version")

        with pytest.raises(RuntimeError, match="validate failed"):
            ReportValidationService.validate_report_version(
                report_version.id,
                ValidationTags.ON_SUBMIT,
            )

        mock_resolve_flow.assert_called_once_with(report_version)

    def test_resolves_flow_once_and_passes_it_to_applies(
        self,
        mock_validation_plugins,
        mock_resolve_flow,
    ):
        mock_plugin = MagicMock(TAGS=[ValidationTags.ON_SUBMIT])
        mock_plugin.applies.return_value = True
        mock_plugin.validate.return_value = {}

        mock_validation_plugins([mock_plugin])

        report_version = make_recipe("reporting.tests.utils.report_version")

        ReportValidationService.validate_report_version(
            report_version.id,
            ValidationTags.ON_SUBMIT,
        )

        mock_resolve_flow.assert_called_once_with(report_version)
        mock_plugin.applies.assert_called_once_with("TEST_FLOW")
