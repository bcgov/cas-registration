from reporting.models.source_type import SourceType
from service.form_builder_service import FormBuilderService
import json
from typing import Dict, Tuple, Union, Type, Any


class ReportActivityValidationService:
    @staticmethod
    def validate_report_activity(activity_id: int, report_version_id: int, activity_data: dict) -> None:
        source_type_ids = []
        for source_type in activity_data['sourceTypes']:
            source_type_ids.append(SourceType.objects.get(json_key=source_type).id)

        activity_schema = json.loads(
            FormBuilderService.build_form_schema(activity_id, report_version_id, source_type_ids)
        )['schema']
        try:
            ReportActivityValidationService.validate_activity_data(activity_data, activity_schema)
        except ValueError as e:
            raise ValueError("Activity data validation failed ", e)

    @staticmethod
    def validate_activity_data(data: dict, schema: dict, path: str = "root") -> None:
        """
        A recursive function that validates 'data' against 'schema' to ensure:
            1) The data matches the schema's 'type'.
            2) If schema has 'enum', data is in that list.
            3) No extra fields in 'data' not found in the schema
            4) "oneOf": if schema has oneOf itself, 'data' must pass exactly one variant.

            This function assumes that:
             - "dependencies" and "oneOf" are the only schema keywords that
                can change the schema based on the data's content.
             - the dependent field for the "oneOf"s is always an enum.

        """

        # 1) If schema has "enum", check that data is in that list
        if "enum" in schema:
            if data not in schema["enum"]:
                raise ValueError(f"{path}: Value '{data}' not in allowed: {schema['enum']}")

        # 2) If schema specifies a "type", confirm data has the correct type (in Python)
        expected_type = schema.get("type")
        if expected_type:
            type_map: Dict[str, Union[Type[Any], Tuple[Type[Any], ...]]] = {
                "object": dict,
                "array": list,
                "string": str,
                "number": (int, float),
                "boolean": bool,
                "null": type(None),
            }
            if expected_type in type_map:
                if not isinstance(data, type_map[expected_type]):
                    raise ValueError(f"{path}: Expected '{expected_type}', got '{type(data).__name__}'")

        # 3) Handle object-type data (coalesce dependencies and check properties)
        if expected_type == "object":
            allowed_properties = dict(schema.get("properties", {}))
            dependencies = schema.get("dependencies", {})
            # For each dependency, find the relevant "oneOf" branch based on data[dep_field]
            for dep_field, dep_obj in dependencies.items():
                if dep_field in data and isinstance(dep_obj, dict):
                    one_of_list = dep_obj.get("oneOf", [])
                    # identify which branch’s 'properties' applies
                    matched_variant = None

                    # check each branch's properties[dep_field]
                    for variant in one_of_list:
                        variant_props = variant.get("properties", {})
                        # If variant has dep_field, and it's an enum, see if data[dep_field] matches
                        # note: all activity schema branches have dependant fields that are enums
                        if dep_field in variant_props:
                            if "enum" in variant_props[dep_field]:
                                allowed_values = variant_props[dep_field]["enum"]
                                if data[dep_field] in allowed_values:
                                    matched_variant = variant
                                    break

                    # if a matching branch is found, merge its properties in to list of allowed properties
                    if matched_variant:
                        allowed_properties.update(matched_variant.get("properties", {}))

            # check for unexpected fields
            for key in data:
                if key not in allowed_properties:
                    raise ValueError(f"{path}: Unexpected field '{key}'")

            # recursively validate each known field
            for key, subschema in allowed_properties.items():
                if key in data:
                    ReportActivityValidationService.validate_activity_data(data[key], subschema, path=f"{path}.{key}")

        # if it's an array, validate each item
        elif expected_type == "array":
            item_schema = schema.get("items", {})
            for i, element in enumerate(data):
                ReportActivityValidationService.validate_activity_data(element, item_schema, path=f"{path}[{i}]")
