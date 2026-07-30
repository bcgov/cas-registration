from model_bakery.baker import make, make_recipe, prepare_recipe
import pytest
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
            SystemError,
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
            SystemError,
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
            SystemError,
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
            SystemError,
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
