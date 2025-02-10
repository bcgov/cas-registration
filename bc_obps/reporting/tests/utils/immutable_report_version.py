from django.db import ProgrammingError, transaction
from model_bakery import baker
import pytest


# Wrapping this in an atomic transaction
def assert_immutable_report_version(
    recipe_path: str,
    str_field_to_update: str = "json_data",
    path_to_report_version: str = "report_version",
):
    """
    A default test that asserts a model is immutable after its report_version is submitted.

    @param str_field_to_update: The field to use to make a change on the tested model.
                                 It should be a CharField or JsonField instance.

    @param path_to_report_version: The django-style path to the report version, e.g. "report_version", "parent_model__report_version", etc.

    """

    report_version = baker.make_recipe(
        "reporting.tests.utils.report_version",
        status="Draft",
    )
    model_under_test = baker.make_recipe(
        recipe_path,
        **{path_to_report_version: report_version},
    )

    setattr(model_under_test, str_field_to_update, "{'test': 'allow change'}")
    model_under_test.save()

    report_version.status = "Submitted"
    report_version.save()

    with transaction.atomic():
        with pytest.raises(
            ProgrammingError,
            match=r".* record is immutable after a report version has been submitted",
        ):
            setattr(model_under_test, str_field_to_update, "{'test': 'forbid change'}")
            model_under_test.save()
