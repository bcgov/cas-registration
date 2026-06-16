from dataclasses import dataclass

from common.lib.dataclasses.asdict import asdict


@dataclass
class Child:
    value: int
    optional_value: str | None = None


@dataclass
class Parent:
    name: str
    child: Child
    optional_field: str | None = None


class TestAsdict:
    def test_returns_nested_dataclass_as_dict(self):
        subject = Parent(name="parent", child=Child(value=1, optional_value="child"))

        assert asdict(subject) == {
            "name": "parent",
            "child": {"value": 1, "optional_value": "child"},
            "optional_field": None,
        }

    def test_include_limits_top_level_fields(self):
        subject = Parent(name="parent", child=Child(value=1), optional_field="kept")

        assert asdict(subject, include={"name", "optional_field"}) == {
            "name": "parent",
            "optional_field": "kept",
        }

    def test_exclude_none_removes_none_values(self):
        subject = Parent(name="parent", child=Child(value=1), optional_field=None)

        assert asdict(subject, exclude_none=True) == {
            "name": "parent",
            "child": {"value": 1},
        }

    def test_include_and_exclude_none_together(self):
        subject = Parent(name="parent", child=Child(value=1), optional_field=None)

        assert asdict(subject, include={"name", "optional_field"}, exclude_none=True) == {
            "name": "parent",
        }
