from model_bakery.baker import make_recipe
import pytest
from registration.models.operation import Operation
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators import (
    report_regulated_product_presence,
)


regulated_products_required_purposes = [
    Operation.Purposes.OBPS_REGULATED_OPERATION,
    Operation.Purposes.OPTED_IN_OPERATION,
    Operation.Purposes.NEW_ENTRANT_OPERATION,
]

regulated_products_not_required_purposes = [
    Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
    Operation.Purposes.REPORTING_OPERATION,
    Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
]


@pytest.mark.django_db
class TestOperationRegulatedProductsSelectedValidator:
    def test_all_purposes_are_evaluated(self):
        assert set(regulated_products_required_purposes).union(regulated_products_not_required_purposes) == set(
            Operation.Purposes
        )

    @pytest.mark.parametrize(
        "reg_purpose",
        regulated_products_required_purposes,
    )
    def test_warning_if_no_regulated_products_selected(self, reg_purpose):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            registration_purpose=reg_purpose,
        )
        report_operation.regulated_products.clear()

        result = report_regulated_product_presence.validate(report_operation.report_version)

        assert result == {
            "missing_regulated_product": ReportValidationError(
                Severity.WARNING,
                (
                    "No regulated products selected on Review Operation Information. "
                    "Expected one or more regulated products to be selected. "
                    "If the correct products are selected, you may continue."
                ),
                key=ReportValidationErrorKey.MISSING_REGULATED_PRODUCT,
                context=ErrorContext(report_version_id=report_operation.report_version.id),
            )
        }

    @pytest.mark.parametrize(
        "reg_purpose",
        regulated_products_required_purposes,
    )
    def test_warning_if_only_unregulated_products_selected(self, reg_purpose):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            registration_purpose=reg_purpose,
        )

        unregulated_product = make_recipe(
            'registration.tests.utils.regulated_product',
            name="Unregulated product",
            unit="tonnes",
            is_regulated=False,
        )

        report_operation.regulated_products.set([unregulated_product])

        result = report_regulated_product_presence.validate(report_operation.report_version)

        assert result == {
            "missing_regulated_product": ReportValidationError(
                Severity.WARNING,
                (
                    "No regulated products selected on Review Operation Information. "
                    "Expected one or more regulated products to be selected. "
                    "If the correct products are selected, you may continue."
                ),
                key=ReportValidationErrorKey.MISSING_REGULATED_PRODUCT,
                context=ErrorContext(report_version_id=report_operation.report_version.id),
            )
        }

    @pytest.mark.parametrize(
        "reg_purpose",
        regulated_products_required_purposes,
    )
    def test_succeeds_if_regulated_product_selected(self, reg_purpose):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            registration_purpose=reg_purpose,
        )

        regulated_product = make_recipe(
            'registration.tests.utils.regulated_product',
            name="Regulated product",
            unit="tonnes",
            is_regulated=True,
        )

        report_operation.regulated_products.set([regulated_product])

        result = report_regulated_product_presence.validate(report_operation.report_version)

        assert not result

    @pytest.mark.parametrize(
        "reg_purpose",
        regulated_products_not_required_purposes,
    )
    def test_succeeds_if_regulated_products_not_required(self, reg_purpose):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            registration_purpose=reg_purpose,
        )
        report_operation.regulated_products.clear()

        result = report_regulated_product_presence.validate(report_operation.report_version)

        assert not result
