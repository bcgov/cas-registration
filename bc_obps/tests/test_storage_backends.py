from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from bc_obps.storage_backends import SimpleLocal, UnifiedGcsStorage, add_filename_suffix
from django.conf import settings
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


class TestSimpleLocalStorageBackend(SimpleTestCase):
    def test_duplicate_file(self):
        storage_backend_under_test = SimpleLocal()
        storage_backend_under_test.location = "test/location"

        with patch("shutil.copy2") as mock_copy:
            return_value = storage_backend_under_test.duplicate_file("path/test_file.abc")
            mock_copy.assert_called_once_with(
                "test/location/path/test_file.abc",
                "test/location/path/test_file_copy.abc",
            )
            assert return_value == "path/test_file_copy.abc"


class TestUnifiedGcsStorage(SimpleTestCase):
    @patch("bc_obps.storage_backends.GoogleCloudStorage")
    def test_duplicate_file(self, mock_gcs):
        settings.GS_UNSCANNED_BUCKET_NAME = "unscanned"
        settings.GS_QUARANTINED_BUCKET_NAME = "quarantine"
        settings.GS_CLEAN_BUCKET_NAME = "clean"

        gcs_instance = MagicMock()
        gcs_instance.bucket.copy_blob.return_value = SimpleNamespace(name="test_return_value")
        mock_gcs.return_value = gcs_instance

        storage_backend_under_test = UnifiedGcsStorage()

        return_value = storage_backend_under_test.duplicate_file("path/test_file.abc")

        assert return_value == "test_return_value"
        gcs_instance.bucket.copy_blob.assert_called_once()
