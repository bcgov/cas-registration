from django.test import SimpleTestCase
from reporting.service.utils import retrieve_ids


class TestReportActivitySaveServiceUtils(SimpleTestCase):

    def test_gets_non_none_ids_from_a_dict(self):
        assert retrieve_ids({"a": {"id": 1}, "b": {"test": 1}, "c": {"id": "test"}, "d": {"id": None}}) == [1, "test"]

    def test_gets_non_none_ids_from_a_list(self):
        assert retrieve_ids([{}, {"test": 1}, {"id": 2}, {"id": None}, {"id": 3}]) == [2, 3]
