from unittest.mock import MagicMock
from django.core.cache import caches
from model_bakery.baker import prepare_recipe
import pytest
from registration.models.activity import Activity
from reporting.models.configuration import Configuration
from reporting.models.source_type import SourceType
from service.form_builder_service import build_source_type_schema, handle_source_type_schema


pytestmark = pytest.mark.django_db


class TestHandleSourceTypeMethod:
    gas_type_enum = ["CAS", "GGIRCS"]
    gas_type_one_of = {"gas_type": "one_of"}

    def test_handle_source_type_schema_with_both_unit_and_fuel(self):
        json_schema = {
            "properties": {
                "units": {
                    "items": {
                        "properties": {
                            "fuels": {
                                "items": {
                                    "properties": {
                                        "fuelType": {"properties": {"fuelName": {"enum": []}}},
                                        "emissions": {
                                            "items": {
                                                "properties": {"gasType": {"enum": []}},
                                                "dependencies": {},
                                            },
                                        },
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=True,
            has_fuel=True,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            len(
                returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"][
                    "fuelType"
                ]["properties"]["fuelName"]["enum"]
            )
            > 0
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"][
                "items"
            ]["properties"]["gasType"]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"][
                "items"
            ]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_unit_and_no_fuel(self):
        json_schema = {
            "properties": {
                "units": {
                    "items": {
                        "properties": {
                            "emissions": {
                                "items": {
                                    "properties": {"gasType": {"enum": []}},
                                    "dependencies": {},
                                },
                            },
                        },
                    }
                }
            }
        }

        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=True,
            has_fuel=False,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["properties"][
                "gasType"
            ]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_fuel_and_no_unit(self):
        json_schema = {
            "properties": {
                "fuels": {
                    "items": {
                        "properties": {
                            "fuelType": {"properties": {"fuelName": {"enum": []}}},
                            "emissions": {
                                "items": {
                                    "properties": {"gasType": {"enum": []}},
                                    "dependencies": {},
                                },
                            },
                        }
                    }
                }
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=False,
            has_fuel=True,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            len(
                returned_schema["properties"]["fuels"]["items"]["properties"]["fuelType"]["properties"]["fuelName"][
                    "enum"
                ]
            )
            > 0
        )
        assert (
            returned_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["properties"][
                "gasType"
            ]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_no_fuel_nor_unit(self):
        json_schema = {
            "properties": {
                "emissions": {
                    "items": {
                        "properties": {"gasType": {"enum": []}},
                        "dependencies": {},
                    }
                },
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=False,
            has_fuel=False,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            returned_schema["properties"]["emissions"]["items"]["properties"]["gasType"]["enum"] == self.gas_type_enum
        )
        assert returned_schema["properties"]["emissions"]["items"]["dependencies"] == self.gas_type_one_of

    def test_form_builder_uses_cache(self):

        mock_cache = MagicMock()
        caches["form_builder"] = mock_cache

        config_id = Configuration.objects.first().id
        activity_id = Activity.objects.first().id
        source_type_id = SourceType.objects.first().id

        # Nothing in cache, so the 'set' method is called
        mock_cache.get.return_value = None
        build_source_type_schema(config_id, activity_id, source_type_id)

        assert len(mock_cache.get.mock_calls) == 1
        mock_cache.get.assert_called_once_with(f"{config_id}-{activity_id}-{source_type_id}")
        assert len(mock_cache.set.mock_calls) == 1

        mock_cache.reset_mock()

        # Something in cache, so the 'set' method is not called
        # And we return the cached value
        mock_cache.get.return_value = "cached"
        return_value = build_source_type_schema(config_id, activity_id, source_type_id)
        assert return_value == "cached"
        assert len(mock_cache.get.mock_calls) == 1
        assert len(mock_cache.set.mock_calls) == 0
