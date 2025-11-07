from bc_obps.storage_backends import add_filename_suffix
from django.test import SimpleTestCase


class TestStorageBackends(SimpleTestCase):
    def test_add_file_suffix(self):
        # Adds _copy by default
        assert add_filename_suffix("test/case/test_file.ext") == "test/case/test_file_copy.ext"

        # Allows to specify a suffix
        assert add_filename_suffix("case/test/file_test.txe", "suffix") == "case/test/file_testsuffix.txe"

        # Empty cases don't break
        assert add_filename_suffix("f", "") == "f"
        assert add_filename_suffix("", "") == ""
