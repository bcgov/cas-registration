from common.exceptions import InternalSystemError
from model_bakery.baker import make, make_recipe, prepare_recipe
import pytest
from registration.models.facility import Facility
from reporting.models.configuration_element import ConfigurationElement
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators import reporting_configuration_validator


@pytest.mark.django_db
class TestReportingConfigurationValidator:

    validator_under_test = reporting_configuration_validator

    def setup_method(self):
        self.report_version = make_recipe(
            "reporting.tests.utils.report_version", report__reporting_year__reporting_year=2018
        )
        self.configuration = make_recipe(
            "reporting.tests.utils.configuration", valid_from="2018-01-01", valid_to="2018-12-31"
        )

    def test_has_the_proper_configuration(self):
        assert self.validator_under_test.TAGS == [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]

    def test_raises_if_no_configuration_element_present(self):
        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
        )

        with pytest.raises(
            InternalSystemError,
            match=f"Missing configuration elements for report methodology IDs: {report_methodology.id}",
        ):
            self.validator_under_test.validate(self.report_version)

    def test_raises_if_configuration_doesnt_match_reporting_year(self):
        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
        )

        wrong_year_confguration = make_recipe(
            "reporting.tests.utils.configuration", valid_from="2011-01-01", valid_to="2012-12-31"
        )
        make(
            ConfigurationElement,
            activity=report_methodology.report_emission.report_source_type.report_activity.activity,
            source_type=report_methodology.report_emission.report_source_type.source_type,
            gas_type=report_methodology.report_emission.gas_type,
            methodology=report_methodology.methodology,
            valid_from=wrong_year_confguration,
            valid_to=wrong_year_confguration,
        )

        with pytest.raises(
            InternalSystemError,
            match=f"Missing configuration elements for report methodology IDs: {report_methodology.id}",
        ):
            self.validator_under_test.validate(self.report_version)

    def test_raises_if_configuration_doesnt_match_activity(self):
        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
        )
        wrong_activity = make_recipe("reporting.tests.utils.activity")

        make(
            ConfigurationElement,
            activity=wrong_activity,
            source_type=report_methodology.report_emission.report_source_type.source_type,
            gas_type=report_methodology.report_emission.gas_type,
            methodology=report_methodology.methodology,
            valid_from=self.configuration,
            valid_to=self.configuration,
        )

        with pytest.raises(
            InternalSystemError,
            match=f"Missing configuration elements for report methodology IDs: {report_methodology.id}",
        ):
            self.validator_under_test.validate(self.report_version)

    def test_raises_if_reported_fields_not_allowed_in_configuration_element(self):
        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
            json_data={"allowedField": "test data", "unexpectedField": 123},
        )

        make(
            ConfigurationElement,
            activity=report_methodology.report_emission.report_source_type.report_activity.activity,
            source_type=report_methodology.report_emission.report_source_type.source_type,
            gas_type=report_methodology.report_emission.gas_type,
            methodology=report_methodology.methodology,
            valid_from=self.configuration,
            valid_to=self.configuration,
            reporting_fields=[prepare_recipe("reporting.tests.utils.reporting_field", slug="allowedField")],
        )

        with pytest.raises(
            InternalSystemError,
            match=f"ReportMethodology ID {report_methodology.id} has reporting fields"
            " {'unexpectedField'} which are not in the allowed fields {'allowedField'} of its matching configuration element.",
        ):
            self.validator_under_test.validate(self.report_version)

    def test_passes_if_no_report_methodlogy_for_that_report_version(self):
        assert self.validator_under_test.validate(self.report_version) == {}

    def test_passes_with_fieldunits_field_reported(self):
        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
            json_data={
                "allowedField": "test data",
                "allowedFieldFieldUnits": "test units",
                "anotherAllowedReportingField": 111,
            },
        )

        allowed_fields = [
            prepare_recipe("reporting.tests.utils.reporting_field", slug="allowedField"),
            prepare_recipe("reporting.tests.utils.reporting_field", slug="anotherAllowedReportingField"),
            prepare_recipe("reporting.tests.utils.reporting_field", slug="unreportedField"),
        ]

        make(
            ConfigurationElement,
            activity=report_methodology.report_emission.report_source_type.report_activity.activity,
            source_type=report_methodology.report_emission.report_source_type.source_type,
            gas_type=report_methodology.report_emission.gas_type,
            methodology=report_methodology.methodology,
            valid_from=self.configuration,
            valid_to=self.configuration,
            reporting_fields=allowed_fields,
        )

        assert self.validator_under_test.validate(self.report_version) == {}

    def test_passes_with_not_applicable_methodology_for_allowed_facility_types(self):
        """
        Test that "Not Applicable" methodology is allowed for Small Aggregate and Medium Facility types.
        """
        not_applicable_methodology = make_recipe("reporting.tests.utils.methodology", name="Not Applicable")

        # Create report methodology with "Not Applicable" for a Small Aggregate facility
        # No json_data (no fields reported) for Not Applicable
        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
            methodology=not_applicable_methodology,
            json_data={},
        )

        # Update facility type to Small Aggregate
        report_methodology.report_emission.report_source_type.report_activity.facility_report.facility_type = (
            "Small Aggregate"
        )
        report_methodology.report_emission.report_source_type.report_activity.facility_report.save()

        # No configuration element needed for Not Applicable methodology
        assert self.validator_under_test.validate(self.report_version) == {}

    def test_passes_with_not_applicable_methodology_for_medium_facility(self):
        """
        Test that "Not Applicable" methodology is allowed for Medium Facility type.
        """
        not_applicable_methodology = make_recipe("reporting.tests.utils.methodology", name="Not Applicable")

        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
            methodology=not_applicable_methodology,
            json_data={},
        )

        # Update facility type to Medium Facility
        report_methodology.report_emission.report_source_type.report_activity.facility_report.facility_type = (
            "Medium Facility"
        )
        report_methodology.report_emission.report_source_type.report_activity.facility_report.save()

        assert self.validator_under_test.validate(self.report_version) == {}

    def test_returns_error_when_not_applicable_reported_by_disallowed_facility_type(self):
        """
        Test that an error is returned when "Not Applicable" methodology is reported by a facility type
        other than Small Aggregate or Medium Facility.
        """
        not_applicable_methodology = make_recipe("reporting.tests.utils.methodology", name="Not Applicable")

        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
            methodology=not_applicable_methodology,
            json_data={},
        )

        # Set facility type to something other than Small Aggregate or Medium Facility
        report_methodology.report_emission.report_source_type.report_activity.facility_report.facility_type = (
            "Large Facility"
        )
        report_methodology.report_emission.report_source_type.report_activity.facility_report.save()

        result = self.validator_under_test.validate(self.report_version)

        assert "not_applicable_methodology_reported" in result
        error = result["not_applicable_methodology_reported"]
        assert error.severity.name == "ERROR"
        assert "Only facilities of type Small Aggregate or Medium Facility" in error.message
        assert error.key.name == "NOT_APPLICABLE_METHODOLOGY_REPORTED"  # gitleaks:allow

    @pytest.mark.parametrize(
        "disallowed_facility_type",
        [
            Facility.Types.SINGLE_FACILITY,
            Facility.Types.LARGE_FACILITY,
            Facility.Types.ELECTRICITY_IMPORT,
        ],
    )
    def test_returns_error_when_not_applicable_with_other_facility_types(self, disallowed_facility_type):
        """
        Test error handling for various disallowed facility types.
        """
        not_applicable_methodology = make_recipe("reporting.tests.utils.methodology", name="Not Applicable")

        report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            report_version=self.report_version,
            methodology=not_applicable_methodology,
            json_data={},
        )

        report_methodology.report_emission.report_source_type.report_activity.facility_report.facility_type = (
            disallowed_facility_type
        )
        report_methodology.report_emission.report_source_type.report_activity.facility_report.save()

        result = self.validator_under_test.validate(self.report_version)

        assert (
            "not_applicable_methodology_reported" in result
        ), f"Expected error for facility type: {disallowed_facility_type}"
        error = result["not_applicable_methodology_reported"]
        assert error.severity.name == "ERROR"
