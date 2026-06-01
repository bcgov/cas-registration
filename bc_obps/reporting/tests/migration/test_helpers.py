from datetime import date
from unittest.mock import MagicMock, mock_open, patch

import pytest

from reporting.migrations._helpers import (
    ACTIVITY_SCHEMA_MAPPING,
    ACTIVITY_SCHEMA_MAPPING_2025,
    ACTIVITY_SOURCE_TYPE_SCHEMA_MAPPING,
    load_activity_schemas_from_json,
    load_source_type_schemas_from_json,
)


FAKE_SCHEMA = {"type": "object", "title": "fake"}


def _build_fake_apps():
    """
    Build a fake `apps` registry where every call to apps.get_model(...)
    returns the same MagicMock model. The model's manager records every
    .objects.create / .objects.get / .objects.create_or_update call so the
    test can introspect them afterwards.
    """
    fake_model = MagicMock(name="Model")
    # apps.get_model returns the same model regardless of (app, model_name)
    fake_apps = MagicMock(name="apps")
    fake_apps.get_model.return_value = fake_model

    # Configuration.objects.get(slug='2025') must return an object exposing
    # valid_from / valid_to attributes used downstream.
    fake_config = MagicMock(name="Configuration(2025)")
    fake_config.valid_from = date(2025, 1, 1)
    fake_config.valid_to = date(2099, 12, 31)
    fake_model.objects.get.return_value = fake_config

    return fake_apps, fake_model


@pytest.fixture
def fake_apps_and_model():
    return _build_fake_apps()


@patch("reporting.migrations._helpers.json.load", return_value=FAKE_SCHEMA)
@patch("reporting.migrations._helpers.open", new_callable=mock_open, create=True)
def test_load_source_type_schemas_from_json(mock_open_fn, mock_json_load, fake_apps_and_model):
    fake_apps, fake_model = fake_apps_and_model

    load_source_type_schemas_from_json(fake_apps, schema_editor=None)

    expected = 139  # =len(ACTIVITY_SOURCE_TYPE_SCHEMA_MAPPING)

    # One open() + json.load() per mapping entry.
    assert mock_open_fn.call_count == expected
    assert mock_json_load.call_count == expected

    # One ActivitySourceTypeJsonSchema.objects.update_or_create() per mapping entry.
    assert fake_model.objects.update_or_create.call_count == expected

    # Every opened path uses the per-tuple directory_path / schema_dir / file_name
    opened_paths = [call.args[0] for call in mock_open_fn.call_args_list]
    for (_, directory_path, schema_dir, file_name, *_), path in zip(ACTIVITY_SOURCE_TYPE_SCHEMA_MAPPING, opened_paths):
        expected_suffix = f"/{directory_path}/{schema_dir}/{file_name}.json"
        assert path.endswith(expected_suffix), f"unexpected schema path: {path}"

    # Check kwargs passed to update_or_create()
    for index, call in enumerate(fake_model.objects.update_or_create.call_args_list):
        kwargs = dict(call.kwargs)
        activity_slug, _, _, _, source_type_json_key, has_unit, has_fuel = ACTIVITY_SOURCE_TYPE_SCHEMA_MAPPING[index]
        assert kwargs["has_unit"] == has_unit
        assert kwargs["has_fuel"] == has_fuel
        assert kwargs["defaults"]["json_schema"] == FAKE_SCHEMA

    # Activity / SourceType lookups were performed by name
    lookup_kwargs = [call.kwargs for call in fake_model.objects.get.call_args_list]
    assert {"slug": activity_slug} in lookup_kwargs
    assert {"json_key": source_type_json_key} in lookup_kwargs


@patch("reporting.migrations._helpers.json.load", return_value=FAKE_SCHEMA)
@patch("reporting.migrations._helpers.open", new_callable=mock_open, create=True)
def test_load_activity_schemas_from_json(mock_open_fn, mock_json_load, fake_apps_and_model):
    fake_apps, fake_model = fake_apps_and_model

    load_activity_schemas_from_json(fake_apps, schema_editor=None)

    expected = len(ACTIVITY_SCHEMA_MAPPING) + len(ACTIVITY_SCHEMA_MAPPING_2025)
    assert mock_open_fn.call_count == expected
    assert mock_json_load.call_count == expected
    assert fake_model.objects.update_or_create.call_count == expected

    opened_paths = [call.args[0] for call in mock_open_fn.call_args_list]

    # First paths correspond to the 2024 mapping
    for (_, schema_slug), path in zip(ACTIVITY_SCHEMA_MAPPING, opened_paths):
        assert path.endswith(f"/reporting/json_schemas/2024/{schema_slug}/activity.json")

    # remaining paths correspond to the 2025 mapping
    for (_, schema_slug), path in zip(ACTIVITY_SCHEMA_MAPPING_2025, opened_paths[len(ACTIVITY_SCHEMA_MAPPING) :]):
        assert path.endswith(f"/reporting/json_schemas/2025/{schema_slug}/activity.json")
